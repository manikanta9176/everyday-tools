import { diffLines, diffWords } from "diff";
import { assertTextLimit } from "@/lib/limits";

export function textStats(text: string, wordsPerMinute = 200) {
  assertTextLimit(text);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.length === 0 ? 0 : text.split(/\r?\n/).length;
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
  return {
    words,
    characters: [...text].length,
    charactersWithoutSpaces: [...text.replace(/\s/g, "")].length,
    lines,
    paragraphs,
    readingMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / wordsPerMinute)),
    wordsPerMinute,
  };
}

export function toTitleCase(text: string) {
  return text.replace(/\p{L}[\p{L}\p{N}'’]*/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function toSentenceCase(text: string) {
  const lower = text.toLowerCase();
  return lower.replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (part) => part.toUpperCase());
}

function wordsOf(text: string) {
  return text
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

export function toCamelCase(text: string) {
  const [first, ...rest] = wordsOf(text);
  if (!first) return "";
  return first + rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
}

export function toPascalCase(text: string) {
  return wordsOf(text).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
}

export function toSnakeCase(text: string) {
  return wordsOf(text).join("_");
}

export function toKebabCase(text: string) {
  return wordsOf(text).join("-");
}

export function toConstantCase(text: string) {
  return wordsOf(text).join("_").toUpperCase();
}

export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function transformLines(
  text: string,
  operation:
    | "trim"
    | "unique"
    | "sort-asc"
    | "sort-desc"
    | "reverse-lines"
    | "reverse-chars"
    | "number"
    | "denumber"
    | "dedupe-keep",
) {
  assertTextLimit(text);
  const lines = text.split(/\r?\n/);
  if (operation === "reverse-chars") return [...text].reverse().join("");
  if (operation === "trim") return lines.map((line) => line.trim()).join("\n").replace(/[ \t]+\n/g, "\n");
  if (operation === "unique" || operation === "dedupe-keep") {
    return [...new Set(lines)].join("\n");
  }
  if (operation === "sort-asc") return [...lines].sort((a, b) => a.localeCompare(b)).join("\n");
  if (operation === "sort-desc") return [...lines].sort((a, b) => b.localeCompare(a)).join("\n");
  if (operation === "reverse-lines") return [...lines].reverse().join("\n");
  return lines.map((line) => line.replace(/^\s*\d+[\.|\)]\s+/, "")).join("\n");
}

export function findAndReplace(text: string, search: string, replacement: string, regex: boolean) {
  assertTextLimit(text);
  if (!search) throw new Error("Enter the text to find.");
  if (!regex) return text.split(search).join(replacement);
  return text.replace(new RegExp(search, "g"), replacement);
}

export function withLineAffix(text: string, prefix: string, suffix: string) {
  assertTextLimit(text);
  return text.split(/\r?\n/).map((line) => `${prefix}${line}${suffix}`).join("\n");
}

export function convertLineEndings(text: string, ending: "lf" | "crlf") {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return ending === "crlf" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

export function convertIndent(text: string, to: "spaces" | "tabs", size = 2) {
  return text.split(/\r?\n/).map((line) => {
    const match = line.match(/^[ \t]+/);
    if (!match) return line;
    const width = [...match[0]].reduce((total, char) => total + (char === "\t" ? size : 1), 0);
    const indent = to === "tabs" ? "\t".repeat(Math.floor(width / size)) + " ".repeat(width % size) : " ".repeat(width);
    return indent + line.slice(match[0].length);
  }).join("\n");
}

const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" ");

export function loremIpsum(paragraphs: number, wordsPerParagraph = 40) {
  if (paragraphs < 1 || paragraphs > 20) throw new Error("Choose between 1 and 20 paragraphs.");
  return Array.from({ length: paragraphs }, (_, paragraph) =>
    Array.from({ length: wordsPerParagraph }, (_, index) => {
      const word = LOREM[(paragraph * 7 + index) % LOREM.length]!;
      return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    }).join(" ") + ".",
  ).join("\n\n");
}

export function markdownTable(headers: string[], rows: string[][]) {
  const head = headers.map((header) => header.replaceAll("|", "\\|"));
  const divider = head.map(() => "---");
  const body = rows.map((row) => head.map((_, index) => (row[index] ?? "").replaceAll("|", "\\|")));
  return [head, divider, ...body].map((row) => `| ${row.join(" | ")} |`).join("\n");
}

export function compareText(left: string, right: string, mode: "lines" | "words") {
  assertTextLimit(left, "Left text");
  assertTextLimit(right, "Right text");
  const parts = mode === "words" ? diffWords(left, right) : diffLines(left, right);
  return parts.map((part) => ({
    value: part.value,
    change: part.added ? "added" : part.removed ? "removed" : "same",
  }));
}

export function renderMarkdown(markdown: string) {
  assertTextLimit(markdown, "Markdown");
  const escaped = markdown
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const lines = escaped.split("\n");
  const html: string[] = [];
  let list: "ul" | "ol" | null = null;
  const closeList = () => {
    if (list) {
      html.push(list === "ul" ? "</ul>" : "</ol>");
      list = null;
    }
  };
  for (const line of lines) {
    const unordered = line.match(/^\s*[-*]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (unordered || ordered) {
      const next = unordered ? "ul" : "ol";
      if (list !== next) {
        closeList();
        html.push(next === "ul" ? "<ul>" : "<ol>");
        list = next;
      }
      html.push(`<li>${inline(unordered?.[1] ?? ordered?.[1] ?? "")}</li>`);
      continue;
    }
    closeList();
    if (!line.trim()) continue;
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1]!.length;
      html.push(`<h${level}>${inline(heading[2]!)}</h${level}>`);
      continue;
    }
    html.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return html.join("\n");
}

function inline(text: string) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
}
