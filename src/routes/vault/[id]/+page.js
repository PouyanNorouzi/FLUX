import { getRecipeDetail, getVaultStats } from '$lib/mock/poudb';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	await new Promise((resolve) => setTimeout(resolve, 350));

	const recipe = getRecipeDetail(params.id);

	return {
		requestedId: params.id,
		recipe,
		stats: getVaultStats()
	};
}
