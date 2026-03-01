import CryptoJS from "crypto-js";

// Use environment variable or fallback to a hardcoded string for development
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-dev-encryption-key-123";

/**
 * Encrypt a string using AES encryption
 */
export function encryptData(text: string): string {
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
}

/**
 * Decrypt an AES encrypted string
 */
export function decryptData(ciphertext: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}
