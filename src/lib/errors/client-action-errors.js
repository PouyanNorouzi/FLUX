import { deserialize } from '$app/forms';
import { resolveActionPayload } from '$lib/errors/action-errors.js';

/**
 * Parse a manual action fetch response using the same deserializer SvelteKit uses
 * for enhanced forms. This correctly resolves action `data` payload references.
 *
 * @param {Response} response
 */
export async function parseActionResponse(response) {
	let rawText = '';

	try {
		rawText = await response.text();
	} catch {
		return {
			responseOk: response.ok,
			status: response.status,
			parseOk: false,
			payload: {}
		};
	}

	if (!rawText) {
		return {
			responseOk: response.ok,
			status: response.status,
			parseOk: false,
			payload: {}
		};
	}

	let rawResult = null;

	try {
		rawResult = deserialize(rawText);
	} catch {
		try {
			rawResult = JSON.parse(rawText);
		} catch {
			return {
				responseOk: response.ok,
				status: response.status,
				parseOk: false,
				payload: {}
			};
		}
	}

	return {
		responseOk: response.ok,
		status: response.status,
		parseOk: true,
		payload: resolveActionPayload(rawResult)
	};
}

/**
 * @param {string} scope
 * @param {Record<string, unknown>} details
 */
export function logActionFailure(scope, details) {
	console.error(`[vault/${scope}] action failed`, details);
}
