export const categories = [
  { id: "secrets", name: "Secrets", description: "Tokens, passwords, and identifiers" },
  { id: "encoding", name: "Encoding", description: "Base64, hex, URL, and Unicode" },
  { id: "data", name: "Data", description: "JSON, CSV, YAML, XML, and env files" },
  { id: "color", name: "Color", description: "Conversion, contrast, and palettes" },
  { id: "image", name: "Image", description: "Compress, resize, and inspect" },
  { id: "text", name: "Text", description: "Counts, case, and comparison" },
  { id: "code", name: "Code", description: "Formatters, regex, and snippets" },
  { id: "time", name: "Time", description: "Timestamps, dates, and cron" },
  { id: "math", name: "Math", description: "Units, percentages, and bases" },
  { id: "web", name: "Web", description: "URLs, HTTP, and tokens" },
  { id: "documents", name: "Documents", description: "PDFs that stay on your device" },
  { id: "generators", name: "Generators", description: "QR codes, templates, and samples" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export function getCategory(id: CategoryId) {
  return categories.find((category) => category.id === id)!;
}
