import { LIMITS } from "@/lib/limits";
import { dominantColors, fitDimensions, type FitMode } from "./geometry";

export type ImageResult = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  sourceBytes: number;
};

export async function renderImage(
  file: File,
  options: {
    mime: "image/jpeg" | "image/png" | "image/webp";
    quality: number;
    width?: number;
    height?: number;
    mode: FitMode;
    rotate: 0 | 90 | 180 | 270;
    flipH: boolean;
    flipV: boolean;
    crop?: { x: number; y: number; width: number; height: number } | null;
    background: string;
    allowFlatten: boolean;
  },
): Promise<ImageResult> {
  if (file.size > LIMITS.fileBytes) throw new Error("This tool accepts files up to 25 MB.");
  const bitmap = await createImageBitmap(file);
  if (bitmap.width * bitmap.height > LIMITS.imagePixels) {
    bitmap.close();
    throw new Error("That image has too many pixels to process here.");
  }
  const transparent = await sampleAlpha(bitmap);
  if (transparent && options.mime === "image/jpeg" && !options.allowFlatten) {
    bitmap.close();
    throw new Error("This image has transparency. JPEG cannot keep it. Choose a background and confirm flattening, or export PNG or WebP.");
  }
  const crop = options.crop ?? { x: 0, y: 0, width: bitmap.width, height: bitmap.height };
  const rotated = options.rotate === 90 || options.rotate === 270;
  const croppedWidth = crop.width;
  const croppedHeight = crop.height;
  const baseWidth = rotated ? croppedHeight : croppedWidth;
  const baseHeight = rotated ? croppedWidth : croppedHeight;
  const target = options.width && options.height
    ? fitDimensions(baseWidth, baseHeight, options.width, options.height, options.mode)
    : { width: baseWidth, height: baseHeight };
  const canvas = document.createElement("canvas");
  canvas.width = options.mode === "cover" && options.width ? options.width : target.width;
  canvas.height = options.mode === "cover" && options.height ? options.height : target.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot draw images.");
  if (options.mime === "image/jpeg" || options.allowFlatten) {
    context.fillStyle = options.background || "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((options.rotate * Math.PI) / 180);
  context.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);
  const drawWidth = rotated ? target.height : target.width;
  const drawHeight = rotated ? target.width : target.height;
  context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  context.restore();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, options.mime, options.quality));
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;
  bitmap.close();
  if (!blob || blob.size === 0) throw new Error("This browser could not encode that format.");
  if (blob.type && blob.type !== options.mime) {
    throw new Error(`The browser encoded ${blob.type} instead of ${options.mime}.`);
  }
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    sourceWidth,
    sourceHeight,
    sourceBytes: file.size,
  };
}

async function sampleAlpha(bitmap: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(32, bitmap.width);
  canvas.height = Math.min(32, bitmap.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return false;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let index = 3; index < pixels.length; index += 4) {
    if ((pixels[index] ?? 255) < 250) return true;
  }
  return false;
}

export async function readImageMetadata(file: File) {
  const exifr = await import("exifr");
  const data = await exifr.parse(file).catch(() => null);
  return data ?? {};
}

export function colorsFromImageData(pixels: Uint8ClampedArray) {
  return dominantColors(pixels, 6);
}
