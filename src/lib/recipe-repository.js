/**
 * Recipe Repository Interface and Types
 *
 * This module defines the contract between the ingest form, server actions, and
 * the persistence layer (currently in-memory, later poudb). Separating the
 * application-level shapes from the storage-level shapes allows the UI and
 * actions to remain stable as the backend evolves.
 */

/**
 * @typedef {{
 * 	quantity: string,
 * 	unit: string,
 * 	name: string,
 * 	note?: string
 * }} IngestIngredientRow
 */

/**
 * @typedef {{
 * 	instruction: string
 * }} IngestStepRow
 */

/**
 * @typedef {{
 * 	recordBytes: string,
 * 	checksumHex: string,
 * 	structName: string,
 * 	fieldCount: string
 * }} IngestParserMetadata
 */

/**
 * @typedef {{
 * 	title: string,
 * 	yieldLabel: string,
 * 	timeMinutes: string,
 * 	tags: string[],
 * 	systemFlags: string[],
 * 	ingredients: IngestIngredientRow[],
 * 	steps: IngestStepRow[],
 * 	parserMetadata: IngestParserMetadata
 * }} RecipeCreateInput
 */

/**
 * @typedef {{
 * 	success: boolean,
 * 	id?: string,
 * 	error?: string,
 * 	errors?: Record<string, string>
 * }} RecipeCreateResult
 */

/**
 * Recipe Repository
 * Abstracts persistence and read/write operations.
 */
export class RecipeRepository {
	/**
	 * Get a summary list of all recipes.
	 * @returns {Array<{id: string, title: string, tags: string[], ts: string}>}
	 */
	getSummaries() {
		throw new Error('Not implemented');
	}

	/**
	 * Get full recipe details by ID.
	 * @param {string} _id - The recipe flux_id (e.g., '0x8F9A')
	 * @returns {Object|null}
	 */
	// eslint-disable-next-line no-unused-vars
	getDetail(_id) {
		throw new Error('Not implemented');
	}

	/**
	 * Get vault statistics.
	 * @returns {{total: number, lastSync: string, dbSize: string, latency: string}}
	 */
	getStats() {
		throw new Error('Not implemented');
	}

	/**
	 * Create a new recipe.
	 * @param {RecipeCreateInput} _input
	 * @returns {RecipeCreateResult}
	 */
	// eslint-disable-next-line no-unused-vars
	create(_input) {
		throw new Error('Not implemented');
	}
}

/**
 * Validate a RecipeCreateInput payload.
 * @param {RecipeCreateInput} input
 * @returns {{valid: boolean, errors: Record<string, string>}}
 */
export function validateRecipeCreateInput(input) {
	/** @type {Record<string, string>} */
	const errors = {};

	// Title validation
	if (!input.title || input.title.trim().length === 0) {
		errors.title = 'RECIPE TITLE IS REQUIRED';
	}

	// Yield validation
	if (!input.yieldLabel || input.yieldLabel.trim().length === 0) {
		errors.yieldLabel = 'YIELD LABEL IS REQUIRED';
	}

	// Time validation
	if (!input.timeMinutes || isNaN(Number(input.timeMinutes))) {
		errors.timeMinutes = 'TIME_MINUTES MUST BE A VALID NUMBER';
	}

	// At least one ingredient
	if (!input.ingredients || input.ingredients.length === 0) {
		errors.ingredients = 'AT LEAST ONE INGREDIENT IS REQUIRED';
	} else {
		// Validate each ingredient
		input.ingredients.forEach((ing, idx) => {
			if (!ing.quantity || ing.quantity.trim().length === 0) {
				errors[`ingredients[${idx}].quantity`] = 'QUANTITY IS REQUIRED';
			}
			if (!ing.unit || ing.unit.trim().length === 0) {
				errors[`ingredients[${idx}].unit`] = 'UNIT IS REQUIRED';
			}
			if (!ing.name || ing.name.trim().length === 0) {
				errors[`ingredients[${idx}].name`] = 'NAME IS REQUIRED';
			}
		});
	}

	// At least one step
	if (!input.steps || input.steps.length === 0) {
		errors.steps = 'AT LEAST ONE STEP IS REQUIRED';
	} else {
		// Validate each step
		input.steps.forEach((step, idx) => {
			if (!step.instruction || step.instruction.trim().length === 0) {
				errors[`steps[${idx}].instruction`] = 'INSTRUCTION TEXT IS REQUIRED';
			}
		});
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors
	};
}
