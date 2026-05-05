import { PoudbRecipeRepository } from '$lib/poudb-repository';
import {
	FRIENDLY_ACTION_MESSAGES,
	mapRepositoryErrorToMessage
} from '$lib/errors/action-errors.js';
import { validateRecipeCreateInput } from '$lib/recipe-repository.js';

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Create a new recipe from ingest form data.
	 * Parses nested FormData arrays and validates before persisting.
	 */
	create: async ({ request, locals }) => {
		const repo = new PoudbRecipeRepository(locals.token);
		try {
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
					ingredients: [],
					steps: []
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
					errors: validation.errors,
					code: 'CREATE_VALIDATION_FAILED'
				};
			}

			const result = await repo.create(input);

			if (result.success) {
				return {
					success: true,
					id: result.id
				};
			}

			return {
				success: false,
				errors: {
					general: mapRepositoryErrorToMessage(result.error, FRIENDLY_ACTION_MESSAGES.create)
				},
				code: result.error ?? 'CREATE_FAILED'
			};
		} catch (error) {
			console.error('[ingest/create] unexpected failure', error);
			return {
				success: false,
				errors: {
					general: FRIENDLY_ACTION_MESSAGES.create
				},
				code: 'CREATE_UNEXPECTED'
			};
		} finally {
			await repo.disconnect();
		}
	}
};
