import { recipeRepository } from '$lib/poudb-repository';

const FALLBACK_STATS = {
	total: 0,
	lastSync: 'UNAVAILABLE',
	dbSize: '0 KB',
	latency: 'N/A'
};

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		return {
			records: await recipeRepository.getSummaries(),
			stats: await recipeRepository.getStats(),
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
