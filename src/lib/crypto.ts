import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_HEX = process.env.ENCRYPTION_KEY || "";
const KEY = Buffer.from(KEY_HEX, "hex");

export function encrypt(text: string): string {
  if (!text) return text;
  if (KEY.length !== 32) return text; // Key not configured, skip encryption
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decrypt(encrypted: string): string {
  if (!encrypted) return encrypted;
  if (!encrypted.includes(":")) return encrypted; // Not encrypted
  if (KEY.length !== 32) return encrypted; // Key not configured
  try {
    const [ivB64, tagB64, dataB64] = encrypted.split(":");
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);
    return decipher.update(Buffer.from(dataB64, "base64")) + decipher.final("utf8");
  } catch {
    return encrypted; // Return as-is if decryption fails (e.g., data was never encrypted)
  }
}
