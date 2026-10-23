import { describe, expect, it } from "vitest";
import { searchTools } from "./search-tools";
import type { ToolDefinition } from "@/lib/tool-types";

const tools: ToolDefinition[] = [
  {
    id: "json-formatter",
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format and validate JSON.",
    category: "data",
    tags: ["json"],
    aliases: ["prettify json"],
    keywords: ["format json", "validate json"],
    priority: "P0",
    status: "ready",
    supportsLocalProcessing: true,
    related: [],
  },
  {
    id: "random-secret-generator",
    slug: "random-secret-generator",
    name: "Random Secret Generator",
    description: "Generate a secure random token.",
    category: "secrets",
    tags: ["token"],
    aliases: ["token generator"],
    keywords: ["generate secret", "openssl rand"],
    priority: "P0",
    status: "ready",
    supportsLocalProcessing: true,
    related: [],
  },
];

describe("searchTools", () => {
  it("matches names, aliases, and task phrases", () => {
    expect(searchTools(tools, "format json").map((tool) => tool.id)).toEqual(["json-formatter"]);
    expect(searchTools(tools, "generate secret").map((tool) => tool.id)).toEqual([
      "random-secret-generator",
    ]);
    expect(searchTools(tools, "prettify json")[0]?.id).toBe("json-formatter");
  });

  it("returns the catalog for an empty query and nothing for a miss", () => {
    expect(searchTools(tools, "  ")).toHaveLength(2);
    expect(searchTools(tools, "compress photo")).toHaveLength(0);
  });
});
