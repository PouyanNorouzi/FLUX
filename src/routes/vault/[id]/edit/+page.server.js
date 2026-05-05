import { PoudbRecipeRepository } from '$lib/poudb-repository';
import {
	FRIENDLY_ACTION_MESSAGES,
	mapRepositoryErrorToMessage
} from '$lib/errors/action-errors.js';
import { validateRecipeCreateInput } from '$lib/recipe-repository.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const repo = new PoudbRecipeRepository(locals.token);
	try {
		await new Promise((resolve) => setTimeout(resolve, 200));

		return {
			requestedId: params.id,
			draft: await repo.getEditData(params.id)
		};
	} finally {
		await repo.disconnect();
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Update an existing recipe from the edit form.
	 * Parses nested FormData arrays and validates before persisting.
	 */
	update: async ({ request, params, locals }) => {
		const repo = new PoudbRecipeRepository(locals.token);
		try {
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
					ingredients: [],
					steps: []
				};

				let tagIdx = 0;
				while (fd.has(`tags[${tagIdx}]`)) {
					const tag = fd.get(`tags[${tagIdx}]`);
					if (typeof tag === 'string') result.tags.push(tag);
					tagIdx++;
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
				return {
					success: false,
					errors: validation.errors,
					code: 'UPDATE_VALIDATION_FAILED'
				};
			}

			const result = await repo.update(params.id, input);

			if (result.success) {
				return { success: true, id: result.id };
			}

			return {
				success: false,
				errors: {
					general: mapRepositoryErrorToMessage(result.error, FRIENDLY_ACTION_MESSAGES.update)
				},
				code: result.error ?? 'UPDATE_FAILED'
			};
		} catch (error) {
			console.error('[edit/update] unexpected failure', error);
			return {
				success: false,
				errors: {
					general: FRIENDLY_ACTION_MESSAGES.update
				},
				code: 'UPDATE_UNEXPECTED'
			};
		} finally {
			await repo.disconnect();
		}
	}
};
