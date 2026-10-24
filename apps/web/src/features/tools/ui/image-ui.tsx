"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDrop } from "@/components/ui/file-drop";
import { Field, Input, RangeControl, Select } from "@/components/ui/field";
import { ErrorNote, Toggle } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { downloadBlob } from "@/lib/downloads";
import { formatBytes } from "@/lib/utils";
import { IMAGE_PRESETS, aspectRatio } from "@/features/tools/images/geometry";
import { colorsFromImageData, readImageMetadata, renderImage, type ImageResult } from "@/features/tools/images/process";

type Mime = "image/jpeg" | "image/png" | "image/webp";

export default function ImageTools({ slug }: { slug: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [mime, setMime] = useState<Mime>(slug === "image-converter" ? "image/webp" : "image/jpeg");
  const [quality, setQuality] = useState(0.8);
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [rotate, setRotate] = useState<0 | 90 | 180 | 270>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [background, setBackground] = useState("#ffffff");
  const [allowFlatten, setAllowFlatten] = useState(false);
  const [meta, setMeta] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => {
    if (result?.url) URL.revokeObjectURL(result.url);
  }, [result]);

  async function run() {
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    setBusy(true);
    try {
      if (slug === "image-metadata") {
        const data = await readImageMetadata(file);
        setMeta(Object.keys(data).length ? JSON.stringify(data, null, 2) : "No EXIF metadata was found. A re-encoded download still drops metadata the browser does not preserve.");
      }
      if (slug === "image-colors" || slug === "image-inspector" || slug === "image-data-url") {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(bitmap.width, 80);
        canvas.height = Math.min(bitmap.height, 80);
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        if (context) setColors(colorsFromImageData(context.getImageData(0, 0, canvas.width, canvas.height).data));
        const ratio = aspectRatio(bitmap.width, bitmap.height);
        if (slug === "image-inspector") {
          setMeta(`${bitmap.width} × ${bitmap.height} px\n${ratio.width}:${ratio.height} (${ratio.decimal.toFixed(3)})\n${formatBytes(file.size)}`);
        }
        if (slug === "image-data-url") {
          const full = document.createElement("canvas");
          full.width = bitmap.width;
          full.height = bitmap.height;
          full.getContext("2d")?.drawImage(bitmap, 0, 0);
          setMeta(full.toDataURL(file.type || "image/png"));
        }
        bitmap.close();
      }
      if (slug === "image-inspector" || slug === "image-colors" || slug === "image-data-url") {
        setError("");
        setBusy(false);
        return;
      }
      const rendered = await renderImage(file, {
        mime,
        quality,
        width: width === "" ? undefined : width,
        height: height === "" ? undefined : height,
        mode: "contain",
        rotate,
        flipH,
        flipV,
        crop: slug === "image-transform" && crop.width > 0 ? crop : null,
        background,
        allowFlatten,
      });
      setResult((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return rendered;
      });
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not process that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <FileDrop
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        label="Drop an image or choose a file"
        hint="JPEG, PNG, WebP, and GIF stills. Up to 25 MB. The image stays in this browser."
        files={file ? [file] : []}
        onFiles={(nextFiles) => {
          setFile(nextFiles[0] ?? null);
          setResult(null);
          setMeta("");
        }}
      />
      {slug === "image-compressor" || slug === "image-converter" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Format" htmlFor="format"><Select id="format" value={mime} onChange={(event) => setMime(event.target.value as Mime)}><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></Select></Field>
          <Field label={`Quality ${Math.round(quality * 100)}%`} htmlFor="quality" hint="Used by JPEG and WebP. PNG stays lossless in most browsers.">
            <RangeControl id="quality" min={0.4} max={1} step={0.05} value={quality} onValueChange={setQuality} />
          </Field>
        </div>
      ) : null}
      {slug === "image-resizer" || slug === "image-transform" ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">{IMAGE_PRESETS.map((preset) => <Button key={preset.id} size="sm" onClick={() => { setWidth(preset.width); setHeight(preset.height); }}>{preset.label}</Button>)}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Width" htmlFor="width"><Input id="width" type="number" value={width} onChange={(event) => setWidth(event.target.value ? Number(event.target.value) : "")} /></Field>
            <Field label="Height" htmlFor="height"><Input id="height" type="number" value={height} onChange={(event) => setHeight(event.target.value ? Number(event.target.value) : "")} /></Field>
          </div>
        </div>
      ) : null}
      {slug === "image-transform" ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setRotate(90)}>Rotate 90</Button>
            <Button size="sm" onClick={() => setRotate(180)}>180</Button>
            <Button size="sm" onClick={() => setRotate(270)}>270</Button>
            <Button size="sm" onClick={() => setFlipH((value) => !value)}>Flip horizontal</Button>
            <Button size="sm" onClick={() => setFlipV((value) => !value)}>Flip vertical</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {(["x", "y", "width", "height"] as const).map((key) => <Field key={key} label={`Crop ${key}`} htmlFor={`crop-${key}`}><Input id={`crop-${key}`} type="number" value={crop[key]} onChange={(event) => setCrop({ ...crop, [key]: Number(event.target.value) })} /></Field>)}
          </div>
        </div>
      ) : null}
      <Field label="Background if transparency is flattened" htmlFor="background"><Input id="background" value={background} onChange={(event) => setBackground(event.target.value)} /></Field>
      <Toggle id="flatten" label="Flatten transparency onto that background" checked={allowFlatten} onCheckedChange={setAllowFlatten} />
      <Button variant="primary" disabled={busy} onClick={() => void run()}>{busy ? "Working…" : "Run"}</Button>
      <ErrorNote message={error} />
      {result ? (
        <div className="grid gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Processed image" className="max-h-80 rounded-lg border object-contain" />
          <p className="text-sm">{formatBytes(result.sourceBytes)} → {formatBytes(result.blob.size)} ({result.sourceWidth}×{result.sourceHeight} to {result.width}×{result.height}). Saved {formatBytes(Math.max(0, result.sourceBytes - result.blob.size))}.</p>
          <Button onClick={() => downloadBlob(result.blob, `everyday-tools.${mime.split("/")[1]}`)}>Download</Button>
        </div>
      ) : null}
      {colors.length ? <div className="flex gap-2">{colors.map((color) => <span key={color} className="grid gap-1 text-xs"><span className="size-10 rounded-md border" style={{ background: color }} />{color}</span>)}</div> : null}
      {meta && slug !== "image-data-url" ? <OutputBlock value={meta} /> : null}
      {meta && slug === "image-data-url" ? <OutputBlock value={meta} /> : null}
      {slug === "image-metadata" ? <p className="text-sm text-muted-foreground">Download a compressed or converted copy to strip metadata. Re-encoding creates a new file; it does not edit the original, and it cannot promise removal of metadata in formats the browser will not redraw.</p> : null}
    </div>
  );
}
