import { recipeRepository } from '$lib/mock/poudb';
import { validateRecipeCreateInput } from '$lib/recipe-repository.js';

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Create a new recipe from ingest form data.
	 * Parses nested FormData arrays and validates before persisting.
	 */
	create: async ({ request }) => {
		const formData = await request.formData();

		// Helper to parse FormData with bracket notation (e.g., ingredients[0].qty)
		/**
		 * @param {FormData} fd
		 * @returns {import('$lib/recipe-repository').RecipeCreateInput}
		 */
		function parseFormDataArrays(fd) {
			/** @type {import('$lib/recipe-repository').RecipeCreateInput} */
			const result = {
				title: String(fd.get('title') ?? ''),
				yieldLabel: String(fd.get('yieldLabel') ?? ''),
				timeMinutes: String(fd.get('timeMinutes') ?? ''),
				tags: [],
				systemFlags: [],
				ingredients: [],
				steps: [],
				parserMetadata: {
					recordBytes: String(fd.get('parserMetadata.recordBytes') ?? '256'),
					checksumHex: String(fd.get('parserMetadata.checksumHex') ?? '0x000000'),
					structName: String(fd.get('parserMetadata.structName') ?? 'recipe_record_v2'),
					fieldCount: String(fd.get('parserMetadata.fieldCount') ?? '10')
				}
			};

			// Parse tags
			let tagIdx = 0;
			while (fd.has(`tags[${tagIdx}]`)) {
				const tag = fd.get(`tags[${tagIdx}]`);
				if (typeof tag === 'string') {
					result.tags.push(tag);
				}
				tagIdx++;
			}

			// Parse system flags
			let flagIdx = 0;
			while (fd.has(`systemFlags[${flagIdx}]`)) {
				const flag = fd.get(`systemFlags[${flagIdx}]`);
				if (typeof flag === 'string') {
					result.systemFlags.push(flag);
				}
				flagIdx++;
			}

			// Parse ingredients
			let ingIdx = 0;
			while (fd.has(`ingredients[${ingIdx}].quantity`)) {
				const qty = fd.get(`ingredients[${ingIdx}].quantity`);
				const unit = fd.get(`ingredients[${ingIdx}].unit`);
				const name = fd.get(`ingredients[${ingIdx}].name`);
				const note = fd.get(`ingredients[${ingIdx}].note`);

				result.ingredients.push({
					quantity: String(qty ?? ''),
					unit: String(unit ?? ''),
					name: String(name ?? ''),
					note: typeof note === 'string' ? note : undefined
				});
				ingIdx++;
			}

			// Parse steps
			let stepIdx = 0;
			while (fd.has(`steps[${stepIdx}].instruction`)) {
				const instruction = fd.get(`steps[${stepIdx}].instruction`);
				result.steps.push({
					instruction: String(instruction ?? '')
				});
				stepIdx++;
			}

			return result;
		}

		const input = parseFormDataArrays(formData);
		const validation = validateRecipeCreateInput(input);

		if (!validation.valid) {
			return {
				success: false,
				errors: validation.errors
			};
		}

		// Create the recipe in the repository
		const result = recipeRepository.create(input);

		if (result.success) {
			return {
				success: true,
				id: result.id
			};
		} else {
			return {
				success: false,
				errors: {
					general: result.error || 'FAILED_TO_CREATE_RECIPE'
				}
			};
		}
	}
};
