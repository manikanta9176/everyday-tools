import { assertTextLimit } from "@/lib/limits";
import { bytesToBase64, bytesToBase64Url, bytesToHex } from "@/features/tools/generators/random";

function bytesFromBinary(binary: string) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeUtf8Base64(text: string) {
  assertTextLimit(text);
  return bytesToBase64(new TextEncoder().encode(text));
}

export function decodeUtf8Base64(value: string) {
  assertTextLimit(value);
  const cleaned = value.trim().replace(/\s+/g, "");
  if (!cleaned) return "";
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) || cleaned.length % 4 !== 0) {
    throw new Error("That is not valid Base64. It should use A–Z, a–z, 0–9, +, /, and = padding.");
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytesFromBinary(atob(cleaned)));
}

export function encodeUtf8Base64Url(text: string) {
  assertTextLimit(text);
  return bytesToBase64Url(new TextEncoder().encode(text));
}

export function decodeUtf8Base64Url(value: string) {
  assertTextLimit(value);
  const cleaned = value.trim().replace(/\s+/g, "").replaceAll("-", "+").replaceAll("_", "/");
  if (!cleaned) return "";
  const padded = cleaned + "=".repeat((4 - (cleaned.length % 4)) % 4);
  return decodeUtf8Base64(padded);
}

export function textToHex(text: string) {
  assertTextLimit(text);
  return bytesToHex(new TextEncoder().encode(text));
}

export function hexToText(hex: string) {
  assertTextLimit(hex);
  const cleaned = hex.trim().replace(/^0x/i, "").replace(/\s+/g, "");
  if (!cleaned) return "";
  if (cleaned.length % 2 !== 0 || /[^0-9a-f]/i.test(cleaned)) {
    throw new Error("Hex needs pairs of digits from 0–9 and a–f.");
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function encodeUrlComponent(text: string) {
  assertTextLimit(text);
  return encodeURIComponent(text);
}

export function decodeUrlComponent(text: string) {
  assertTextLimit(text);
  try {
    return decodeURIComponent(text);
  } catch {
    throw new Error("That is not a valid percent-encoded string.");
  }
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
};

export function encodeHtml(text: string) {
  assertTextLimit(text);
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function decodeHtml(text: string) {
  assertTextLimit(text);
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, body: string) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      const code = Number.parseInt(body.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
    }
    if (body.startsWith("#")) {
      const code = Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? entity;
  });
}

export function escapeJsonString(text: string) {
  assertTextLimit(text);
  return JSON.stringify(text).slice(1, -1);
}

export function unescapeJsonString(text: string) {
  assertTextLimit(text);
  try {
    return JSON.parse(`"${text}"`) as string;
  } catch {
    throw new Error("That is not a valid JSON string escape sequence.");
  }
}

export function textToBinary(text: string) {
  assertTextLimit(text, "Text");
  return [...new TextEncoder().encode(text)]
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join(" ");
}

export function binaryToText(value: string) {
  assertTextLimit(value);
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.some((part) => !/^[01]{1,8}$/.test(part))) {
    throw new Error("Use space-separated binary bytes, up to 8 bits each.");
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(
    Uint8Array.from(parts.map((part) => Number.parseInt(part, 2))),
  );
}

export function countUtf8(text: string) {
  assertTextLimit(text);
  return {
    characters: [...text].length,
    utf16CodeUnits: text.length,
    utf8Bytes: new TextEncoder().encode(text).length,
  };
}

export type UnicodeRow = {
  character: string;
  codePoint: string;
  decimal: number;
  utf8: string;
  escape: string;
};

export function inspectUnicode(text: string, limit = 400): UnicodeRow[] {
  assertTextLimit(text);
  return [...text].slice(0, limit).map((character) => {
    const decimal = character.codePointAt(0)!;
    const hex = decimal.toString(16).toUpperCase();
    return {
      character,
      codePoint: `U+${hex.padStart(4, "0")}`,
      decimal,
      utf8: bytesToHex(new TextEncoder().encode(character)),
      escape: decimal <= 0xffff ? `\\u${hex.padStart(4, "0")}` : `\\u{${hex}}`,
    };
  });
}

export function encodeDataUrl(bytes: Uint8Array, mime: string) {
  if (!/^[\w.+-]+\/[\w.+-]+$/.test(mime)) throw new Error("Enter a MIME type such as text/plain.");
  return `data:${mime};base64,${bytesToBase64(bytes)}`;
}

export function decodeDataUrl(value: string) {
  const match = value.trim().match(/^data:([^,]*?),([\s\S]*)$/);
  if (!match) throw new Error("A data URL starts with data: and includes a comma.");
  const meta = match[1] ?? "";
  const data = match[2] ?? "";
  const mime = meta.replace(/;base64$/i, "") || "text/plain";
  if (/;base64$/i.test(meta)) {
    return { mime, text: decodeUtf8Base64(data), base64: true };
  }
  return { mime, text: decodeURIComponent(data), base64: false };
}

export function parseQuery(input: string) {
  assertTextLimit(input);
  const trimmed = input.trim();
  if (!trimmed) return [];
  let query = trimmed;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    query = new URL(trimmed).search;
  }
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  return [...params.entries()].map(([key, value]) => ({ key, value }));
}

export function buildQuery(entries: { key: string; value: string }[], baseUrl?: string) {
  const params = new URLSearchParams();
  for (const entry of entries) {
    if (entry.key) params.append(entry.key, entry.value);
  }
  const query = params.toString();
  if (!baseUrl) return query ? `?${query}` : "";
  const url = new URL(baseUrl);
  url.search = query;
  return url.toString();
}
