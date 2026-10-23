"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, TextArea } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { downloadBytes } from "@/lib/downloads";
import { addPageNumbers, addWatermark, extractPages, imagesToPdf, inspectPdf, mergePdfs, rotatePages, textToPdf } from "@/features/tools/documents/pdf";

async function read(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

export default function PdfTools() {
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("1-2");
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [watermark, setWatermark] = useState("DRAFT");
  const [text, setText] = useState("Hello from Tools");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(bytes: Uint8Array, name: string) {
    downloadBytes(name, bytes, "application/pdf");
  }

  async function act(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not process that PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">PDFs are opened with pdf-lib in this browser. Encrypted or damaged files are rejected. This does not compress PDFs or permanently redact text.</p>
      <label className="grid gap-2 rounded-xl border border-dashed bg-card p-4 text-sm">
        PDF or image files
        <input aria-label="PDF files" type="file" accept="application/pdf,image/png,image/jpeg" multiple onChange={(event) => setFiles([...(event.target.files ?? [])])} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" disabled={busy} onClick={() => void act(async () => save(await mergePdfs(await Promise.all(files.map(read))), "merged.pdf"))}>Merge</Button>
        <Button disabled={busy} onClick={() => void act(async () => { const first = files[0]; if (!first) throw new Error("Choose a PDF."); save(await extractPages(await read(first), range), "pages.pdf"); })}>Extract pages</Button>
        <Button disabled={busy} onClick={() => void act(async () => { const first = files[0]; if (!first) throw new Error("Choose a PDF."); save(await rotatePages(await read(first), angle, range), "rotated.pdf"); })}>Rotate</Button>
        <Button disabled={busy} onClick={() => void act(async () => { const first = files[0]; if (!first) throw new Error("Choose a PDF."); save(await addPageNumbers(await read(first)), "numbered.pdf"); })}>Page numbers</Button>
        <Button disabled={busy} onClick={() => void act(async () => { const first = files[0]; if (!first) throw new Error("Choose a PDF."); save(await addWatermark(await read(first), watermark), "watermarked.pdf"); })}>Watermark</Button>
        <Button disabled={busy} onClick={() => void act(async () => save(await textToPdf(text), "note.pdf"))}>Text PDF</Button>
        <Button disabled={busy} onClick={() => void act(async () => save(await imagesToPdf(await Promise.all(files.filter((file) => file.type.startsWith("image/")).map(async (file) => ({ bytes: await read(file), type: file.type })))), "images.pdf"))}>Images to PDF</Button>
        <Button disabled={busy} onClick={() => void act(async () => { const first = files[0]; if (!first) throw new Error("Choose a PDF."); const details = await inspectPdf(await read(first)); setInfo(`${details.pages} pages, ${details.bytes} bytes\n${details.title || "Untitled"}\n${details.pageSizes.map((page) => `Page ${page.page}: ${page.width} × ${page.height} pt`).join("\n")}`); })}>Inspect</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Page range" htmlFor="range" hint="Example: 1-2,4"><Input id="range" value={range} onChange={(event) => setRange(event.target.value)} /></Field>
        <Field label="Rotation" htmlFor="angle"><select id="angle" className="h-10 rounded-md border bg-card px-3" value={angle} onChange={(event) => setAngle(Number(event.target.value) as 90 | 180 | 270)}><option value={90}>90</option><option value={180}>180</option><option value={270}>270</option></select></Field>
        <Field label="Watermark" htmlFor="watermark"><Input id="watermark" value={watermark} onChange={(event) => setWatermark(event.target.value)} /></Field>
      </div>
      <TextArea aria-label="Text PDF contents" value={text} onChange={(event) => setText(event.target.value)} />
      <ErrorNote message={error} />
      <OutputBlock value={info} empty="Inspection details appear here." />
    </div>
  );
}
