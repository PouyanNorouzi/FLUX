import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { COOKIE_SECRET } from '$env/static/private';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;

function getKey() {
	if (COOKIE_SECRET.length !== 64 || !/^[0-9a-f]+$/i.test(COOKIE_SECRET)) {
		throw new Error('COOKIE_SECRET must be a 64-character hex string (32 bytes)');
	}
	return Buffer.from(COOKIE_SECRET, 'hex');
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns a hex-encoded string: iv (12 B) + auth tag (16 B) + ciphertext.
 *
 * @param {string} plaintext
 * @returns {string}
 */
export function encrypt(plaintext) {
	const key = getKey();
	const iv = randomBytes(IV_BYTES);
	const cipher = createCipheriv(ALGORITHM, key, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return Buffer.concat([iv, tag, encrypted]).toString('hex');
}

/**
 * Decrypt a hex-encoded AES-256-GCM ciphertext produced by `encrypt`.
 * Throws if the ciphertext is tampered or the key is wrong.
 *
 * @param {string} ciphertext
 * @returns {string}
 */
export function decrypt(ciphertext) {
	const key = getKey();
	const buf = Buffer.from(ciphertext, 'hex');
	if (buf.length <= IV_BYTES + TAG_BYTES) {
		throw new Error('Invalid ciphertext length');
	}
	const iv = buf.subarray(0, IV_BYTES);
	const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
	const encrypted = buf.subarray(IV_BYTES + TAG_BYTES);
	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
