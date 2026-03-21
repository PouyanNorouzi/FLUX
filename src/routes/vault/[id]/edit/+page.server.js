import { recipeRepository } from '$lib/mock/poudb';
import { validateRecipeCreateInput } from '$lib/recipe-repository.js';

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Update an existing recipe from the edit form.
	 * Parses nested FormData arrays and validates before persisting.
	 */
	update: async ({ request, params }) => {
		const formData = await request.formData();

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

			let tagIdx = 0;
			while (fd.has(`tags[${tagIdx}]`)) {
				const tag = fd.get(`tags[${tagIdx}]`);
				if (typeof tag === 'string') result.tags.push(tag);
				tagIdx++;
			}

			let flagIdx = 0;
			while (fd.has(`systemFlags[${flagIdx}]`)) {
				const flag = fd.get(`systemFlags[${flagIdx}]`);
				if (typeof flag === 'string') result.systemFlags.push(flag);
				flagIdx++;
			}

			let ingIdx = 0;
			while (fd.has(`ingredients[${ingIdx}].quantity`)) {
				result.ingredients.push({
					quantity: String(fd.get(`ingredients[${ingIdx}].quantity`) ?? ''),
					unit: String(fd.get(`ingredients[${ingIdx}].unit`) ?? ''),
					name: String(fd.get(`ingredients[${ingIdx}].name`) ?? ''),
					note: fd.has(`ingredients[${ingIdx}].note`)
						? String(fd.get(`ingredients[${ingIdx}].note`))
						: undefined
				});
				ingIdx++;
			}

			let stepIdx = 0;
			while (fd.has(`steps[${stepIdx}].instruction`)) {
				result.steps.push({
					instruction: String(fd.get(`steps[${stepIdx}].instruction`) ?? '')
				});
				stepIdx++;
			}

			return result;
		}

		const input = parseFormDataArrays(formData);
		const validation = validateRecipeCreateInput(input);

		if (!validation.valid) {
			return { success: false, errors: validation.errors };
		}

		const result = recipeRepository.update(params.id, input);

		if (result.success) {
			return { success: true, id: result.id };
		} else {
			return { success: false, errors: { general: result.error ?? 'FAILED_TO_UPDATE_RECIPE' } };
		}
	}
};
