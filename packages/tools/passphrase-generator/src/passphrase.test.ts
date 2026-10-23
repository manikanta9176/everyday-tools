import { describe, expect, it } from "vitest";
import { generatePassphrase, PASSPHRASE_WORDS } from "./passphrase";
import type { ByteSource } from "@tools/random-secret-generator";

describe("passphrase", () => {
  it("uses the EFF short wordlist and a separator", () => {
    expect(PASSPHRASE_WORDS).toHaveLength(1296);
    const source: ByteSource = (length) => new Uint8Array(length);
    const result = generatePassphrase({
      wordCount: 4,
      separator: "-",
      capitalize: true,
      addNumber: false,
      source,
    });
    expect(result.phrase.split("-")).toHaveLength(4);
    expect(result.phrase.startsWith("Aardvark")).toBe(true);
    expect(result.bitsPerWord).toBeCloseTo(Math.log2(1296), 5);
  });
});
