import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { addWatermark, extractPages, inspectPdf, mergePdfs, parseRanges, rotatePages, textToPdf } from "./pdf";

async function samplePdf(pages: number) {
  const document = await PDFDocument.create();
  for (let index = 0; index < pages; index += 1) document.addPage();
  return document.save();
}

describe("pdf operations", () => {
  it("parses ranges and merges documents", async () => {
    expect(parseRanges("1-2,4", 4)).toEqual([0, 1, 3]);
    expect(() => parseRanges("5", 2)).toThrow(/does not fit/);
    const merged = await mergePdfs([await samplePdf(2), await samplePdf(1)]);
    expect((await PDFDocument.load(merged)).getPageCount()).toBe(3);
  });

  it("extracts, rotates, watermarks, and creates a text PDF", async () => {
    const original = await samplePdf(3);
    const extracted = await extractPages(original, "2-3");
    expect((await PDFDocument.load(extracted)).getPageCount()).toBe(2);
    const rotated = await rotatePages(original, 90, "1");
    expect((await PDFDocument.load(rotated)).getPage(0).getRotation().angle).toBe(90);
    const marked = await addWatermark(original, "DRAFT");
    expect((await inspectPdf(marked)).pages).toBe(3);
    const text = await textToPdf("Hello from Tools");
    expect((await PDFDocument.load(text)).getPageCount()).toBe(1);
  });
});
