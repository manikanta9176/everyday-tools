import { describe, expect, it } from "vitest";
import {
  binaryToText,
  buildQuery,
  countUtf8,
  decodeDataUrl,
  decodeHtml,
  decodeUtf8Base64,
  decodeUtf8Base64Url,
  encodeDataUrl,
  encodeHtml,
  encodeUtf8Base64,
  encodeUtf8Base64Url,
  escapeJsonString,
  hexToText,
  inspectUnicode,
  parseQuery,
  textToBinary,
  textToHex,
  unescapeJsonString,
} from "./codecs";
import { lookupMime } from "./mime";

describe("codecs", () => {
  it("round-trips Unicode through Base64, Base64URL, and hex", () => {
    const text = "café 😀";
    expect(decodeUtf8Base64(encodeUtf8Base64(text))).toBe(text);
    expect(decodeUtf8Base64Url(encodeUtf8Base64Url(text))).toBe(text);
    expect(hexToText(textToHex(text))).toBe(text);
    expect(textToHex("A")).toBe("41");
  });

  it("explains malformed Base64 and hex", () => {
    expect(() => decodeUtf8Base64("abc")).toThrow(/Base64/);
    expect(() => hexToText("zzz")).toThrow(/Hex/);
  });

  it("encodes HTML, JSON escapes, and binary", () => {
    expect(encodeHtml(`<a href="x">`)).toBe("&lt;a href=&quot;x&quot;&gt;");
    expect(decodeHtml("&amp;&#39;&#x1F600;")).toBe("&'\u{1F600}");
    expect(unescapeJsonString(escapeJsonString('say "hi"\n'))).toBe('say "hi"\n');
    expect(binaryToText(textToBinary("A"))).toBe("A");
  });

  it("counts UTF-8 bytes separately from characters", () => {
    expect(countUtf8("é")).toEqual({ characters: 1, utf16CodeUnits: 1, utf8Bytes: 2 });
    expect(countUtf8("😀")).toEqual({ characters: 1, utf16CodeUnits: 2, utf8Bytes: 4 });
    expect(inspectUnicode("A")[0]).toMatchObject({ codePoint: "U+0041", escape: "\\u0041" });
  });

  it("handles data URLs and query strings", () => {
    const url = encodeDataUrl(new TextEncoder().encode("hi"), "text/plain");
    expect(decodeDataUrl(url).text).toBe("hi");
    expect(parseQuery("https://example.com/a?q=café&x=1")).toEqual([
      { key: "q", value: "café" },
      { key: "x", value: "1" },
    ]);
    expect(buildQuery([{ key: "q", value: "a b" }])).toBe("?q=a+b");
    expect(lookupMime("png")[0]?.type).toBe("image/png");
  });
});
