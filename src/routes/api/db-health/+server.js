import { json } from '@sveltejs/kit';
import { mapRepositoryErrorToMessage } from '$lib/errors/action-errors.js';
import { recipeRepository } from '$lib/poudb-repository';

const DB_UNAVAILABLE_CODE = 'DB_UNAVAILABLE';
const DB_UNAVAILABLE_FALLBACK =
	'Database is currently unreachable. Verify PoUDB is online and try again.';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		await recipeRepository.ensureConnected();
		return json({ success: true });
	} catch (error) {
		console.error('[db-health] connectivity probe failed', error);
		return json(
			{
				success: false,
				code: DB_UNAVAILABLE_CODE,
				error: mapRepositoryErrorToMessage(DB_UNAVAILABLE_CODE, DB_UNAVAILABLE_FALLBACK)
			},
			{ status: 503 }
		);
	}
}
