"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { ErrorNote, Toggle } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { csvToJson, diffEnv, formatXml, jsonToCsv, jsonToToml, jsonToYaml, minifyXml, tomlToJson, xmlToJson, yamlToJson, XML_RULES } from "@/features/tools/json/conversions";
import { buildJsonTree, findDuplicateKeys, formatJson, jsonToTypeScript, minifyJson, queryJsonPath } from "@/features/tools/json/json-tools";
import { validateJsonSchema } from "@/features/tools/json/schema";
import type { JsonTree } from "@/features/tools/json/json-tools";
import { useToolHotkeys } from "./use-hotkeys";

export default function DataTools({ slug }: { slug: string }) {
  if (slug === "json-formatter") return <JsonFormatter />;
  if (slug === "json-diff") return <TwoInput tool="json" />;
  if (slug === "env-diff") return <EnvDiff />;
  if (slug === "json-schema") return <SchemaTool />;
  if (slug === "jsonpath") return <JsonPathTool />;
  if (slug === "xml-tools") return <XmlTool />;
  return <Converter slug={slug} />;
}

function JsonFormatter() {
  const [input, setInput] = useState('{\n  "b": 1,\n  "a": [true]\n}');
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");
  const [sort, setSort] = useState(false);
  const [tree, setTree] = useState(false);
  const [output, setOutput] = useState("");
  const [nodes, setNodes] = useState<JsonTree | null>(null);
  const [duplicates, setDuplicates] = useState<string>("");
  const [error, setError] = useState("");
  function run(minify = false) {
    try {
      const value = minify ? minifyJson(input) : formatJson(input, indent === "tab" ? "tab" : Number(indent), sort);
      setOutput(value);
      setNodes(buildJsonTree(JSON.parse(value)));
      const dupes = findDuplicateKeys(input);
      setDuplicates(dupes.length ? dupes.map((item) => `${item.path || "/"} key “${item.key}”`).join("\n") : "");
      setError("");
    } catch (reason) {
      setOutput("");
      setNodes(null);
      setError(reason instanceof Error ? reason.message : "Invalid JSON.");
    }
  }
  useToolHotkeys(() => run(false), output);
  return (
    <div className="grid gap-4">
      <TextArea aria-label="JSON" value={input} onChange={(event) => setInput(event.target.value)} />
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Indent" htmlFor="indent"><Select id="indent" value={indent} onChange={(event) => setIndent(event.target.value as typeof indent)}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></Select></Field>
        <Toggle id="sort" label="Sort keys" checked={sort} onCheckedChange={setSort} />
        <Toggle id="tree" label="Tree view" checked={tree} onCheckedChange={setTree} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => run(false)}>Format</Button>
        <Button onClick={() => run(true)}>Minify</Button>
        <Button onClick={() => { setInput(""); setOutput(""); setError(""); setNodes(null); }}>Clear</Button>
      </div>
      <ErrorNote message={error} />
      {duplicates ? <p className="text-sm text-danger">Duplicate keys, last value wins in JSON.parse: {duplicates}</p> : null}
      {tree && nodes ? <JsonTreeView node={nodes} /> : <OutputBlock value={output} />}
    </div>
  );
}

function JsonTreeView({ node }: { node: JsonTree }) {
  return (
    <ul className="grid gap-1 rounded-lg border bg-card p-3 font-mono text-sm">
      <li>
        <span className="text-muted-foreground">{node.key}: </span>
        {node.children ? <details open={node.id === "root"}><summary>{node.preview}</summary><div className="pl-4">{node.children.map((child) => <JsonTreeView key={child.id} node={child} />)}</div></details> : node.preview}
      </li>
    </ul>
  );
}

function Converter({ slug }: { slug: string }) {
  const [mode, setMode] = useState<"forward" | "back">("forward");
  const spec = useMemo(() => {
    if (slug === "csv-json") return { forward: "CSV to JSON", back: "JSON to CSV", run: (value: string) => mode === "forward" ? csvToJson(value) : jsonToCsv(value), note: "Quoted commas, quotes, and line breaks are handled by a CSV parser." };
    if (slug === "yaml-json") return { forward: "YAML to JSON", back: "JSON to YAML", run: (value: string) => mode === "forward" ? yamlToJson(value) : jsonToYaml(value), note: "Dates and custom YAML tags may not round-trip exactly." };
    if (slug === "toml-json") return { forward: "TOML to JSON", back: "JSON to TOML", run: (value: string) => mode === "forward" ? tomlToJson(value) : jsonToToml(value), note: "TOML needs an object at the top level when converting from JSON." };
    return { forward: "JSON to TypeScript", back: "JSON to TypeScript", run: (value: string) => jsonToTypeScript(value), note: "This drafts interfaces from one sample. It does not infer every union." };
  }, [mode, slug]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      setOutput(spec.run(input));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not convert that input.");
    }
  }
  useToolHotkeys(run, output);
  return (
    <div className="grid gap-4">
      {slug !== "json-to-typescript" ? <div className="flex gap-2"><Button size="sm" variant={mode === "forward" ? "primary" : "secondary"} onClick={() => setMode("forward")}>{spec.forward}</Button><Button size="sm" variant={mode === "back" ? "primary" : "secondary"} onClick={() => setMode("back")}>{spec.back}</Button></div> : null}
      <p className="text-sm text-muted-foreground">{spec.note}</p>
      <TextArea aria-label="Structured input" value={input} onChange={(event) => setInput(event.target.value)} />
      <Button variant="primary" onClick={run}>Convert</Button>
      <ErrorNote message={error} />
      <OutputBlock value={output} />
    </div>
  );
}

function XmlTool() {
  const [input, setInput] = useState('<user id="1">Ada</user>');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run(kind: "format" | "minify" | "json") {
    try {
      setOutput(kind === "json" ? xmlToJson(input) : kind === "minify" ? minifyXml(input) : formatXml(input));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not parse that XML.");
    }
  }
  return (
    <div className="grid gap-4">
      <ul className="list-disc pl-5 text-sm text-muted-foreground">{XML_RULES.map((rule) => <li key={rule}>{rule}</li>)}</ul>
      <TextArea aria-label="XML" value={input} onChange={(event) => setInput(event.target.value)} />
      <div className="flex flex-wrap gap-2"><Button variant="primary" onClick={() => run("format")}>Format</Button><Button onClick={() => run("minify")}>Minify</Button><Button onClick={() => run("json")}>To JSON</Button></div>
      <ErrorNote message={error} />
      <OutputBlock value={output} />
    </div>
  );
}

function TwoInput({ tool }: { tool: "json" }) {
  const [left, setLeft] = useState('{"a":1}');
  const [right, setRight] = useState('{"a":2}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      const a = JSON.stringify(JSON.parse(left));
      const b = JSON.stringify(JSON.parse(right));
      setOutput(a === b ? "The JSON values are equal." : `Left\n${formatJson(left)}\n\nRight\n${formatJson(right)}`);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invalid JSON.");
    }
  }
  useToolHotkeys(run, output);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextArea aria-label="Left JSON" value={left} onChange={(event) => setLeft(event.target.value)} />
      <TextArea aria-label="Right JSON" value={right} onChange={(event) => setRight(event.target.value)} />
      <div className="md:col-span-2"><Button variant="primary" onClick={run}>Compare {tool}</Button></div>
      <div className="md:col-span-2"><ErrorNote message={error} /><OutputBlock value={output} /></div>
    </div>
  );
}

function EnvDiff() {
  const [left, setLeft] = useState("NAME=ada\nSECRET=local-secret-value");
  const [right, setRight] = useState("NAME=grace\nSECRET=other-secret-value");
  const [reveal, setReveal] = useState(false);
  const [output, setOutput] = useState("");
  function run() {
    const rows = diffEnv(left, right, reveal);
    setOutput(rows.length ? rows.map((row) => `${row.change.toUpperCase()} ${row.key}${row.sensitive ? " (masked)" : ""}\n  left: ${row.left}\n  right: ${row.right}`).join("\n") : "No key changes.");
  }
  useToolHotkeys(run, output);
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea aria-label="First env file" value={left} onChange={(event) => setLeft(event.target.value)} />
        <TextArea aria-label="Second env file" value={right} onChange={(event) => setRight(event.target.value)} />
      </div>
      <Toggle id="reveal" label="Reveal likely secret values" checked={reveal} onCheckedChange={setReveal} />
      <Button variant="primary" onClick={run}>Compare</Button>
      <OutputBlock value={output} />
    </div>
  );
}

function SchemaTool() {
  const [data, setData] = useState('{"name":"Ada"}');
  const [schema, setSchema] = useState('{"type":"object","required":["name"],"properties":{"name":{"type":"string"}}}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      const result = validateJsonSchema(data, schema);
      setOutput(result.valid ? "Valid." : result.errors.join("\n"));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not validate.");
    }
  }
  useToolHotkeys(run, output);
  return <div className="grid gap-4"><TextArea aria-label="JSON data" value={data} onChange={(event) => setData(event.target.value)} /><TextArea aria-label="JSON Schema" value={schema} onChange={(event) => setSchema(event.target.value)} /><Button variant="primary" onClick={run}>Validate</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function JsonPathTool() {
  const [data, setData] = useState('{"user":{"name":"Ada"},"items":[{"name":"Lin"}]}');
  const [path, setPath] = useState("$..name");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      const nodes = queryJsonPath(JSON.parse(data), path);
      setOutput(nodes.length ? nodes.map((node) => `${node.path} = ${JSON.stringify(node.value)}`).join("\n") : "No matches. Supported forms: $.a, ['a'], [0], [*], and ..a.");
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not query that JSON.");
    }
  }
  useToolHotkeys(run, output);
  return <div className="grid gap-4"><TextArea aria-label="JSON" value={data} onChange={(event) => setData(event.target.value)} /><Field label="JSONPath" htmlFor="path"><input id="path" className="h-10 rounded-md border bg-card px-3 font-mono text-sm" value={path} onChange={(event) => setPath(event.target.value)} /></Field><Button variant="primary" onClick={run}>Query</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}
