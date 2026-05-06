import { PoudbRecipeRepository } from '$lib/poudb-repository';
import { redirect } from '@sveltejs/kit';

const FALLBACK_STATS = {
	total: 0,
	lastSync: 'UNAVAILABLE',
	dbSize: '0 KB',
	latency: 'N/A'
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const repo = new PoudbRecipeRepository(locals.token);
	try {
		return {
			records: await repo.getSummaries(),
			stats: await repo.getStats(),
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

/** @type {import('./$types').Actions} */
export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete('poudb_token', { path: '/' });
		redirect(303, '/');
	}
};
