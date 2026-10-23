import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { convertColor, cssVariablesToJson, gradientCss, jsonToCssVariables, parseColor, simulateColorVision } from "./color-engine";

describe("color engine", () => {
  it("converts a known hex color into RGB and OKLCH", () => {
    const color = convertColor("#8B5CF6");
    expect(color.hex).toBe("#8b5cf6");
    expect(color.values.find((item) => item.id === "rgb")?.value).toBe("rgb(139, 92, 246)");
    expect(color.values.find((item) => item.id === "oklch")?.value).toMatch(/^oklch\(/);
    expect(color.outOfSrgbGamut).toBe(false);
    expect(parseColor("rebeccapurple").toString({ format: "hex" })).toBe("#639");
  });

  it("keeps alpha and flags wide-gamut colors", () => {
    expect(convertColor("#8B5CF680").alpha).toBeLessThan(1);
    expect(convertColor("color(display-p3 1 0 0)").outOfSrgbGamut).toBe(true);
    expect(() => convertColor("not-a-color")).toThrow(/not a color/);
  });

  it("calculates WCAG contrast", () => {
    const blackOnWhite = contrastRatio("#000000", "#ffffff");
    expect(blackOnWhite.ratio).toBeCloseTo(21, 2);
    expect(blackOnWhite.aaaNormal).toBe(true);
    const gray = contrastRatio("#777777", "#ffffff");
    expect(gray.ratio).toBeGreaterThan(4);
    expect(gray.ratio).toBeLessThan(4.6);
  });

  it("builds gradients, CSS variables, and a vision simulation", () => {
    expect(gradientCss(["#000", "#fff"], 90)).toBe("linear-gradient(90deg, #000000, #ffffff)");
    expect(cssVariablesToJson("--ink: #111;\n--paper: white;")).toEqual({ "--ink": "#111", "--paper": "white" });
    expect(jsonToCssVariables('{"ink":"#111"}')).toContain("--ink: #111;");
    expect(simulateColorVision("#ff0000", "protanopia")).toMatch(/^#[0-9a-f]{6}$/);
  });
});
