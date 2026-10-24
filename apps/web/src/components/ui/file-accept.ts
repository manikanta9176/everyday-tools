const extensionTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

export function fileMatchesAccept(file: { name: string; type: string }, accept: string) {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter((rule) => rule && rule !== "*/*");
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const extension = name.slice(name.lastIndexOf(".") + 1);
  const type = (file.type || extensionTypes[extension] || "").toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule || name.endsWith(`.${rule.split("/")[1] ?? ""}`);
  });
}
