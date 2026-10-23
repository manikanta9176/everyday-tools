import { describe, expect, it } from "vitest";
import { aspectRatio, dominantColors, fitDimensions, scaledDimensions } from "./geometry";

describe("image geometry", () => {
  it("contains and covers without changing the source aspect when locked", () => {
    expect(fitDimensions(4000, 2000, 1000, 1000, "contain")).toEqual({ width: 1000, height: 500 });
    expect(fitDimensions(4000, 2000, 1000, 1000, "cover")).toEqual({ width: 2000, height: 1000 });
    expect(scaledDimensions(200, 100, 0, true, 100).height).toBe(50);
    expect(aspectRatio(1920, 1080)).toMatchObject({ width: 16, height: 9 });
  });

  it("returns the most common quantized colors", () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 0, 0,
    ]);
    expect(dominantColors(pixels, 2)[0]).toMatch(/^#[0-9a-f]{6}$/);
  });
});
