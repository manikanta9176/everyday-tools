import { describe, expect, it } from "vitest";
import {
  compareText,
  loremIpsum,
  markdownTable,
  renderMarkdown,
  slugify,
  textStats,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
  toTitleCase,
  transformLines,
} from "./text-tools";

describe("text tools", () => {
  it("counts words without treating spaces as characters", () => {
    const stats = textStats("Hello  world\n\nNext");
    expect(stats.words).toBe(3);
    expect(stats.lines).toBe(3);
    expect(stats.paragraphs).toBe(2);
    expect(stats.charactersWithoutSpaces).toBe(14);
  });

  it("converts identifier cases and slugs", () => {
    expect(toTitleCase("hello WORLD")).toBe("Hello World");
    expect(toCamelCase("Hello world")).toBe("helloWorld");
    expect(toPascalCase("hello-world")).toBe("HelloWorld");
    expect(toSnakeCase("helloWorld")).toBe("hello_world");
    expect(toKebabCase("Hello World")).toBe("hello-world");
    expect(toConstantCase("hello world")).toBe("HELLO_WORLD");
    expect(slugify("Café au lait!")).toBe("cafe-au-lait");
  });

  it("sorts, dedupes, and compares lines", () => {
    expect(transformLines("b\na\na", "unique")).toBe("b\na");
    expect(transformLines("b\na", "sort-asc")).toBe("a\nb");
    const changes = compareText("a\nb", "a\nc", "lines").filter((part) => part.change !== "same");
    expect(changes.map((part) => part.change)).toEqual(["removed", "added"]);
    expect(changes.map((part) => part.value.trim())).toEqual(["b", "c"]);
  });

  it("escapes markdown HTML and builds a table", () => {
    expect(renderMarkdown("# Hi\n<script>")).toContain("&lt;script&gt;");
    expect(renderMarkdown("[Docs](https://example.com)")).toContain('href="https://example.com"');
    expect(markdownTable(["Name"], [["Ada"]])).toContain("| Name |");
    expect(loremIpsum(1)).toMatch(/^Lorem ipsum/);
  });
});
