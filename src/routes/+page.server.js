import { redirect, fail } from '@sveltejs/kit';
import { PoudbClient, ServerMessageError } from 'poudb-client';
import { encrypt } from '$lib/cookie-crypto.server.js';

function resolveDatabasePort() {
	const parsed = Number(process.env.POUDB_PORT ?? '3005');
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 3005;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (locals.token) {
		redirect(303, '/vault');
	}
	return {};
}

/** @type {import('./$types').Actions} */
export const actions = {
	authenticate: async ({ request, cookies }) => {
		const formData = await request.formData();
		const passkey = String(formData.get('passkey') ?? '').trim();

		if (!passkey) {
			return fail(400, { code: 'EMPTY_TOKEN' });
		}

		const client = new PoudbClient({
			host: process.env.POUDB_HOST ?? '127.0.0.1',
			port: resolveDatabasePort()
		});

		try {
			await client.connect();
			await client.auth(passkey);
		} catch (error) {
			if (error instanceof ServerMessageError) {
				return fail(401, { code: 'INVALID_TOKEN' });
			}
			return fail(503, { code: 'DB_UNAVAILABLE' });
		} finally {
			try {
				await client.disconnect();
			} catch {
				// best-effort disconnect
			}
		}
		try {
			const token = encrypt(passkey);
			cookies.set('poudb_token', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: false
			});
		} catch (error) {
			console.error(error);
			return fail(400, { code: 'ENCRYPT_FAILED' });
		}

		redirect(303, '/vault');
	}
};
