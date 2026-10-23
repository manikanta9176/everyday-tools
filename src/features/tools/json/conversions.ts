import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { dump, load } from "js-yaml";
import Papa from "papaparse";
import { parse, stringify } from "smol-toml";
import { assertTextLimit } from "@/lib/limits";
import { parseJson } from "./json-tools";

export function csvToJson(csv: string, headers = true) {
  assertTextLimit(csv, "CSV");
  const result = Papa.parse(csv, { header: headers, skipEmptyLines: "greedy" });
  if (result.errors.length) {
    const error = result.errors[0]!;
    throw new Error(`${error.message}${error.row !== undefined ? ` (row ${error.row + 1})` : ""}`);
  }
  return JSON.stringify(result.data, null, 2);
}

export function jsonToCsv(json: string) {
  const value = parseJson(json);
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    throw new Error("JSON to CSV expects an array of objects.");
  }
  return Papa.unparse(value as Record<string, unknown>[]);
}

export function yamlToJson(yaml: string) {
  assertTextLimit(yaml, "YAML");
  return JSON.stringify(load(yaml), null, 2);
}

export function jsonToYaml(json: string) {
  return dump(parseJson(json), { noRefs: true });
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  allowBooleanAttributes: true,
});

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  format: true,
  suppressEmptyNode: true,
});

export const XML_RULES = [
  "Attributes are prefixed with @_.",
  "Text inside an element that also has attributes or children uses #text.",
  "Repeated elements become arrays. A single element stays an object, so the shape can change.",
  "XML namespaces, entities, and mixed content can be ambiguous.",
];

export function xmlToJson(xml: string) {
  assertTextLimit(xml, "XML");
  return JSON.stringify(xmlParser.parse(xml), null, 2);
}

export function formatXml(xml: string) {
  return xmlBuilder.build(xmlParser.parse(xml));
}

export function minifyXml(xml: string) {
  const compact = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    format: false,
  });
  return compact.build(xmlParser.parse(xml));
}

export function tomlToJson(toml: string) {
  assertTextLimit(toml, "TOML");
  return JSON.stringify(parse(toml), null, 2);
}

export function jsonToToml(json: string) {
  const value = parseJson(json);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("TOML output needs a JSON object at the top level.");
  }
  return stringify(value as Record<string, unknown>);
}

const SECRET_KEY = /secret|token|password|passwd|private|credential|api[_-]?key/i;

export type EnvEntry = { key: string; value: string; sensitive: boolean };

export function parseEnv(text: string): EnvEntry[] {
  assertTextLimit(text, "Env file");
  const entries: EnvEntry[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const body = trimmed.startsWith("export ") ? trimmed.slice(7) : trimmed;
    const separator = body.indexOf("=");
    if (separator <= 0) continue;
    const key = body.slice(0, separator).trim();
    let value = body.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    entries.push({ key, value, sensitive: SECRET_KEY.test(key) || value.length >= 20 });
  }
  return entries;
}

export function diffEnv(left: string, right: string, reveal = false) {
  const leftMap = new Map(parseEnv(left).map((entry) => [entry.key, entry]));
  const rightMap = new Map(parseEnv(right).map((entry) => [entry.key, entry]));
  const keys = [...new Set([...leftMap.keys(), ...rightMap.keys()])].sort();
  return keys
    .map((key) => {
      const a = leftMap.get(key);
      const b = rightMap.get(key);
      const sensitive = Boolean(a?.sensitive || b?.sensitive);
      const mask = (value?: string) => (reveal || !sensitive ? (value ?? "") : "••••••");
      if (a && !b) return { key, change: "removed" as const, left: mask(a.value), right: "", sensitive };
      if (!a && b) return { key, change: "added" as const, left: "", right: mask(b.value), sensitive };
      if (a && b && a.value !== b.value) {
        return { key, change: "changed" as const, left: mask(a.value), right: mask(b.value), sensitive };
      }
      return null;
    })
    .filter((row) => row !== null);
}
