import { describe, expect, it } from "vitest";
import { generatePassword } from "./index";

const sequential = (length: number) => {
  const bytes = new Uint8Array(length);
  for (let index = 0; index < length; index += 1) bytes[index] = index % 256;
  return bytes;
};

describe("password generator", () => {
  it("omits ambiguous characters", () => {
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
  });
});
