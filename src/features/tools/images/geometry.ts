export type FitMode = "contain" | "cover" | "stretch";

export function fitDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  mode: FitMode,
) {
  if ([sourceWidth, sourceHeight, targetWidth, targetHeight].some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("Widths and heights must be positive numbers.");
  }
  if (mode === "stretch") return { width: Math.round(targetWidth), height: Math.round(targetHeight) };
  const scale = mode === "contain"
    ? Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight)
    : Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  return { width: Math.max(1, Math.round(sourceWidth * scale)), height: Math.max(1, Math.round(sourceHeight * scale)) };
}

export function scaledDimensions(width: number, height: number, percent: number, lockAspect: boolean, nextWidth?: number, nextHeight?: number) {
  if (percent) return { width: Math.max(1, Math.round(width * percent / 100)), height: Math.max(1, Math.round(height * percent / 100)) };
  if (lockAspect && nextWidth && nextWidth !== width) {
    return { width: nextWidth, height: Math.max(1, Math.round(height * (nextWidth / width))) };
  }
  if (lockAspect && nextHeight && nextHeight !== height) {
    return { width: Math.max(1, Math.round(width * (nextHeight / height))), height: nextHeight };
  }
  return { width: nextWidth || width, height: nextHeight || height };
}

export function aspectRatio(width: number, height: number) {
  const divisor = gcd(Math.round(width), Math.round(height));
  return { width: Math.round(width) / divisor, height: Math.round(height) / divisor, decimal: width / height };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function dominantColors(pixels: Uint8ClampedArray, count = 5) {
  const buckets = new Map<string, number>();
  for (let i = 0; i < pixels.length; i += 16) {
    const alpha = pixels[i + 3] ?? 255;
    if (alpha < 16) continue;
    const key = [pixels[i]! >> 4, pixels[i + 1]! >> 4, pixels[i + 2]! >> 4].join(",");
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(",").map((part) => (Number(part) << 4) + 8);
      return `#${[r, g, b].map((channel) => channel!.toString(16).padStart(2, "0")).join("")}`;
    });
}

export const IMAGE_PRESETS = [
  { id: "square", label: "1:1", width: 1080, height: 1080 },
  { id: "landscape", label: "16:9", width: 1920, height: 1080 },
  { id: "portrait", label: "9:16", width: 1080, height: 1920 },
  { id: "four-three", label: "4:3", width: 1600, height: 1200 },
  { id: "three-two", label: "3:2", width: 1800, height: 1200 },
  { id: "og", label: "Open Graph", width: 1200, height: 630 },
] as const;
