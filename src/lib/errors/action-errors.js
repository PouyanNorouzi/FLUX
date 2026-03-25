const DEFAULT_MESSAGES = {
	create: 'We could not create this recipe. Please try again.',
	update: 'We could not save your changes. Please try again.',
	delete: 'We could not delete this recipe. Please try again.',
	network: 'Unable to reach the server right now. Please check your connection and try again.',
	response: 'The server returned an unexpected response. Please try again.'
};

/** @type {Record<string, string>} */
const REPOSITORY_ERROR_MESSAGES = {
	RECORD_NOT_FOUND: 'This recipe no longer exists. Refresh the vault and try again.',
	POUDB_CONNECTION_ERROR:
		'Database is currently unreachable. Verify PoUDB is online and try again.',
	DB_UNAVAILABLE: 'Database is currently unreachable. Verify PoUDB is online and try again.'
};

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
	return typeof value === 'object' && value !== null;
}

/**
 * SvelteKit action results can come back as { data: ... } when posted manually.
 * This function safely returns the payload shape used by the app.
 *
 * @param {unknown} rawResult
 * @returns {Record<string, unknown>}
 */
export function resolveActionPayload(rawResult) {
	if (!isRecord(rawResult)) {
		return {};
	}

	if (isRecord(rawResult.data)) {
		return rawResult.data;
	}

	return rawResult;
}

/**
 * @param {unknown} code
 * @param {string} fallbackMessage
 */
export function mapRepositoryErrorToMessage(code, fallbackMessage) {
	if (typeof code !== 'string') {
		return fallbackMessage;
	}

	return REPOSITORY_ERROR_MESSAGES[code] ?? fallbackMessage;
}

/**
 * @param {unknown} rawResult
 * @param {{ fallbackMessage?: string }} [options]
 */
export function normalizeActionFailure(rawResult, options = {}) {
	const payload = resolveActionPayload(rawResult);
	const fallbackMessage = options.fallbackMessage ?? DEFAULT_MESSAGES.response;
	const payloadErrors = isRecord(payload.errors) ? payload.errors : {};

	/** @type {Record<string, string>} */
	const fieldErrors = {};

	Object.entries(payloadErrors).forEach(([key, value]) => {
		if (key === 'general') {
			return;
		}

		if (typeof value === 'string' && value.trim().length > 0) {
			fieldErrors[key] = value;
		}
	});

	let generalMessage = '';

	if (typeof payloadErrors.general === 'string' && payloadErrors.general.trim().length > 0) {
		generalMessage = payloadErrors.general;
	} else if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
		generalMessage = payload.error;
	} else if (Object.keys(fieldErrors).length === 0) {
		generalMessage = fallbackMessage;
	}

	return {
		generalMessage,
		fieldErrors
	};
}

/**
 * @param {unknown} err
 * @param {{ fallbackMessage?: string }} [options]
 */
export function getNetworkErrorMessage(err, options = {}) {
	const fallbackMessage = options.fallbackMessage ?? DEFAULT_MESSAGES.network;

	if (err instanceof SyntaxError) {
		return DEFAULT_MESSAGES.response;
	}

	if (err instanceof TypeError) {
		return fallbackMessage;
	}

	if (err instanceof Error && err.message.trim().length > 0) {
		return fallbackMessage;
	}

	return fallbackMessage;
}

export const FRIENDLY_ACTION_MESSAGES = {
	create: DEFAULT_MESSAGES.create,
	update: DEFAULT_MESSAGES.update,
	delete: DEFAULT_MESSAGES.delete,
	network: DEFAULT_MESSAGES.network,
	response: DEFAULT_MESSAGES.response
};
