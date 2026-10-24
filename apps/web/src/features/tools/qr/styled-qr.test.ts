import { describe, expect, it } from "vitest";
import { styledQrDataUrl, styledQrSvg } from "./styled-qr";

describe("styled QR", () => {
  it("draws a short code with round eyes and dot modules", async () => {
    const svg = await styledQrSvg("https://example.com");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('rx="12"');
    expect(svg).toContain("<circle");
    expect(svg).not.toContain("https://example.com");
    expect(styledQrDataUrl(svg)).toContain("data:image/svg+xml");
  });

  it("rounds a long code without leaving the modules as squares", async () => {
    const svg = await styledQrSvg("a".repeat(700), { errorCorrectionLevel: "L" });
    expect(svg).toContain("<circle");
    expect(svg).toContain('rx="12"');
  });

  it("ignores a color that could break the markup", async () => {
    const svg = await styledQrSvg("tools", { dark: "\"><script>", light: "#abc" });
    expect(svg).toContain('fill="#141311"');
    expect(svg).toContain('fill="#aabbcc"');
    expect(svg).not.toContain("script");
  });

  it("rejects empty text", async () => {
    await expect(styledQrSvg("   ")).rejects.toThrow(/Enter text/);
  });
});
