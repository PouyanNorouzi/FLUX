import { PoudbRecipeRepository, PoudbAuthError } from '$lib/poudb-repository';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, cookies }) {
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
		if (error instanceof PoudbAuthError) {
			cookies.delete('poudb_token', { path: '/' });
			redirect(303, '/');
		}
		console.error('[vault/load] failed to read vault index', error);
		redirect(303, '/?error=DB_UNAVAILABLE');
	} finally {
		await repo.disconnect();
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete('poudb_token', { path: '/' });
		redirect(303, '/');
	}
};
