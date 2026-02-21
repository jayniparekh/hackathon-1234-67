import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const DIGEST = "sha256";

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, derivedKey] = hash.split(":");
    if (!salt || !derivedKey) return false;
    
    const suppliedHash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
    return timingSafeEqual(Buffer.from(derivedKey), Buffer.from(suppliedHash));
  } catch {
    return false;
  }
}
