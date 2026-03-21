import { recipeRepository } from '$lib/mock/poudb';

const FALLBACK_STATS = {
	total: 0,
	lastSync: 'UNAVAILABLE',
	dbSize: '0 KB',
	latency: 'N/A'
};

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		// Simulate TCP round-trip delay to POUDB daemon on port 8080
		await new Promise((resolve) => setTimeout(resolve, 500));
		return {
			records: recipeRepository.getSummaries(),
			stats: recipeRepository.getStats(),
			loadError: null
		};
	} catch (error) {
		console.error('[vault/load] failed to read vault index', error);
		return {
			records: [],
			stats: FALLBACK_STATS,
			loadError: 'VAULT_LIST_LOAD_FAILED'
		};
	}
}
