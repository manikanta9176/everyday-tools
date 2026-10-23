import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

async function loadPdf(bytes: Uint8Array) {
  try {
    return await PDFDocument.load(bytes);
  } catch {
    throw new Error("That PDF could not be opened. It may be encrypted, damaged, or not a PDF.");
  }
}

export async function mergePdfs(files: Uint8Array[]) {
  if (files.length < 2) throw new Error("Choose at least two PDF files to merge.");
  const merged = await PDFDocument.create();
  for (const file of files) {
    const document = await loadPdf(file);
    const pages = await merged.copyPages(document, document.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return merged.save();
}

export async function extractPages(file: Uint8Array, ranges: string) {
  const document = await loadPdf(file);
  const indexes = parseRanges(ranges, document.getPageCount());
  const next = await PDFDocument.create();
  const pages = await next.copyPages(document, indexes);
  pages.forEach((page) => next.addPage(page));
  return next.save();
}

export function parseRanges(ranges: string, pageCount: number) {
  const indexes: number[] = [];
  for (const part of ranges.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [startSource, endSource] = trimmed.split("-");
    const start = Number(startSource);
    const end = endSource === undefined ? start : Number(endSource);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > pageCount || end < start) {
      throw new Error(`Page range “${trimmed}” does not fit a ${pageCount}-page document. Pages are numbered from 1.`);
    }
    for (let page = start; page <= end; page += 1) indexes.push(page - 1);
  }
  if (!indexes.length) throw new Error("Enter a page range such as 1-2,4.");
  return indexes;
}

export async function rotatePages(file: Uint8Array, angle: 90 | 180 | 270, ranges?: string) {
  const document = await loadPdf(file);
  const indexes = ranges?.trim() ? parseRanges(ranges, document.getPageCount()) : document.getPageIndices();
  for (const index of indexes) {
    const page = document.getPage(index);
    page.setRotation(degrees((page.getRotation().angle + angle) % 360));
  }
  return document.save();
}

export async function inspectPdf(file: Uint8Array) {
  const document = await loadPdf(file);
  return {
    pages: document.getPageCount(),
    title: document.getTitle() ?? "",
    author: document.getAuthor() ?? "",
    pageSizes: document.getPages().map((page, index) => ({
      page: index + 1,
      width: round(page.getWidth()),
      height: round(page.getHeight()),
    })),
    bytes: file.byteLength,
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export async function addPageNumbers(file: Uint8Array) {
  const document = await loadPdf(file);
  const font = await document.embedFont(StandardFonts.Helvetica);
  document.getPages().forEach((page, index) => {
    const text = String(index + 1);
    const width = page.getWidth();
    page.drawText(text, { x: width / 2 - font.widthOfTextAtSize(text, 10) / 2, y: 24, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  });
  return document.save();
}

export async function addWatermark(file: Uint8Array, text: string) {
  if (!text.trim()) throw new Error("Enter watermark text.");
  const document = await loadPdf(file);
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  for (const page of document.getPages()) {
    page.drawText(text.slice(0, 80), {
      x: 48,
      y: page.getHeight() / 2,
      size: 32,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.35,
      rotate: degrees(30),
    });
  }
  return document.save();
}

export async function imagesToPdf(images: { bytes: Uint8Array; type: string }[]) {
  if (!images.length) throw new Error("Choose at least one PNG or JPEG image.");
  const document = await PDFDocument.create();
  for (const image of images) {
    const embedded = image.type.includes("png") ? await document.embedPng(image.bytes) : await document.embedJpg(image.bytes);
    const page = document.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
  }
  return document.save();
}

export async function textToPdf(text: string) {
  if (!text.trim()) throw new Error("Enter the text to place on the page.");
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const page = document.addPage();
  const words = text.slice(0, 5000).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, 12) > 500) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  lines.slice(0, 40).forEach((item, index) => {
    page.drawText(item, { x: 48, y: page.getHeight() - 72 - index * 18, size: 12, font, color: rgb(0.1, 0.1, 0.1) });
  });
  return document.save();
}
