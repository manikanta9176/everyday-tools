import { describe, expect, it } from "vitest";
import { readSharePayload, sharePageUrl } from "./share-link";

describe("share link", () => {
  it("turns a local page into a link the other phone can open", () => {
    expect(sharePageUrl("http://localhost:3311/tools/qr-file-share", "1abcdefghijabcdefghij", ["127.0.0.1", "192.168.1.20"])).toBe(
      "http://192.168.1.20:3311/tools/qr-file-share#1abcdefghijabcdefghij",
    );
  });

  it("keeps a public address so the phone camera can open it", () => {
    expect(sharePageUrl("https://tools.manikanta.net/tools/qr-file-share", "1abcdefghijabcdefghij", ["192.168.1.20"])).toBe(
      "https://tools.manikanta.net/tools/qr-file-share#1abcdefghijabcdefghij",
    );
  });

  it("reads the code from a scanned link and ignores the offer echoed back", () => {
    expect(readSharePayload("https://tools.manikanta.net/tools/qr-file-share#1abcdefghijabcdefghij")).toBe("1abcdefghijabcdefghij");
    expect(readSharePayload("")).toBe("");
    expect(readSharePayload("#short")).toBe("");
  });

  it("skips a link that is too long to scan", () => {
    expect(sharePageUrl("https://tools.manikanta.net/tools/qr-file-share", `1${"a".repeat(2000)}`)).toBe("");
  });
});
