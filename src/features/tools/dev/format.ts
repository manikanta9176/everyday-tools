import { format as formatSql } from "sql-formatter";
import { assertTextLimit } from "@/lib/limits";

export async function formatCode(language: "javascript" | "typescript" | "html" | "css" | "markdown" | "json", code: string) {
  assertTextLimit(code, "Code");
  const prettier = await import("prettier/standalone");
  const estree = await import("prettier/plugins/estree");
  const parsers = {
    javascript: "babel",
    typescript: "typescript",
    html: "html",
    css: "css",
    markdown: "markdown",
    json: "json",
  } as const;
  const plugins: unknown[] = [estree];
  if (language === "javascript" || language === "json") plugins.push(await import("prettier/plugins/babel"));
  if (language === "typescript") plugins.push(await import("prettier/plugins/typescript"));
  if (language === "html") plugins.push(await import("prettier/plugins/html"));
  if (language === "css") plugins.push(await import("prettier/plugins/postcss"));
  if (language === "markdown") plugins.push(await import("prettier/plugins/markdown"));
  return prettier.format(code, {
    parser: parsers[language],
    plugins: plugins as Parameters<typeof prettier.format>[1] extends { plugins?: infer P } ? P : never,
    printWidth: 80,
  });
}

export function formatSqlCode(sql: string) {
  assertTextLimit(sql, "SQL");
  return formatSql(sql, { language: "sql", tabWidth: 2, keywordCase: "upper" });
}
