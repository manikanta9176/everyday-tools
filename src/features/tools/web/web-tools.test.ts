import { describe, expect, it } from "vitest";
import { buildCurl, chmod, decodeJwt, digestText, parseCidr, parseUrl, testRegex } from "./web-tools";

describe("web tools", () => {
  it("parses a URL and hides the password", () => {
    const parsed = parseUrl("https://ada:secret@example.com:8443/docs?q=1#top");
    expect(parsed.hostname).toBe("example.com");
    expect(parsed.port).toBe("8443");
    expect(parsed.password).toBe("••••••");
    expect(parsed.params).toEqual([{ key: "q", value: "1" }]);
  });

  it("builds a quoted curl command", () => {
    expect(buildCurl({ method: "post", url: "https://example.com", headers: [{ name: "Accept", value: "application/json" }], body: "a'b" })).toContain("'a'\\''b'");
  });

  it("decodes a JWT without calling it verified", () => {
    const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replaceAll("=", "");
    const payload = btoa(JSON.stringify({ sub: "ada", exp: 1_700_000_000 })).replaceAll("=", "");
    const decoded = decodeJwt(`${header}.${payload}.sig`);
    expect(decoded.verified).toBe(false);
    expect(decoded.claims.expires).toBe("2023-11-14T22:13:20.000Z");
    expect((decoded.payload as { sub: string }).sub).toBe("ada");
  });

  it("hashes, calculates CIDR, chmod, and regex matches", async () => {
    expect(await digestText("SHA-256", "abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(parseCidr("192.168.1.10/24")).toMatchObject({ network: "192.168.1.0", broadcast: "192.168.1.255", hosts: 254 });
    expect(chmod({ owner: 7, group: 5, other: 5 })).toEqual({ octal: "755", symbolic: "rwxr-xr-x" });
    expect(testRegex("a+", "g", "baaa").matches[0]).toEqual({ value: "aaa", index: 1 });
    expect(() => testRegex("[", "", "a")).toThrow();
  });
});
