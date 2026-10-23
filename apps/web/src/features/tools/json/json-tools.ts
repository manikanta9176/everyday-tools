import { assertTextLimit } from "@/lib/limits";

export type JsonIssue = { message: string; line: number; column: number; position: number };

export function locateJsonError(input: string, error: SyntaxError): JsonIssue {
  const match = error.message.match(/position\s+(\d+)/i);
  const position = match ? Number(match[1]) : scanJsonError(input);
  const before = input.slice(0, position);
  const line = before.split("\n").length;
  const column = position - before.lastIndexOf("\n");
  return { message: error.message, line, column, position };
}

function scanJsonError(input: string) {
  let index = skip(0);
  try {
    index = parseValue(index);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("at:")) return Number(error.message.slice(3));
  }
  return index;

  function skip(start: number) {
    let cursor = start;
    while (/\s/.test(input[cursor] ?? "")) cursor += 1;
    return cursor;
  }
  function fail(cursor: number): never {
    throw new Error(`at:${cursor}`);
  }
  function parseValue(start: number): number {
    const cursor = skip(start);
    const char = input[cursor];
    if (char === "{") return parseObject(cursor);
    if (char === "[") return parseArray(cursor);
    if (char === '"') return parseString(cursor);
    if (char === "-" || (char !== undefined && char >= "0" && char <= "9")) return parseNumber(cursor);
    if (input.startsWith("true", cursor)) return cursor + 4;
    if (input.startsWith("false", cursor)) return cursor + 5;
    if (input.startsWith("null", cursor)) return cursor + 4;
    return fail(cursor);
  }
  function parseObject(start: number) {
    let cursor = skip(start + 1);
    if (input[cursor] === "}") return cursor + 1;
    for (;;) {
      if (input[cursor] !== '"') return fail(cursor);
      cursor = skip(parseString(cursor));
      if (input[cursor] !== ":") return fail(cursor);
      cursor = parseValue(cursor + 1);
      cursor = skip(cursor);
      if (input[cursor] === ",") {
        cursor = skip(cursor + 1);
        continue;
      }
      if (input[cursor] === "}") return cursor + 1;
      return fail(cursor);
    }
  }
  function parseArray(start: number) {
    let cursor = skip(start + 1);
    if (input[cursor] === "]") return cursor + 1;
    for (;;) {
      cursor = skip(parseValue(cursor));
      if (input[cursor] === ",") {
        cursor = skip(cursor + 1);
        continue;
      }
      if (input[cursor] === "]") return cursor + 1;
      return fail(cursor);
    }
  }
  function parseString(start: number) {
    let cursor = start + 1;
    while (cursor < input.length) {
      if (input[cursor] === "\\") {
        cursor += 2;
        continue;
      }
      if (input[cursor] === '"') return cursor + 1;
      cursor += 1;
    }
    return fail(cursor);
  }
  function parseNumber(start: number) {
    const match = input.slice(start).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) return fail(start);
    return start + match[0].length;
  }
}

export function parseJson(input: string): unknown {
  assertTextLimit(input, "JSON");
  if (!input.trim()) throw new Error("Paste JSON to format it.");
  try {
    return JSON.parse(input);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const issue = locateJsonError(input, error);
      throw new Error(`${issue.message} (line ${issue.line}, column ${issue.column})`);
    }
    throw error;
  }
}

export function formatJson(input: string, indent: number | "tab" = 2, sortKeys = false) {
  const value = sortKeys ? sortValue(parseJson(input)) : parseJson(input);
  const space = indent === "tab" ? "\t" : indent;
  return JSON.stringify(value, null, space);
}

export function minifyJson(input: string) {
  return JSON.stringify(parseJson(input));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, sortValue(item)]),
    );
  }
  return value;
}

export type JsonTree = {
  id: string;
  key: string;
  type: string;
  preview: string;
  children?: JsonTree[];
};

export function buildJsonTree(value: unknown, key = "root", id = "root", depth = 0): JsonTree {
  if (depth > 30) return { id, key, type: "limit", preview: "Nesting limit reached" };
  if (Array.isArray(value)) {
    return {
      id,
      key,
      type: "array",
      preview: `Array(${value.length})`,
      children: value.slice(0, 200).map((item, index) => buildJsonTree(item, String(index), `${id}.${index}`, depth + 1)),
    };
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return {
      id,
      key,
      type: "object",
      preview: `Object(${entries.length})`,
      children: entries
        .slice(0, 200)
        .map(([childKey, child]) => buildJsonTree(child, childKey, `${id}.${childKey}`, depth + 1)),
    };
  }
  return { id, key, type: value === null ? "null" : typeof value, preview: JSON.stringify(value) };
}

export function findDuplicateKeys(input: string) {
  parseJson(input);
  const duplicates: { path: string; key: string }[] = [];
  const path: string[] = [];
  let i = 0;
  const skip = () => {
    while (/\s/.test(input[i] ?? "")) i += 1;
  };
  const parseValue = (): void => {
    skip();
    const char = input[i];
    if (char === "{") {
      i += 1;
      const seen = new Set<string>();
      skip();
      if (input[i] === "}") {
        i += 1;
        return;
      }
      for (;;) {
        skip();
        const key = JSON.parse(readString()) as string;
        if (seen.has(key)) duplicates.push({ path: `/${path.join("/")}`, key });
        seen.add(key);
        skip();
        i += 1;
        path.push(key);
        parseValue();
        path.pop();
        skip();
        if (input[i] === ",") {
          i += 1;
          continue;
        }
        if (input[i] === "}") {
          i += 1;
          break;
        }
        break;
      }
      return;
    }
    if (char === "[") {
      i += 1;
      let index = 0;
      skip();
      if (input[i] === "]") {
        i += 1;
        return;
      }
      for (;;) {
        path.push(String(index));
        parseValue();
        path.pop();
        index += 1;
        skip();
        if (input[i] === ",") {
          i += 1;
          continue;
        }
        if (input[i] === "]") {
          i += 1;
          break;
        }
        break;
      }
      return;
    }
    if (char === '"') {
      readString();
      return;
    }
    while (i < input.length && !",}]".includes(input[i] ?? "")) i += 1;
  };
  const readString = () => {
    const start = i;
    i += 1;
    while (i < input.length) {
      if (input[i] === "\\") {
        i += 2;
        continue;
      }
      if (input[i] === '"') {
        i += 1;
        return input.slice(start, i);
      }
      i += 1;
    }
    return input.slice(start);
  };
  parseValue();
  return duplicates;
}

export function queryJsonPath(value: unknown, path: string) {
  if (!path.startsWith("$")) throw new Error("JSONPath expressions in this tool start with $.");
  let nodes = [{ path: "$", value }];
  const tokens = tokenizePath(path.slice(1));
  for (const token of tokens) {
    const next: { path: string; value: unknown }[] = [];
    for (const node of nodes) {
      if (token.kind === "recurse") {
        const stack = [node];
        while (stack.length) {
          const current = stack.pop()!;
          if (current.value && typeof current.value === "object") {
            const entries = Object.entries(current.value as Record<string, unknown>);
            for (const [key, child] of entries) {
              const childPath = `${current.path}.${key}`;
              if (key === token.key) next.push({ path: childPath, value: child });
              stack.push({ path: childPath, value: child });
            }
          }
        }
      } else if (token.kind === "key" && node.value && typeof node.value === "object" && !Array.isArray(node.value)) {
        if (token.key in (node.value as Record<string, unknown>)) {
          next.push({ path: `${node.path}.${token.key}`, value: (node.value as Record<string, unknown>)[token.key] });
        }
      } else if (token.kind === "index" && Array.isArray(node.value)) {
        const item = node.value[token.index];
        if (item !== undefined) next.push({ path: `${node.path}[${token.index}]`, value: item });
      } else if (token.kind === "wildcard") {
        const entries = Array.isArray(node.value)
          ? node.value.map((item, index) => [String(index), item] as const)
          : Object.entries((node.value ?? {}) as Record<string, unknown>);
        for (const [key, child] of entries) next.push({ path: `${node.path}.${key}`, value: child });
      }
    }
    nodes = next;
  }
  return nodes;
}

type PathToken =
  | { kind: "key"; key: string }
  | { kind: "index"; index: number }
  | { kind: "wildcard" }
  | { kind: "recurse"; key: string };

function tokenizePath(source: string): PathToken[] {
  const tokens: PathToken[] = [];
  let i = 0;
  while (i < source.length) {
    if (source.startsWith("..", i)) {
      i += 2;
      const key = readKey();
      tokens.push({ kind: "recurse", key });
      continue;
    }
    if (source[i] === ".") {
      i += 1;
      tokens.push({ kind: "key", key: readKey() });
      continue;
    }
    if (source[i] === "[") {
      i += 1;
      if (source[i] === "*") {
        tokens.push({ kind: "wildcard" });
        i += 2;
        continue;
      }
      if (source[i] === "'" || source[i] === '"') {
        const quote = source[i];
        i += 1;
        const start = i;
        while (source[i] !== quote) i += 1;
        tokens.push({ kind: "key", key: source.slice(start, i) });
        i += 2;
        continue;
      }
      const start = i;
      while (source[i] !== "]") i += 1;
      tokens.push({ kind: "index", index: Number(source.slice(start, i)) });
      i += 1;
      continue;
    }
    throw new Error("This JSONPath subset supports $.a, ['a'], [0], [*], and ..a.");
  }
  return tokens;

  function readKey() {
    const start = i;
    while (i < source.length && !".[".includes(source[i] ?? "")) i += 1;
    return source.slice(start, i);
  }
}

export function jsonToTypeScript(input: unknown, name = "Root") {
  const value = typeof input === "string" ? parseJson(input) : input;
  const lines: string[] = [];
  const seen = new Map<string, string>();
  const emit = (item: unknown, typeName: string): string => {
    if (Array.isArray(item)) {
      if (item.length === 0) return "unknown[]";
      return `${emit(item[0], `${typeName}Item`)}[]`;
    }
    if (item === null) return "null";
    if (typeof item === "string") return "string";
    if (typeof item === "number") return "number";
    if (typeof item === "boolean") return "boolean";
    if (typeof item === "object") {
      if (seen.has(typeName)) return typeName;
      const entries = Object.entries(item as Record<string, unknown>);
      seen.set(typeName, typeName);
      const body = entries
        .map(([key, child]) => {
          const safe = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
          const optional = child === null ? "?" : "";
          return `  ${safe}${optional}: ${emit(child, `${typeName}${pascal(key)}`)};`;
        })
        .join("\n");
      lines.push(`export interface ${typeName} {\n${body}\n}`);
      return typeName;
    }
    return "unknown";
  };
  const root = emit(value, sanitizeName(name));
  if (!lines.length) return `export type ${sanitizeName(name)} = ${root};\n`;
  return `${lines.reverse().join("\n\n")}\n`;
}

function pascal(value: string) {
  return value
    .replace(/[^A-Za-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function sanitizeName(value: string) {
  const cleaned = pascal(value);
  return cleaned || "Root";
}
