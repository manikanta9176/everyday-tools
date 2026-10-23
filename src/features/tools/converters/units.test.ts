import { describe, expect, it } from "vitest";
import { convertBase, convertUnit, discount, fromRoman, gst, percentageChange, toRoman } from "./units";

describe("units and math", () => {
  it("distinguishes decimal and binary data units", () => {
    expect(convertUnit("data", "KB", "B", 1)).toBe(1000);
    expect(convertUnit("data", "KiB", "B", 1)).toBe(1024);
    expect(convertUnit("length", "km", "m", 1)).toBe(1000);
    expect(convertUnit("temperature", "c", "f", 0)).toBe(32);
    expect(convertUnit("temperature", "c", "f", 100)).toBe(212);
  });

  it("calculates percentages, GST, bases, and Roman numerals", () => {
    expect(percentageChange(80, 100).change).toBe(25);
    expect(discount(50, 10).total).toBe(45);
    expect(gst(100, 18, "add").gross).toBeCloseTo(118);
    expect(convertBase("255", 10, 16)).toBe("ff");
    expect(convertBase("11111111", 2, 10)).toBe("255");
    expect(toRoman(1990)).toBe("MCMXC");
    expect(fromRoman("IV")).toBe(4);
    expect(fromRoman("MCMXC")).toBe(1990);
    expect(() => toRoman(0)).toThrow();
  });
});
