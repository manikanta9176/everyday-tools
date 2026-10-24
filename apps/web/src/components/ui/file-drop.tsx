"use client";

import { FileText, FileUp, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { fileMatchesAccept } from "@/components/ui/file-accept";
import { ErrorNote } from "@/components/ui/feedback";
import { cn, formatBytes } from "@/lib/utils";

export function FileDrop({
  accept,
  multiple = false,
  label,
  hint,
  files,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  label: string;
  hint: string;
  files: File[];
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState("");

  function take(list: FileList | null) {
    const incoming = [...(list ?? [])];
    if (inputRef.current) inputRef.current.value = "";
    const allowed = incoming.filter((file) => fileMatchesAccept(file, accept));
    const blocked = incoming.filter((file) => !fileMatchesAccept(file, accept));
    setRejected(blocked.length ? `${blocked.map((file) => file.name).join(", ")} is not an allowed file type.` : "");
    if (!allowed.length) return;
    onFiles(multiple ? [...files, ...allowed] : [allowed[0]!]);
  }

  function drop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setOver(false);
    take(event.dataTransfer.files);
  }

  const picker = (
    <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={(event) => take(event.target.files)} />
  );

  const showPicker = multiple || files.length === 0;

  return (
    <div className="grid gap-3">
      <ul className={cn("grid gap-3", files.length ? "grid-cols-[repeat(auto-fill,minmax(7rem,7rem))]" : "grid-cols-1")}>
        {files.map((file, index) => (
          <li key={`${file.name}-${file.size}-${file.lastModified}`}>
            <SelectedFile file={file} onRemove={() => onFiles(files.filter((_, item) => item !== index))} />
          </li>
        ))}
        {showPicker ? (
          <li>
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={drop}
              className={cn(
                "grid cursor-pointer place-items-center gap-2 rounded-[24px] border border-dashed bg-card text-center transition-colors duration-200",
                files.length ? "aspect-square" : "min-h-44 px-6 py-8",
                over ? "border-signal bg-accent" : "border-border hover:border-foreground/30 hover:bg-muted/40",
              )}
            >
              <span className="grid size-10 place-items-center rounded-full bg-muted text-foreground">
                <FileUp className="size-4" />
              </span>
              <span className="px-3 text-sm font-medium">{files.length ? "Add file" : label}</span>
              {files.length === 0 ? <span className="max-w-md px-4 text-sm leading-6 text-muted-foreground">{hint}</span> : null}
              {picker}
            </label>
          </li>
        ) : (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="grid aspect-square w-full place-items-center gap-2 rounded-[24px] border border-dashed border-border bg-card text-sm font-medium transition-colors duration-200 hover:bg-muted/40"
            >
              <FileUp className="size-4" />
              Replace
            </button>
            {picker}
          </li>
        )}
      </ul>
      {files.length ? <p className="text-xs text-muted-foreground">On this device. Not uploaded.</p> : null}
      <ErrorNote message={rejected} />
    </div>
  );
}

function SelectedFile({ file, onRemove }: { file: File; onRemove: () => void }) {
  const preview = useMemo(() => URL.createObjectURL(previewBlob(file)), [file]);
  const [failed, setFailed] = useState(false);
  useEffect(() => () => URL.revokeObjectURL(preview), [preview]);
  const image = isImage(file);
  const video = isVideo(file);

  return (
    <figure className="grid gap-2">
      <div className="group relative aspect-square overflow-hidden rounded-[22px] border border-border bg-[#f4f1ea]">
        {image && !failed ? (
          // Local object URL preview. Next image optimization does not apply.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" onError={() => setFailed(true)} className="size-full object-contain p-2.5" />
        ) : null}
        {video && !failed ? (
          <video src={`${preview}#t=0.1`} onError={() => setFailed(true)} className="size-full bg-black object-contain" muted playsInline preload="metadata" />
        ) : null}
        {(!image && !video) || failed ? (
          <span className="flex size-full flex-col items-center justify-center gap-2 text-[#6e685f]">
            <FileText className="size-8" />
            <span className="text-xs font-medium uppercase">{extension(file.name)}</span>
          </span>
        ) : null}
        <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`} className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-[#141311]/80 text-[#f7f4ee] shadow-[var(--shadow)]">
          <X className="size-3.5" />
        </button>
      </div>
      <figcaption className="px-1 text-center">
        <p className="truncate text-xs font-medium">{file.name}</p>
        <p className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</p>
      </figcaption>
    </figure>
  );
}

function isImage(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
}

function isVideo(file: File) {
  return file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
}

function extension(name: string) {
  const index = name.lastIndexOf(".");
  return index > 0 ? name.slice(index + 1, index + 5) : "file";
}

function previewBlob(file: File) {
  if (file.type) return file;
  if (/\.svg$/i.test(file.name)) return new Blob([file], { type: "image/svg+xml" });
  if (/\.(png|jpe?g|gif|webp)$/i.test(file.name)) return new Blob([file], { type: "image/png" });
  if (isVideo(file)) return new Blob([file], { type: "video/mp4" });
  return file;
}
