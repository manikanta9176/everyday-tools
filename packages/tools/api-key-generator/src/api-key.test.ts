import { describe, expect, it } from "vitest";
import { generateApiKey } from "./index";

const sequential = (length: number) => {
  const bytes = new Uint8Array(length);
  for (let index = 0; index < length; index += 1) bytes[index] = index % 256;
  return bytes;
};

describe("api key generator", () => {
  it("keeps the prefix and hex length", () => {
    expect(generateApiKey({ prefix: "live", bytes: 8, encoding: "hex", source: sequential }).values[0]).toMatch(
      /^live_[0-9a-f]{16}$/,
    );
  });
});
