import { getRecipeSummaries, getVaultStats } from '$lib/mock/poudb';

/** @type {import('./$types').PageLoad} */
export async function load() {
	// Simulate TCP round-trip delay to POUDB daemon on port 8080
	await new Promise((resolve) => setTimeout(resolve, 500));
	return {
		records: getRecipeSummaries(),
		stats: getVaultStats()
	};
}
