/**
 * AES-256-GCM encryption utilities for storing sensitive credentials
 * (datasource auth tokens, API keys) in the database.
 *
 * Ciphertext format: "v1.<iv_hex>.<tag_hex>.<data_hex>"
 *
 * Requires APP_SECRETS_KEY env var: a 32-byte value encoded as base64.
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function getKey(): Buffer {
  const raw = process.env.APP_SECRETS_KEY;
  if (!raw) throw new Error("APP_SECRETS_KEY is not set");
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== KEY_LENGTH) {
    throw new Error(
      `APP_SECRETS_KEY must decode to exactly ${KEY_LENGTH} bytes (got ${buf.length})`
    );
  }
  return buf;
}

/**
 * Encrypt plaintext and return { ciphertext, last4 }.
 * `last4` is stored in the DB so admins can confirm which credential was saved.
 */
export function encryptSecret(plaintext: string): {
  ciphertext: string;
  last4: string;
} {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  const packed = `v1.${iv.toString("hex")}.${tag.toString("hex")}.${encrypted.toString("hex")}`;
  const last4 = plaintext.slice(-4);
  return { ciphertext: packed, last4 };
}

/**
 * Decrypt a ciphertext produced by `encryptSecret`.
 */
export function decryptSecret(packed: string): string {
  const parts = packed.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") {
    throw new Error("Invalid ciphertext format");
  }
  const [, ivHex, tagHex, dataHex] = parts;
  const key = getKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
