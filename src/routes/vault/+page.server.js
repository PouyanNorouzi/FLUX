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
		const [records, stats, keyName] = await Promise.all([
			repo.getSummaries(),
			repo.getStats(),
			repo.whoami().catch(() => 'UNKNOWN')
		]);
		return {
			records,
			stats,
			keyName,
			loadError: null
		};
	} catch (error) {
		console.error('[vault/load] failed to read vault index', error);
		return {
			records: [],
			stats: FALLBACK_STATS,
			keyName: 'UNKNOWN',
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
