"use client";

import { FileUp } from "lucide-react";
import { useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";

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
  const [over, setOver] = useState(false);
  const names = files.map((file) => file.name);

  function take(list: FileList | null) {
    onFiles([...(list ?? [])]);
  }

  function drop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setOver(false);
    take(event.dataTransfer.files);
  }

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      className={cn(
        "grid cursor-pointer justify-items-center gap-2 rounded-[24px] border border-dashed bg-card px-6 py-8 text-center transition-colors duration-200",
        over ? "border-signal bg-accent" : "border-border hover:border-foreground/30 hover:bg-muted/40",
      )}
    >
      <span className="grid size-10 place-items-center rounded-full bg-muted text-foreground">
        <FileUp className="size-4" />
      </span>
      <span className="font-medium">{label}</span>
      <span className="max-w-md text-sm leading-6 text-muted-foreground">{hint}</span>
      <span className="text-sm text-muted-foreground">
        {names.length ? names.join(", ") : "No file chosen"}
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => take(event.target.files)}
      />
    </label>
  );
}
