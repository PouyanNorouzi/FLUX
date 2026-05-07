/**
 * PoUDb Recipe Repository
 *
 * Production implementation of the RecipeRepository contract backed by
 * poudb-client.
 *
 * Schema (V3 — three normalized tables):
 *   recipes     — title, modified_hex, yield_label, time_minutes, steps (string[]),
 *                 ingredient_keys (int[]), tag_keys (int[])
 *   ingredients — qty, unit, name, note  (per-recipe rows, cascade-deleted)
 *   tags        — code                   (shared taxonomy, never deleted)
 */

import { PoudbClient, ServerMessageError } from 'poudb-client';
import { RecipeRepository } from './recipe-repository.js';

/**
 * Thrown when the server rejects the token during connection auth.
 * Callers can catch this to clear the session and redirect to login.
 */
export class PoudbAuthError extends Error {
	constructor() {
		super('POUDB_AUTH_REJECTED');
		this.name = 'PoudbAuthError';
	}
}

const RECIPE_TABLE = process.env.POUDB_TABLE ?? 'recipes';
const INGREDIENTS_TABLE = process.env.POUDB_INGREDIENTS_TABLE ?? 'ingredients';
const TAGS_TABLE = process.env.POUDB_TAGS_TABLE ?? 'tags';
const POUDB_HOST = process.env.POUDB_HOST ?? '127.0.0.1';
const POUDB_PORT = Number(process.env.POUDB_PORT ?? '3005');
const HARDCODED_MODIFIED_HEX = '1698742A';

/** @type {import('poudb-client').SchemaField[]} */
const RECIPE_SCHEMA = [
	{ type: 'string', name: 'title' },
	{ type: 'string', name: 'modified_hex' },
	{ type: 'string', name: 'yield_label' },
	{ type: 'int', name: 'time_minutes' },
	{ type: 'string[]', name: 'steps' },
	{ type: 'int[]', name: 'ingredient_keys' },
	{ type: 'int[]', name: 'tag_keys' }
];

/** @type {import('poudb-client').SchemaField[]} */
const INGREDIENT_SCHEMA = [
	{ type: 'string', name: 'qty' },
	{ type: 'string', name: 'unit' },
	{ type: 'string', name: 'name' },
	{ type: 'string', name: 'note' }
];

/** @type {import('poudb-client').SchemaField[]} */
const TAG_SCHEMA = [{ type: 'string', name: 'code' }];

const RECIPE_FIELD_ORDER = [
	'title',
	'modified_hex',
	'yield_label',
	'time_minutes',
	'steps',
	'ingredient_keys',
	'tag_keys'
];
const INGREDIENT_FIELD_ORDER = ['qty', 'unit', 'name', 'note'];
const TAG_FIELD_ORDER = ['key', 'code'];

/**
 * @typedef {{
 * 	key: number,
 * 	qty: string,
 * 	unit: string,
 * 	name: string,
 * 	note: string
 * }} RawIngredient
 */

/**
 * @typedef {{
 * 	key: number,
 * 	code: string
 * }} RawTag
 */

/**
 * @typedef {{
 * 	flux_id: string,
 * 	title: string,
 * 	modified_hex: string,
 * 	yield_label: string,
 * 	time_minutes: number,
 * 	ingredient_keys: number[],
 * 	tag_keys: number[],
 * 	steps: string[]
 * }} RawRecipe
 */

/** @param {string} tag */
function bracketTag(tag) {
	return `[${tag}]`;
}

/** @param {string} value */
function titleCase(value) {
	return String(value)
		.toLowerCase()
		.split(' ')
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(' ');
}

/** @param {RawIngredient} ingredient */
function parseIngredientLabel(ingredient) {
	const base = [ingredient.qty, ingredient.unit, ingredient.name].filter(Boolean).join(' ');
	return ingredient.note ? `${base} // ${ingredient.note}` : base;
}

function toIsoClock() {
	return new Date().toISOString().slice(11, 19) + 'Z';
}

/** @param {string} id */
function fluxIdToKey(id) {
	if (typeof id !== 'string') {
		return null;
	}

	const normalized = id.trim().toLowerCase();
	if (!/^0x[0-9a-f]+$/.test(normalized)) {
		return null;
	}

	const value = Number.parseInt(normalized.slice(2), 16);
	if (!Number.isFinite(value) || value < 0) {
		return null;
	}

	return value;
}

/** @param {number} key */
function keyToFluxId(key) {
	const clamped = Math.max(0, Number(key) || 0);
	return `0x${clamped.toString(16).toUpperCase().padStart(4, '0')}`;
}

/** @param {unknown} value */
function decodeCell(value) {
	if (typeof value !== 'string') {
		return '';
	}

	const trimmed = value.trim();
	if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
		try {
			return JSON.parse(trimmed);
		} catch {
			return trimmed.slice(1, -1);
		}
	}

	return trimmed;
}

/**
 * @param {unknown} value
 * @param {unknown} fallback
 */
function parseJsonValue(value, fallback) {
	const decoded = decodeCell(value);
	if (typeof decoded !== 'string') {
		return decoded;
	}

	if (!decoded) {
		return fallback;
	}

	try {
		return JSON.parse(decoded);
	} catch {
		return fallback;
	}
}

/** @param {unknown} value */
function parseStringArray(value) {
	const parsed = parseJsonValue(value, []);
	return Array.isArray(parsed) ? parsed.map((entry) => String(entry)) : [];
}

/** @param {unknown} value */
function parseIntArray(value) {
	const parsed = parseJsonValue(value, []);
	return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
}

/**
 * @param {Record<string, string>} row
 * @param {number} keyHint
 * @returns {RawRecipe}
 */
function rowToRawRecipe(row, keyHint) {
	return {
		flux_id: keyToFluxId(keyHint ?? 0),
		title: String(decodeCell(row.title) || ''),
		modified_hex: String(decodeCell(row.modified_hex) || HARDCODED_MODIFIED_HEX),
		yield_label: String(decodeCell(row.yield_label) || ''),
		time_minutes: Number(decodeCell(row.time_minutes) || 0),
		ingredient_keys: parseIntArray(row.ingredient_keys),
		tag_keys: parseIntArray(row.tag_keys),
		steps: parseStringArray(row.steps)
	};
}

/**
 * @param {Record<string, string>} row
 * @param {number} key
 * @returns {RawIngredient}
 */
function rowToRawIngredient(row, key) {
	return {
		key,
		qty: String(decodeCell(row.qty) || ''),
		unit: String(decodeCell(row.unit) || ''),
		name: String(decodeCell(row.name) || ''),
		note: String(decodeCell(row.note) || '')
	};
}

/**
 * @param {Record<string, string>} row
 * @param {number} key
 * @returns {RawTag}
 */
function rowToRawTag(row, key) {
	return {
		key,
		code: String(decodeCell(row.code) || '')
	};
}

/** @param {unknown} error */
function classifyRepositoryError(error) {
	if (error instanceof ServerMessageError) {
		const upper = error.message.toUpperCase();
		if (upper.includes('NOT FOUND') || upper.includes('NO ROW')) {
			return 'RECORD_NOT_FOUND';
		}

		return 'POUDB_SERVER_ERROR';
	}

	return 'POUDB_CONNECTION_ERROR';
}

/** @param {unknown} error */
function isAlreadyExistsSchemaError(error) {
	if (!(error instanceof ServerMessageError)) {
		return false;
	}

	const upper = error.message.toUpperCase();
	return upper.includes('ALREADY') || upper.includes('EXISTS');
}

/**
 * @param {RawRecipe} raw
 * @param {Map<number, string>} tagsMap
 * @returns {{id: string, title: string, tags: string[], ts: string}}
 */
function toSummary(raw, tagsMap) {
	return {
		id: raw.flux_id,
		title: raw.title,
		tags: raw.tag_keys
			.map((k) => tagsMap.get(k) ?? '')
			.filter(Boolean)
			.map(bracketTag),
		ts: raw.modified_hex
	};
}

/**
 * @param {RawRecipe} raw
 * @param {RawIngredient[]} rawIngredients
 * @param {Map<number, string>} tagsMap
 * @returns {import('./recipe-repository').RecipeDetail}
 */
function toDetail(raw, rawIngredients, tagsMap) {
	return {
		id: raw.flux_id,
		title: raw.title,
		updatedHex: raw.modified_hex,
		timeLabel: `${raw.time_minutes} MINS`,
		yieldLabel: raw.yield_label,
		categories: raw.tag_keys.map((k) => tagsMap.get(k) ?? '').filter(Boolean),
		ingredients: rawIngredients.map((ingredient, index) => ({
			id: `${raw.flux_id}-ingredient-${index + 1}`,
			label: parseIngredientLabel(ingredient),
			quantity: ingredient.qty,
			unit: ingredient.unit,
			name: titleCase(ingredient.name),
			note: ingredient.note ? titleCase(ingredient.note) : null
		})),
		steps: raw.steps.map((instruction, index) => ({
			id: `${raw.flux_id}-step-${index + 1}`,
			index: String(index + 1).padStart(2, '0'),
			instruction
		})),
		parseSummary: {
			sourceStruct: 'RECIPE_RECORD_V3',
			fieldCoverage: '3 TABLES',
			recordBytes: 'N/A',
			checksum: 'N/A',
			parserMode: 'C_DB_STRUCT -> UI_READ_MODEL'
		}
	};
}

/**
 * @param {RawRecipe} raw
 * @param {RawIngredient[]} rawIngredients
 * @param {Map<number, string>} tagsMap
 * @returns {import('./recipe-repository').RecipeCreateInput}
 */
function toEditData(raw, rawIngredients, tagsMap) {
	return {
		title: raw.title,
		yieldLabel: raw.yield_label,
		timeMinutes: String(raw.time_minutes),
		tags: raw.tag_keys.map((k) => tagsMap.get(k) ?? '').filter(Boolean),
		ingredients: rawIngredients.map((ing) => ({
			quantity: ing.qty,
			unit: ing.unit,
			name: ing.name,
			note: ing.note
		})),
		steps: raw.steps.map((instruction) => ({ instruction }))
	};
}

export class PoudbRecipeRepository extends RecipeRepository {
	/**
	 * @param {string} token
	 */
	constructor(token) {
		super();
		this.client = new PoudbClient({
			host: POUDB_HOST,
			port: POUDB_PORT,
			key: token,
			reconnect: {
				enabled: false
			}
		});
		this.connectPromise = null;
		this.schemaPromise = null;
	}

	async ensureConnected() {
		if (this.client.isConnected()) {
			return;
		}

		if (!this.connectPromise) {
			this.connectPromise = this.client.connect().finally(() => {
				this.connectPromise = null;
			});
		}

		try {
			await this.connectPromise;
		} catch (error) {
			if (error instanceof ServerMessageError) {
				throw new PoudbAuthError();
			}
			throw error;
		}
	}

	/**
	 * @returns {Promise<string>}
	 */
	async whoami() {
		await this.ensureConnected();
		return this.client.whoami();
	}

	async ensureSchema() {
		if (!this.schemaPromise) {
			this.schemaPromise = (async () => {
				await this.ensureConnected();
				await Promise.all([
					this.client.create(RECIPE_TABLE, RECIPE_SCHEMA).catch((err) => {
						if (!isAlreadyExistsSchemaError(err)) throw err;
					}),
					this.client.create(INGREDIENTS_TABLE, INGREDIENT_SCHEMA).catch((err) => {
						if (!isAlreadyExistsSchemaError(err)) throw err;
					}),
					this.client.create(TAGS_TABLE, TAG_SCHEMA).catch((err) => {
						if (!isAlreadyExistsSchemaError(err)) throw err;
					})
				]);
			})();
		}

		return this.schemaPromise;
	}

	/**
	 * Fetch all tags and return them as a key → code map.
	 * @returns {Promise<Map<number, string>>}
	 */
	async getAllTagsMap() {
		const result = await this.client.getAll(TAGS_TABLE, TAG_FIELD_ORDER);
		/** @type {Map<number, string>} */
		const map = new Map();
		for (let i = 0; i < result.data.rows.length; i++) {
			const row = result.data.rows[i];
			const keyRaw = decodeCell(row.key) || decodeCell(row.id);
			const key = Number(keyRaw);
			if (Number.isFinite(key) && key > 0) {
				const tag = rowToRawTag(row, key);
				map.set(key, tag.code);
			}
		}
		return map;
	}

	/**
	 * Resolve tag codes to stored keys, creating new tag rows as needed.
	 * Runs sequentially to avoid duplicate-creation races.
	 * @param {string[]} tagCodes
	 * @returns {Promise<number[]>}
	 */
	async resolveTagKeys(tagCodes) {
		/** @type {number[]} */
		const keys = [];
		for (const code of tagCodes) {
			const trimmed = String(code).trim().toUpperCase();
			if (!trimmed) continue;

			const searchResult = await this.client.search(TAGS_TABLE, 'code', trimmed, TAG_FIELD_ORDER);
			if (searchResult.data.rows.length > 0) {
				const row = searchResult.data.rows[0];
				const keyRaw = decodeCell(row.key) || decodeCell(row.id);
				const key = Number(keyRaw);
				if (Number.isFinite(key) && key > 0) {
					keys.push(key);
					continue;
				}
			}

			const newKey = await this.client.add(TAGS_TABLE, '*', [trimmed]);
			keys.push(newKey);
		}
		return keys;
	}

	/**
	 * Fetch ingredient rows by their stored keys, preserving order.
	 * @param {number[]} keys
	 * @returns {Promise<RawIngredient[]>}
	 */
	async fetchIngredientsByKeys(keys) {
		if (keys.length === 0) return [];
		const results = await Promise.all(
			keys.map((k) => this.client.get(INGREDIENTS_TABLE, k, INGREDIENT_FIELD_ORDER))
		);
		return results
			.map((result, i) => {
				if (result.data.rows.length === 0) return null;
				return rowToRawIngredient(result.data.rows[0], keys[i]);
			})
			.filter((r) => r !== null);
	}

	/**
	 * @param {string} id
	 * @returns {Promise<RawRecipe | null>}
	 */
	async getRawByFluxId(id) {
		const key = fluxIdToKey(id);
		if (key === null) {
			return null;
		}

		await this.ensureSchema();
		const tableResult = await this.client.get(RECIPE_TABLE, key, RECIPE_FIELD_ORDER);
		if (tableResult.data.rows.length === 0) {
			return null;
		}

		const raw = rowToRawRecipe(tableResult.data.rows[0], key);
		if (raw.flux_id.toLowerCase() !== id.toLowerCase()) {
			return null;
		}

		return raw;
	}

	/**
	 * Get a summary list of all recipes.
	 * @returns {Promise<Array<{id: string, title: string, tags: string[], ts: string}>>}
	 */
	async getSummaries() {
		await this.ensureSchema();
		const [tagsMap, result] = await Promise.all([
			this.getAllTagsMap(),
			this.client.getAll(RECIPE_TABLE, RECIPE_FIELD_ORDER)
		]);
		return result.data.rows.map((row, index) => {
			const keyCandidate = Number(decodeCell(row.key) || decodeCell(row.id) || index + 1);
			const raw = rowToRawRecipe(row, Number.isFinite(keyCandidate) ? keyCandidate : index + 1);
			return toSummary(raw, tagsMap);
		});
	}

	/**
	 * Get full recipe details by ID.
	 * @param {string} id
	 * @returns {Promise<import('./recipe-repository').RecipeDetail | null>}
	 */
	async getDetail(id) {
		const raw = await this.getRawByFluxId(id);
		if (!raw) {
			return null;
		}

		const [rawIngredients, tagsMap] = await Promise.all([
			this.fetchIngredientsByKeys(raw.ingredient_keys),
			this.getAllTagsMap()
		]);

		return toDetail(raw, rawIngredients, tagsMap);
	}

	/**
	 * Return a RecipeCreateInput-shaped object for pre-populating the edit form.
	 * @param {string} id
	 * @returns {Promise<import('./recipe-repository').RecipeCreateInput | null>}
	 */
	async getEditData(id) {
		const raw = await this.getRawByFluxId(id);
		if (!raw) {
			return null;
		}

		const [rawIngredients, tagsMap] = await Promise.all([
			this.fetchIngredientsByKeys(raw.ingredient_keys),
			this.getAllTagsMap()
		]);

		return toEditData(raw, rawIngredients, tagsMap);
	}

	/**
	 * Get vault statistics.
	 * @returns {Promise<{total: number | string, lastSync: string, dbSize: string, latency: string}>}
	 */
	async getStats() {
		const start = Date.now();
		await this.ensureSchema();
		const total = await this.client.count(RECIPE_TABLE);
		const elapsed = Date.now() - start;

		return {
			total: String(total),
			lastSync: toIsoClock(),
			dbSize: 'N/A',
			latency: `${Math.max(elapsed, 1)}ms`
		};
	}

	/**
	 * Create a new recipe.
	 * @param {import('./recipe-repository').RecipeCreateInput} input
	 * @returns {Promise<import('./recipe-repository').RecipeCreateResult>}
	 */
	async create(input) {
		try {
			await this.ensureSchema();

			const steps = input.steps.map((step) => String(step.instruction ?? ''));

			const [ingredientKeys, tagKeys] = await Promise.all([
				Promise.all(
					input.ingredients.map((ing) =>
						this.client.add(INGREDIENTS_TABLE, '*', [
							String(ing.quantity ?? ''),
							String(ing.unit ?? ''),
							String(ing.name ?? ''),
							String(ing.note ?? '')
						])
					)
				),
				this.resolveTagKeys(input.tags)
			]);

			const key = await this.client.add(RECIPE_TABLE, '*', [
				input.title,
				HARDCODED_MODIFIED_HEX,
				input.yieldLabel,
				Number(input.timeMinutes),
				steps,
				ingredientKeys,
				tagKeys
			]);

			return { success: true, id: keyToFluxId(key) };
		} catch (error) {
			return { success: false, error: classifyRepositoryError(error) };
		}
	}

	/**
	 * Update an existing recipe by ID.
	 * @param {string} id
	 * @param {import('./recipe-repository').RecipeCreateInput} input
	 * @returns {Promise<import('./recipe-repository').RecipeUpdateResult>}
	 */
	async update(id, input) {
		try {
			const key = fluxIdToKey(id);
			if (key === null) {
				return { success: false, error: 'RECORD_NOT_FOUND' };
			}

			const existing = await this.getRawByFluxId(id);
			if (!existing) {
				return { success: false, error: 'RECORD_NOT_FOUND' };
			}

			const steps = input.steps.map((step) => String(step.instruction ?? ''));

			// Delete old ingredient rows and create replacements; resolve tags — in parallel.
			const [ingredientKeys, tagKeys] = await Promise.all([
				(async () => {
					await Promise.all(
						existing.ingredient_keys.map((k) => this.client.del(INGREDIENTS_TABLE, k))
					);
					return Promise.all(
						input.ingredients.map((ing) =>
							this.client.add(INGREDIENTS_TABLE, '*', [
								String(ing.quantity ?? ''),
								String(ing.unit ?? ''),
								String(ing.name ?? ''),
								String(ing.note ?? '')
							])
						)
					);
				})(),
				this.resolveTagKeys(input.tags)
			]);

			await this.client.up(RECIPE_TABLE, key, [
				input.title,
				HARDCODED_MODIFIED_HEX,
				input.yieldLabel,
				Number(input.timeMinutes),
				steps,
				ingredientKeys,
				tagKeys
			]);

			return { success: true, id };
		} catch (error) {
			return { success: false, error: classifyRepositoryError(error) };
		}
	}

	/**
	 * Delete a recipe by ID, cascading to its ingredient rows.
	 * @param {string} id
	 * @returns {Promise<import('./recipe-repository').RecipeDeleteResult>}
	 */
	async delete(id) {
		try {
			const key = fluxIdToKey(id);
			if (key === null) {
				return { success: false, error: 'RECORD_NOT_FOUND' };
			}

			const existing = await this.getRawByFluxId(id);
			if (!existing) {
				return { success: false, error: 'RECORD_NOT_FOUND' };
			}

			await Promise.all([
				...existing.ingredient_keys.map((k) => this.client.del(INGREDIENTS_TABLE, k)),
				this.client.del(RECIPE_TABLE, key)
			]);

			return { success: true };
		} catch (error) {
			return { success: false, error: classifyRepositoryError(error) };
		}
	}

	async disconnect() {
		try {
			await this.client.disconnect();
		} catch {
			// best-effort disconnect
		}
	}
}
