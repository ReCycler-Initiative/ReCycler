import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;

function getKey(): Buffer {
  const keyB64 = process.env.APP_SECRETS_KEY;
  if (!keyB64) {
    throw new Error("APP_SECRETS_KEY is not set");
  }

  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) {
    throw new Error(
      `APP_SECRETS_KEY must be 32 bytes (base64), got ${key.length} bytes`
    );
  }

  return key;
}

export function encryptSecret(plaintext: string): {
  ciphertext: string;
  last4: string;
} {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  const packed = [
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");

  const trimmed = plaintext.trim();
  const last4 = trimmed.length >= 4 ? trimmed.slice(-4) : trimmed;

  return { ciphertext: packed, last4 };
}

export function decryptSecret(packed: string): string {
  const [version, ivB64, tagB64, dataB64] = packed.split(".");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid ciphertext format");
  }

  const key = getKey();
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return plaintext.toString("utf8");
}
