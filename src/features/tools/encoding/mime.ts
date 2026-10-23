const MIME_TYPES: Record<string, string> = {
  avif: "image/avif",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  css: "text/css",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  gif: "image/gif",
  gz: "application/gzip",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  json: "application/json",
  md: "text/markdown",
  mjs: "text/javascript",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  otf: "font/otf",
  pdf: "application/pdf",
  png: "image/png",
  svg: "image/svg+xml",
  tar: "application/x-tar",
  ttf: "font/ttf",
  txt: "text/plain",
  wasm: "application/wasm",
  webm: "video/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xml: "application/xml",
  yaml: "application/yaml",
  yml: "application/yaml",
  zip: "application/zip",
};

export function lookupMime(query: string) {
  const needle = query.trim().toLowerCase().replace(/^\./, "");
  if (!needle) return [];
  const byExtension = MIME_TYPES[needle];
  if (byExtension) return [{ extension: needle, type: byExtension }];
  return Object.entries(MIME_TYPES)
    .filter(([extension, type]) => extension.includes(needle) || type.includes(needle))
    .map(([extension, type]) => ({ extension, type }));
}

export function mimeForExtension(extension: string) {
  return MIME_TYPES[extension.toLowerCase().replace(/^\./, "")] ?? "application/octet-stream";
}
