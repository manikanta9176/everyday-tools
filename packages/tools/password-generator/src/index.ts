import { z } from "zod";
import { MAX_BULK, randomFromAlphabet, type ByteSource } from "@tools/random-secret-generator";

const AMBIGUOUS = new Set(["O", "0", "o", "I", "l", "1", "|"]);

export function generatePassword(options: {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
  count?: number;
  source?: ByteSource;
}) {
  const length = z.number().int().min(8).max(128).parse(options.length);
  let alphabet = "";
  if (options.lowercase) alphabet += "abcdefghijklmnopqrstuvwxyz";
  if (options.uppercase) alphabet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.digits) alphabet += "0123456789";
  if (options.symbols) alphabet += "!@#$%^&*()-_=+[]{};:,.?";
  if (options.avoidAmbiguous) {
    alphabet = [...alphabet].filter((character) => !AMBIGUOUS.has(character)).join("");
  }
  if (new Set(alphabet).size < 2) {
    throw new Error("Choose at least one character set with two or more characters.");
  }
  const count = z.number().int().min(1).max(MAX_BULK).parse(options.count ?? 1);
  const values = Array.from({ length: count }, () => randomFromAlphabet(length, alphabet, options.source));
  return {
    values,
    entropyBits: Math.log2(new Set(alphabet).size) * length,
    alphabetSize: new Set(alphabet).size,
  };
}
