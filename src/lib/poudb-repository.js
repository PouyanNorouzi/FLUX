/**
 * PoUDb Recipe Repository
 *
 * Production implementation of the RecipeRepository contract backed by
 * poudb-client.
 */

import { PoudbClient, ServerMessageError } from 'poudb-client';
import { RecipeRepository } from './recipe-repository.js';

const TABLE_NAME = process.env.POUDB_TABLE ?? 'recipes';
const POUDB_HOST = process.env.POUDB_HOST ?? '127.0.0.1';
const POUDB_PORT = Number(process.env.POUDB_PORT ?? '3005');
const HARDCODED_MODIFIED_HEX = '1698742A';

/** @type {import('poudb-client').SchemaField[]} */
const SCHEMA = [
	{ type: 'string', name: 'title' },
	{ type: 'string', name: 'tag_codes' },
	{ type: 'string', name: 'modified_hex' },
	{ type: 'string', name: 'yield_label' },
	{ type: 'int', name: 'time_minutes' },
	{ type: 'string', name: 'ingredients' },
	{ type: 'string', name: 'steps' }
];

const FIELD_ORDER = [
	'title',
	'tag_codes',
	'modified_hex',
	'yield_label',
	'time_minutes',
	'ingredients',
	'steps'
];

/**
 * @typedef {{
 * 	qty: string,
 * 	unit: string,
 * 	name: string,
 * 	note?: string
 * }} RawIngredient
 */

/**
 * @typedef {{
 * 	flux_id: string,
 * 	title: string,
 * 	tag_codes: string[],
 * 	modified_hex: string,
 * 	yield_label: string,
 * 	time_minutes: number,
 * 	ingredients: RawIngredient[],
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
function parseRawIngredients(value) {
	const parsed = parseJsonValue(value, []);
	if (!Array.isArray(parsed)) {
		return [];
	}

	return parsed.map((entry) => ({
		qty: String(entry?.qty ?? ''),
		unit: String(entry?.unit ?? ''),
		name: String(entry?.name ?? ''),
		note: entry?.note ? String(entry.note) : undefined
	}));
}

/**
 * @param {Record<string, string>} row
 * @param {number} keyHint
 * @returns {RawRecipe}
 */
function rowToRawRecipe(row, keyHint) {
	const tagCodes = parseStringArray(row.tag_codes);
	const ingredients = parseRawIngredients(row.ingredients);
	const steps = parseStringArray(row.steps);
	const flux_id = keyToFluxId(keyHint ?? 0);

	return {
		flux_id,
		title: String(decodeCell(row.title) || ''),
		tag_codes: tagCodes,
		modified_hex: String(decodeCell(row.modified_hex) || HARDCODED_MODIFIED_HEX),
		yield_label: String(decodeCell(row.yield_label) || ''),
		time_minutes: Number(decodeCell(row.time_minutes) || 0),
		ingredients,
		steps
	};
}

/** @param {import('./recipe-repository').IngestIngredientRow[]} inputIngredients */
function toRawIngredientRows(inputIngredients) {
	return inputIngredients.map((row) => ({
		qty: String(row.quantity ?? ''),
		unit: String(row.unit ?? ''),
		name: String(row.name ?? ''),
		note: row.note ? String(row.note) : undefined
	}));
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
 * @returns {{id: string, title: string, tags: string[], ts: string}}
 */
function toSummary(raw) {
	return {
		id: raw.flux_id,
		title: raw.title,
		tags: raw.tag_codes.map(bracketTag),
		ts: raw.modified_hex
	};
}

/**
 * @param {RawRecipe} raw
 * @returns {import('./recipe-repository').RecipeDetail}
 */
function toDetail(raw) {
	return {
		id: raw.flux_id,
		title: raw.title,
		updatedHex: raw.modified_hex,
		timeLabel: `${raw.time_minutes} MINS`,
		yieldLabel: raw.yield_label,
		categories: raw.tag_codes,
		ingredients: raw.ingredients.map((ingredient, index) => ({
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
			sourceStruct: 'RECIPE_RECORD_V2',
			fieldCoverage: '7/7',
			recordBytes: 'N/A',
			checksum: 'N/A',
			parserMode: 'C_DB_STRUCT -> UI_READ_MODEL'
		}
	};
}

/**
 * @param {RawRecipe} raw
 * @returns {import('./recipe-repository').RecipeCreateInput}
 */
function toEditData(raw) {
	return {
		title: raw.title,
		yieldLabel: raw.yield_label,
		timeMinutes: String(raw.time_minutes),
		tags: [...raw.tag_codes],
		ingredients: raw.ingredients.map((ing) => ({
			quantity: ing.qty,
			unit: ing.unit,
			name: ing.name,
			note: ing.note ?? ''
		})),
		steps: raw.steps.map((instruction) => ({ instruction }))
	};
}

export class PoUdbRecipeRepository extends RecipeRepository {
	constructor() {
		super();
		this.client = new PoudbClient({
			host: POUDB_HOST,
			port: POUDB_PORT,
			reconnect: {
				enabled: true,
				maxRetries: 2,
				retryDelayMs: 100
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

		await this.connectPromise;
	}

	async ensureSchema() {
		if (!this.schemaPromise) {
			this.schemaPromise = (async () => {
				await this.ensureConnected();
				try {
					await this.client.create(TABLE_NAME, SCHEMA);
				} catch (error) {
					if (!isAlreadyExistsSchemaError(error)) {
						throw error;
					}
				}
			})();
		}

		return this.schemaPromise;
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
		const tableResult = await this.client.get(TABLE_NAME, key, FIELD_ORDER);
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
		const result = await this.client.getAll(TABLE_NAME, FIELD_ORDER);
		return result.data.rows.map((row, index) => {
			const keyCandidate = Number(decodeCell(row.key) || decodeCell(row.id) || index + 1);
			const raw = rowToRawRecipe(row, Number.isFinite(keyCandidate) ? keyCandidate : index + 1);
			return toSummary(raw);
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

		return toDetail(raw);
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

		return toEditData(raw);
	}

	/**
	 * Get vault statistics.
	 * @returns {Promise<{total: number | string, lastSync: string, dbSize: string, latency: string}>}
	 */
	async getStats() {
		const start = Date.now();
		await this.ensureSchema();
		const total = await this.client.count(TABLE_NAME);
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

			const ingredients = toRawIngredientRows(input.ingredients);
			const steps = input.steps.map((step) => String(step.instruction ?? ''));

			const key = await this.client.add(TABLE_NAME, '*', [
				input.title,
				JSON.stringify(input.tags),
				HARDCODED_MODIFIED_HEX,
				input.yieldLabel,
				Number(input.timeMinutes),
				JSON.stringify(ingredients),
				JSON.stringify(steps)
			]);

			const fluxId = keyToFluxId(key);

			return {
				success: true,
				id: fluxId
			};
		} catch (error) {
			return {
				success: false,
				error: classifyRepositoryError(error)
			};
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

			const ingredients = toRawIngredientRows(input.ingredients);
			const steps = input.steps.map((step) => String(step.instruction ?? ''));

			await this.client.up(TABLE_NAME, key, [
				input.title,
				JSON.stringify(input.tags),
				HARDCODED_MODIFIED_HEX,
				input.yieldLabel,
				Number(input.timeMinutes),
				JSON.stringify(ingredients),
				JSON.stringify(steps)
			]);

			return { success: true, id };
		} catch (error) {
			return {
				success: false,
				error: classifyRepositoryError(error)
			};
		}
	}

	/**
	 * Delete a recipe by ID.
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

			await this.client.del(TABLE_NAME, key);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: classifyRepositoryError(error)
			};
		}
	}
}

export const recipeRepository = new PoUdbRecipeRepository();
