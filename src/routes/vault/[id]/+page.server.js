import { recipeRepository } from '$lib/mock/poudb';

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Delete a recipe by its flux_id (from the route param).
	 */
	delete: async ({ params }) => {
		const result = recipeRepository.delete(params.id);

		if (result.success) {
			return { success: true };
		} else {
			return { success: false, error: result.error ?? 'DELETE_FAILED' };
		}
	}
};
