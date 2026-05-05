import { PoudbRecipeRepository } from '$lib/poudb-repository';
import {
	FRIENDLY_ACTION_MESSAGES,
	mapRepositoryErrorToMessage
} from '$lib/errors/action-errors.js';

const FALLBACK_STATS = {
	total: 0,
	lastSync: 'UNAVAILABLE',
	dbSize: '0 KB',
	latency: 'N/A'
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const repo = new PoudbRecipeRepository(locals.token);
	try {
		await new Promise((resolve) => setTimeout(resolve, 350));

		return {
			requestedId: params.id,
			recipe: await repo.getDetail(params.id),
			stats: await repo.getStats(),
			loadError: null
		};
	} catch (error) {
		console.error('[vault/detail] failed to load recipe detail', error);
		return {
			requestedId: params.id,
			recipe: null,
			stats: FALLBACK_STATS,
			loadError: 'VAULT_DETAIL_LOAD_FAILED'
		};
	} finally {
		await repo.disconnect();
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	/**
	 * Delete a recipe by its flux_id (from the route param).
	 */
	delete: async ({ params, locals }) => {
		const repo = new PoudbRecipeRepository(locals.token);
		try {
			const result = await repo.delete(params.id);

			if (result.success) {
				return { success: true };
			}

			const general = mapRepositoryErrorToMessage(result.error, FRIENDLY_ACTION_MESSAGES.delete);
			return {
				success: false,
				error: general,
				errors: { general },
				code: result.error ?? 'DELETE_FAILED'
			};
		} catch (error) {
			console.error('[detail/delete] unexpected failure', error);
			return {
				success: false,
				error: FRIENDLY_ACTION_MESSAGES.delete,
				errors: { general: FRIENDLY_ACTION_MESSAGES.delete },
				code: 'DELETE_UNEXPECTED'
			};
		} finally {
			await repo.disconnect();
		}
	}
};
