import { recipeRepository } from '$lib/mock/poudb';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	await new Promise((resolve) => setTimeout(resolve, 200));

	const draft = recipeRepository.getEditData(params.id);

	return {
		requestedId: params.id,
		draft
	};
}
