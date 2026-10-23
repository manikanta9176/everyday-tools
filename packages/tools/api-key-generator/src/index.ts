import { z } from "zod";
import { generateSecret, type ByteSource } from "@tools/random-secret-generator";

const PREFIX = z
  .string()
  .max(32)
  .regex(/^[A-Za-z0-9_-]*$/, "Prefixes can use letters, numbers, hyphens, and underscores.");

export function generateApiKey(options: {
  prefix: string;
  bytes: number;
  encoding: "base64url" | "hex" | "alphanumeric";
  count?: number;
  source?: ByteSource;
}) {
  const prefix = PREFIX.parse(options.prefix);
  const generated = generateSecret({
    bytes: options.bytes,
    format: options.encoding,
    count: options.count,
    source: options.source,
  });
  return { values: generated.values.map((value) => (prefix ? `${prefix}_${value}` : value)) };
}
