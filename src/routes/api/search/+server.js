import { json, error } from '@sveltejs/kit';
import { PoudbRecipeRepository, PoudbAuthError } from '$lib/poudb-repository';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
	if (!locals.token) {
		error(401, 'Unauthorized');
	}

	const q = url.searchParams.get('q') ?? '';
	const repo = new PoudbRecipeRepository(locals.token);
	try {
		const { records, execTime } = await repo.searchSummaries(q);
		return json({ records, execTime });
	} catch (err) {
		if (err instanceof PoudbAuthError) {
			error(401, 'Unauthorized');
		}
		console.error('[api/search] search failed', err);
		error(500, 'Search failed');
	} finally {
		await repo.disconnect();
	}
}
