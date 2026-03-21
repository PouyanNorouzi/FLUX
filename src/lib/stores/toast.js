import { writable } from 'svelte/store';

const DEFAULT_TIMEOUT = 5000;
const MAX_TOASTS = 4;

/** @typedef {'error' | 'success'} ToastVariant */
/**
 * @typedef Toast
 * @property {string} id
 * @property {ToastVariant} variant
 * @property {string} title
 * @property {string} message
 * @property {number} timeout
 * @property {boolean} dismissible
 * @property {number} createdAt
 */
/**
 * @typedef ToastOptions
 * @property {ToastVariant} [variant]
 * @property {string} [title]
 * @property {number} [timeout]
 * @property {boolean} [dismissible]
 */

/** @type {number} */
let sequence = 0;

/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const timers = new Map();

function createToastId() {
	sequence += 1;
	return `toast_${Date.now()}_${sequence}`;
}

function clearToastTimer(/** @type {string} */ id) {
	const timer = timers.get(id);
	if (timer) {
		clearTimeout(timer);
		timers.delete(id);
	}
}

const { subscribe, update, set } = writable(/** @type {Toast[]} */ ([]));

function dismissToast(/** @type {string} */ id) {
	clearToastTimer(id);
	update((toasts) => toasts.filter((toast) => toast.id !== id));
}

function clearToasts() {
	timers.forEach((timer) => clearTimeout(timer));
	timers.clear();
	set([]);
}

function pushToast(/** @type {string} */ message, /** @type {ToastOptions} */ options = {}) {
	/** @type {string} */
	const normalizedMessage = String(message ?? '');

	/** @type {ToastOptions} */
	const config = options;

	if (!normalizedMessage) {
		return '';
	}

	const id = createToastId();
	const variant = config.variant ?? 'error';
	const timeout = typeof config.timeout === 'number' ? config.timeout : DEFAULT_TIMEOUT;
	const dismissible = config.dismissible ?? true;

	/** @type {Toast} */
	const toast = {
		id,
		variant,
		title: config.title ?? (variant === 'success' ? 'COMMIT_ACK' : 'FLUX_ALERT'),
		message: normalizedMessage,
		timeout,
		dismissible,
		createdAt: Date.now()
	};

	update((toasts) => {
		const next = [toast, ...toasts];
		if (next.length <= MAX_TOASTS) {
			return next;
		}

		const overflow = next.slice(MAX_TOASTS);
		overflow.forEach((item) => clearToastTimer(item.id));
		return next.slice(0, MAX_TOASTS);
	});

	if (timeout > 0) {
		const timer = setTimeout(() => {
			dismissToast(id);
		}, timeout);
		timers.set(id, timer);
	}

	return id;
}

function pushErrorToast(/** @type {string} */ message, /** @type {ToastOptions} */ options = {}) {
	return pushToast(message, {
		...options,
		variant: 'error',
		title: options.title ?? 'FLUX_ALERT'
	});
}

function pushSuccessToast(/** @type {string} */ message, /** @type {ToastOptions} */ options = {}) {
	return pushToast(message, {
		...options,
		variant: 'success',
		title: options.title ?? 'COMMIT_ACK'
	});
}

export const toastStore = {
	subscribe,
	pushToast,
	pushErrorToast,
	pushSuccessToast,
	dismissToast,
	clearToasts
};
