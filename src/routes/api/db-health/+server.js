import { json } from '@sveltejs/kit';
import { mapRepositoryErrorToMessage } from '$lib/errors/action-errors.js';
import { recipeRepository } from '$lib/poudb-repository';

const DB_UNAVAILABLE_CODE = 'DB_UNAVAILABLE';
const DB_UNAVAILABLE_FALLBACK =
	'Database is currently unreachable. Verify PoUDB is online and try again.';

function resolveDatabasePort() {
	const parsed = Number(process.env.POUDB_PORT ?? '3005');
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 3005;
}

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const port = resolveDatabasePort();
	try {
		await recipeRepository.ensureConnected();
		return json({ success: true, port });
	} catch (error) {
		console.error('[db-health] connectivity probe failed', error);
		return json(
			{
				success: false,
				port,
				code: DB_UNAVAILABLE_CODE,
				error: mapRepositoryErrorToMessage(DB_UNAVAILABLE_CODE, DB_UNAVAILABLE_FALLBACK)
			},
			{ status: 503 }
		);
	}
}
