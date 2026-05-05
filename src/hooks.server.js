import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const token = event.cookies.get('poudb_token');

	if (token) {
		event.locals.token = token;
	} else if (event.url.pathname.startsWith('/vault')) {
		redirect(303, '/');
	}

	return resolve(event);
}
