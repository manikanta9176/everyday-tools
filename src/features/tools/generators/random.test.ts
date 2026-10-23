import { describe, expect, it } from "vitest";
import {
  buildOpensslCommand,
  bytesToBase64,
  bytesToBase64Url,
  bytesToHex,
  generateApiKey,
  generatePassword,
  generateSecret,
  randomFromAlphabet,
} from "./random";

const sequential: (length: number) => Uint8Array = (length) => {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) bytes[i] = i % 256;
  return bytes;
};

describe("secret encoding", () => {
  it("encodes known bytes", () => {
    const bytes = Uint8Array.from([0, 1, 255, 16]);
    expect(bytesToHex(bytes)).toBe("0001ff10");
    expect(bytesToBase64(bytes)).toBe("AAH/EA==");
    expect(bytesToBase64Url(bytes)).toBe("AAH_EA");
  });

  it("uses the requested byte length for base64 and hex", () => {
    const secret = generateSecret({ bytes: 32, format: "base64", source: sequential });
    expect(secret.values).toHaveLength(1);
    expect(secret.entropyBits).toBe(256);
    expect(secret.values[0]).toBe(bytesToBase64(sequential(32)));
    expect(generateSecret({ bytes: 16, format: "hex", source: sequential }).values[0]).toHaveLength(32);
  });

  it("rejects biased leftovers when mapping to a custom alphabet", () => {
    const value = randomFromAlphabet(6, "abc", () => Uint8Array.from([0, 1, 2, 255, 3, 4, 5]));
    expect(value).toBe("abcabc");
    expect([...value].every((char) => "abc".includes(char))).toBe(true);
  });

  it("builds an OpenSSL command without claiming it matches the local token", () => {
    expect(buildOpensslCommand(32, "base64")).toBe("openssl rand -base64 32");
    expect(buildOpensslCommand(16, "hex")).toBe("openssl rand -hex 16");
    expect(() => buildOpensslCommand(0, "base64")).toThrow();
  });

  it("omits ambiguous characters and keeps a prefix", () => {
    const password = generatePassword({
      length: 32,
      lowercase: true,
      uppercase: true,
      digits: true,
      symbols: false,
      avoidAmbiguous: true,
      source: sequential,
    });
    expect(password.values[0]).toHaveLength(32);
    expect(password.values[0]).not.toMatch(/[O0oIl1|]/);
    expect(password.entropyBits).toBeGreaterThan(128);
    expect(
      generateApiKey({ prefix: "live", bytes: 8, encoding: "hex", source: sequential }).values[0],
    ).toMatch(/^live_[0-9a-f]{16}$/);
  });
});
