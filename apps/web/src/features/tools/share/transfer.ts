export const CHUNK_SIZE = 48 * 1024;

export type FileMeta = {
  id: string;
  name: string;
  size: number;
  mime: string;
};

export function describeFiles(files: { name: string; size: number; type: string }[]): FileMeta[] {
  return files.map((file, index) => ({
    id: String(index + 1),
    name: file.name,
    size: file.size,
    mime: file.type || "application/octet-stream",
  }));
}

export function fileMessage(meta: FileMeta) {
  return JSON.stringify({ type: "file", ...meta });
}

export function doneMessage() {
  return JSON.stringify({ type: "done" });
}

export function createAssembler() {
  let meta: FileMeta | null = null;
  let received = 0;
  const parts: Uint8Array[] = [];

  return {
    control(text: string) {
      const message = JSON.parse(text) as { type?: string; id?: string; name?: string; size?: number; mime?: string };
      if (message.type === "done") return { type: "done" as const };
      if (message.type !== "file" || !message.id || !message.name || typeof message.size !== "number") {
        throw new Error("The transfer message was not recognized.");
      }
      meta = {
        id: message.id,
        name: message.name,
        size: message.size,
        mime: message.mime || "application/octet-stream",
      };
      received = 0;
      parts.length = 0;
      return { type: "start" as const, meta };
    },
    chunk(bytes: Uint8Array) {
      if (!meta) throw new Error("A file was not announced.");
      parts.push(bytes);
      received += bytes.byteLength;
      if (received < meta.size) return { type: "progress" as const, received, size: meta.size, name: meta.name };
      if (received > meta.size) throw new Error("Received more data than the file size.");
      const merged = new Uint8Array(meta.size);
      let offset = 0;
      for (const part of parts) {
        merged.set(part, offset);
        offset += part.byteLength;
      }
      const finished = meta;
      meta = null;
      return { type: "file" as const, meta: finished, bytes: merged };
    },
  };
}

export function* chunks(bytes: Uint8Array, size = CHUNK_SIZE) {
  for (let offset = 0; offset < bytes.byteLength; offset += size) {
    yield bytes.subarray(offset, Math.min(offset + size, bytes.byteLength));
  }
}
