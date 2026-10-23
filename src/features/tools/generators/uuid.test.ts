import { describe, expect, it } from "vitest";
import { uuidV4, uuidV7 } from "./uuid";

describe("uuid", () => {
  it("creates a version 4 uuid", () => {
    expect(uuidV4()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("embeds the timestamp and version bits in uuid v7", () => {
    const timestamp = Date.UTC(2026, 9, 23, 4, 50, 0);
    const id = uuidV7(timestamp);
    const hex = id.replaceAll("-", "");
    expect(hex.slice(0, 12)).toBe(timestamp.toString(16).padStart(12, "0"));
    expect(hex[12]).toBe("7");
    expect("89ab").toContain(hex[16]);
  });
});
