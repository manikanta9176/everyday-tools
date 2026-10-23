import { cryptoBytes, type ByteSource } from "@tools/random-secret-generator";
import words from "./eff-short-words.json";

export const PASSPHRASE_WORDS = words;

function indexFromBytes(source: ByteSource) {
  const size = PASSPHRASE_WORDS.length;
  const space = 65536;
  const limit = space - (space % size);
  for (;;) {
    const bytes = source(2);
    const value = (bytes[0]! << 8) | bytes[1]!;
    if (value < limit) return value % size;
  }
}

export function generatePassphrase(options: {
  wordCount: number;
  separator: string;
  capitalize: boolean;
  addNumber: boolean;
  source?: ByteSource;
}) {
  if (!Number.isInteger(options.wordCount) || options.wordCount < 4 || options.wordCount > 12) {
    throw new Error("Choose between 4 and 12 words.");
  }
  if (options.separator.length > 3) {
    throw new Error("Use a separator of up to 3 characters.");
  }
  const source = options.source ?? cryptoBytes;
  const picked = Array.from({ length: options.wordCount }, () => {
    const word = PASSPHRASE_WORDS[indexFromBytes(source)]!;
    return options.capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  });
  let phrase = picked.join(options.separator);
  if (options.addNumber) phrase += `${options.separator}${source(1)[0]! % 100}`;
  return {
    phrase,
    bitsPerWord: Math.log2(PASSPHRASE_WORDS.length),
    wordlistSize: PASSPHRASE_WORDS.length,
  };
}
