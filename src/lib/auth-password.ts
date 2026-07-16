// Password hashing utilities using scrypt (built into Node.js crypto)
// Format: <salt>:<params>:<hash> (all base64)
// Based on https://github.com/nextauthjs/next-auth/discussions/6167

import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// scrypt parameters (N, r, p)
// N = CPU/memory cost factor (must be power of 2)
// r = block size
// p = parallelization factor
// Default: N=16384, r=8, p=1 (OWASP 2023 recommendation for scrypt)
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;
const SALT_LEN = 16;

function paramsToString(params: typeof SCRYPT_PARAMS): string {
  return `${params.N}:${params.r}:${params.p}`;
}

function stringToParams(str: string): typeof SCRYPT_PARAMS {
  const [N, r, p] = str.split(":").map(Number);
  return { N, r, p };
}

/**
 * Hash a plaintext password using scrypt.
 * Returns a string in format: <salt_b64>:<params>:<hash_b64>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derivedKey = (await scryptAsync(password, salt, KEY_LEN, SCRYPT_PARAMS)) as Buffer;
  const paramsStr = paramsToString(SCRYPT_PARAMS);
  return `${salt.toString("base64")}:${paramsStr}:${derivedKey.toString("base64")}`;
}

/**
 * Verify a plaintext password against a stored hash.
 * The hash must be in format: <salt_b64>:<params>:<hash_b64>
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split(":");
  if (parts.length !== 3) return false;

  const [saltB64, paramsStr, expectedHashB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const params = stringToParams(paramsStr);
  const expectedHash = Buffer.from(expectedHashB64, "base64");

  const derivedKey = (await scryptAsync(password, salt, KEY_LEN, params)) as Buffer;
  return timingSafeEqual(derivedKey, expectedHash);
}
