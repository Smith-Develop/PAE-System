// AES-256-GCM encryption utility
// Safe for both Node.js and Edge Runtime
// On Edge (proxy), encryption is a no-op (DB access only happens in Node.js runtime)

let _rawKey: Uint8Array | null = null;

function getKey(): Uint8Array | null {
  if (_rawKey) return _rawKey;
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) return null;
  _rawKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    _rawKey[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return _rawKey;
}

export function encrypt(text: string): string {
  if (!text) return text;
  const key = getKey();
  if (!key) return text;

  try {
    // Only works in Node.js runtime (not Edge)
    const nodeCrypto = require("crypto");
    const iv = nodeCrypto.randomBytes(12);
    const cipher = nodeCrypto.createCipheriv("aes-256-gcm", Buffer.from(key), iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
  } catch {
    return text;
  }
}

export function decrypt(encrypted: string): string {
  if (!encrypted) return encrypted;
  const key = getKey();
  if (!key) return encrypted;
  if (!encrypted.includes(":")) return encrypted;

  try {
    const nodeCrypto = require("crypto");
    const [ivB64, tagB64, dataB64] = encrypted.split(":");
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const decipher = nodeCrypto.createDecipheriv("aes-256-gcm", Buffer.from(key), iv);
    decipher.setAuthTag(tag);
    return decipher.update(Buffer.from(dataB64, "base64")) + decipher.final("utf8");
  } catch {
    return encrypted;
  }
}
