import { redirect } from '@sveltejs/kit';
import { decrypt } from '$lib/cookie-crypto.server.js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const token = event.cookies.get('poudb_token');

	if (token) {
		try {
			event.locals.token = decrypt(token);
		} catch {
			// Tampered or invalid cookie — clear it and redirect to login
			event.cookies.delete('poudb_token', { path: '/' });
			if (event.url.pathname.startsWith('/vault')) {
				redirect(303, '/');
			}
		}
	} else if (event.url.pathname.startsWith('/vault')) {
		redirect(303, '/');
	}

	return resolve(event);
}
