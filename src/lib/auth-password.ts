// Password hashing utilities using scrypt (built into Node.js crypto)
// Format: <salt_b64>:<N>:<r>:<p>:<hash_b64>
// Note: params are stored diluted across 4 colon-separated segments (since
// params themselves contain colons when serialised N:r:p).

import { scrypt, randomBytes, timingSafeEqual } from "crypto";

// scrypt parameters (N, r, p)
// N = CPU/memory cost factor (must be power of 2)
// r = block size
// p = parallelization factor
// Default: N=16384, r=8, p=1 (OWASP 2023 recommendation for scrypt)
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;
const SALT_LEN = 16;

/**
 * Hash a plaintext password using scrypt.
 * Returns a string in format: <salt_b64>:<N>:<r>:<p>:<hash_b64>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const { N, r, p } = SCRYPT_PARAMS;
  const derivedKey = (await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LEN, { N, r, p }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  })) as Buffer;
  return `${salt.toString("base64")}:${N}:${r}:${p}:${derivedKey.toString("base64")}`;
}

/**
 * Verify a plaintext password against a stored hash.
 * Hash must be in format: <salt_b64>:<N>:<r>:<p>:<hash_b64>
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split(":");
  if (parts.length !== 5) return false;

  const [saltB64, N, r, p, expectedHashB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const expectedHash = Buffer.from(expectedHashB64, "base64");

  const derivedKey = (await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LEN, { N: Number(N), r: Number(r), p: Number(p) }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  })) as Buffer;

  if (derivedKey.length !== expectedHash.length) return false;
  return timingSafeEqual(derivedKey, expectedHash);
}
