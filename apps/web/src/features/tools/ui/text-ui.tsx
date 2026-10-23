"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, TextArea } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { compareText, findAndReplace, loremIpsum, markdownTable, renderMarkdown, slugify, textStats, toCamelCase, toConstantCase, toKebabCase, toPascalCase, toSentenceCase, toSnakeCase, toTitleCase, transformLines, withLineAffix } from "@/features/tools/text/text-tools";
import { TextWorkspace } from "./text-workspace";
import { useToolHotkeys } from "./use-hotkeys";

export default function TextTools({ slug }: { slug: string }) {
  if (slug === "text-counter") return <TextWorkspace action="Count" placeholder="Paste text" run={(input) => { const stats = textStats(input); return `${stats.words} words\n${stats.characters} characters\n${stats.charactersWithoutSpaces} characters without spaces\n${stats.lines} lines\n${stats.paragraphs} paragraphs\nAbout ${stats.readingMinutes} min at ${stats.wordsPerMinute} wpm`; }} />;
  if (slug === "case-converter") return <CaseTool />;
  if (slug === "line-tools") return <LineTool />;
  if (slug === "text-diff") return <DiffTool />;
  if (slug === "find-replace") return <ReplaceTool />;
  if (slug === "slug-generator") return <TextWorkspace action="Create slug" placeholder="A title" run={slugify} />;
  if (slug === "lorem-ipsum") return <LoremTool />;
  if (slug === "markdown-preview") return <MarkdownTool />;
  return <TableTool />;
}

function CaseTool() {
  const [mode, setMode] = useState("title");
  const fns: Record<string, (value: string) => string> = { title: toTitleCase, sentence: toSentenceCase, camel: toCamelCase, pascal: toPascalCase, snake: toSnakeCase, kebab: toKebabCase, constant: toConstantCase, upper: (value) => value.toUpperCase(), lower: (value) => value.toLowerCase() };
  return <div className="grid gap-3"><Field label="Case" htmlFor="case"><Select id="case" value={mode} onChange={(event) => setMode(event.target.value)}>{Object.keys(fns).map((name) => <option key={name}>{name}</option>)}</Select></Field><TextWorkspace key={mode} action="Convert" placeholder="hello world" run={(input) => fns[mode]!(input)} /></div>;
}

function LineTool() {
  const [mode, setMode] = useState<"sort-asc" | "sort-desc" | "unique" | "reverse-lines" | "reverse-chars" | "trim" | "number" | "denumber">("sort-asc");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  return <div className="grid gap-3"><Field label="Operation" htmlFor="line-op"><Select id="line-op" value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}><option value="sort-asc">Sort ascending</option><option value="sort-desc">Sort descending</option><option value="unique">Unique lines</option><option value="reverse-lines">Reverse lines</option><option value="reverse-chars">Reverse characters</option><option value="trim">Trim whitespace</option><option value="number">Remove line numbers</option></Select></Field><Field label="Optional prefix" htmlFor="prefix"><Input id="prefix" value={prefix} onChange={(event) => setPrefix(event.target.value)} /></Field><Field label="Optional suffix" htmlFor="suffix"><Input id="suffix" value={suffix} onChange={(event) => setSuffix(event.target.value)} /></Field><TextWorkspace action="Transform" placeholder={"b\na"} run={(input) => withLineAffix(transformLines(input, mode), prefix, suffix)} /></div>;
}

function DiffTool() {
  const [left, setLeft] = useState("alpha\nbeta");
  const [right, setRight] = useState("alpha\ngamma");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      setOutput(compareText(left, right, "lines").map((part) => `${part.change === "added" ? "+ " : part.change === "removed" ? "- " : "  "}${part.value}`).join(""));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not compare.");
    }
  }
  useToolHotkeys(run, output);
  return <div className="grid gap-4 md:grid-cols-2"><TextArea aria-label="Original" value={left} onChange={(event) => setLeft(event.target.value)} /><TextArea aria-label="Changed" value={right} onChange={(event) => setRight(event.target.value)} /><div className="md:col-span-2"><Button variant="primary" onClick={run}>Compare</Button><ErrorNote message={error} /><OutputBlock value={output} /></div></div>;
}

function ReplaceTool() {
  const [search, setSearch] = useState("cat");
  const [replacement, setReplacement] = useState("dog");
  const [regex, setRegex] = useState(false);
  return <div className="grid gap-3"><div className="grid gap-3 md:grid-cols-2"><Field label="Find" htmlFor="find"><Input id="find" value={search} onChange={(event) => setSearch(event.target.value)} /></Field><Field label="Replace" htmlFor="replace"><Input id="replace" value={replacement} onChange={(event) => setReplacement(event.target.value)} /></Field></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={regex} onChange={(event) => setRegex(event.target.checked)} />Regular expression</label><TextWorkspace action="Replace" placeholder="The original stays in this box." run={(input) => findAndReplace(input, search, replacement, regex)} /></div>;
}

function LoremTool() {
  const [count, setCount] = useState(2);
  const [output, setOutput] = useState("");
  return <div className="grid gap-3"><Field label="Paragraphs" htmlFor="paras"><Input id="paras" type="number" min={1} max={20} value={count} onChange={(event) => setCount(Number(event.target.value))} /></Field><Button variant="primary" onClick={() => setOutput(loremIpsum(count))}>Generate</Button><p className="text-xs text-muted-foreground">Synthetic placeholder text, not a quotation.</p><OutputBlock value={output} /></div>;
}

function MarkdownTool() {
  const [input, setInput] = useState("# Notes\n\nA **safe** preview. Raw HTML is escaped.");
  const html = useMemoSafe(input);
  return <div className="grid gap-4 lg:grid-cols-2"><TextArea aria-label="Markdown" value={input} onChange={(event) => setInput(event.target.value)} /><div className="rounded-lg border bg-card p-4 text-sm" dangerouslySetInnerHTML={{ __html: html }} /></div>;
}

function useMemoSafe(input: string) {
  try {
    return renderMarkdown(input);
  } catch {
    return "<p>That Markdown is too large to preview.</p>";
  }
}

function TableTool() {
  const [headers, setHeaders] = useState("Name,Role");
  const [rows, setRows] = useState("Ada,Engineer");
  const [output, setOutput] = useState("");
  return <div className="grid gap-3"><Field label="Headers, comma separated" htmlFor="headers"><Input id="headers" value={headers} onChange={(event) => setHeaders(event.target.value)} /></Field><TextArea aria-label="Rows" value={rows} onChange={(event) => setRows(event.target.value)} /><Button variant="primary" onClick={() => setOutput(markdownTable(headers.split(","), rows.split(/\n/).filter(Boolean).map((row) => row.split(","))))}>Build table</Button><OutputBlock value={output} /></div>;
}
