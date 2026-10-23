import { z } from "zod";

export const MAX_SECRET_BYTES = 1024;
export const MAX_BULK = 50;

const byteCountSchema = z.number().int().min(1).max(MAX_SECRET_BYTES);

export type ByteSource = (length: number) => Uint8Array;

export function cryptoBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(byteCountSchema.parse(length));
  crypto.getRandomValues(bytes);
  return bytes;
}

export function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function bytesToBase64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomFromAlphabet(length: number, alphabet: string, source: ByteSource = cryptoBytes) {
  const count = z.number().int().min(1).max(4096).parse(length);
  const chars = [...new Set(Array.from(alphabet))];
  if (chars.length < 2 || chars.length > 256) {
    throw new Error("Use between 2 and 256 unique characters.");
  }
  const limit = 256 - (256 % chars.length);
  const output: string[] = [];
  while (output.length < count) {
    const bytes = source(Math.max(32, count - output.length));
    for (const byte of bytes) {
      if (byte < limit) {
        output.push(chars[byte % chars.length]!);
        if (output.length === count) break;
      }
    }
  }
  return output.join("");
}

export type SecretFormat = "base64" | "base64url" | "hex" | "alphanumeric" | "custom";

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateSecret(options: {
  bytes: number;
  format: SecretFormat;
  alphabet?: string;
  count?: number;
  source?: ByteSource;
}) {
  const bytes = byteCountSchema.parse(options.bytes);
  const count = z.number().int().min(1).max(MAX_BULK).parse(options.count ?? 1);
  const source = options.source ?? cryptoBytes;
  const values = Array.from({ length: count }, () => {
    if (options.format === "alphanumeric") {
      return randomFromAlphabet(bytes, ALPHANUMERIC, source);
    }
    if (options.format === "custom") {
      return randomFromAlphabet(bytes, options.alphabet ?? "", source);
    }
    const raw = source(bytes);
    if (options.format === "hex") return bytesToHex(raw);
    if (options.format === "base64url") return bytesToBase64Url(raw);
    return bytesToBase64(raw);
  });
  return {
    values,
    entropyBits: options.format === "alphanumeric" || options.format === "custom" ? null : bytes * 8,
    encodedLength: values[0]?.length ?? 0,
  };
}

export function buildOpensslCommand(bytes: number, encoding: "base64" | "hex") {
  const count = byteCountSchema.parse(bytes);
  return `openssl rand -${encoding} ${count}`;
}
