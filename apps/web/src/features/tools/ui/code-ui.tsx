"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { formatCode, formatSqlCode } from "@/features/tools/dev/format";
import WebTools from "./web-ui";

export default function CodeTools({ slug }: { slug: string }) {
  if (slug === "code-formatter") return <Formatter />;
  if (slug === "sql-formatter") return <SqlTool />;
  return <WebTools slug={slug} />;
}

function Formatter() {
  const [language, setLanguage] = useState<"javascript" | "typescript" | "html" | "css" | "markdown" | "json">("javascript");
  const [input, setInput] = useState("const value={a:1}");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <div className="grid gap-4"><Field label="Language" htmlFor="language"><Select id="language" value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}><option value="javascript">JavaScript</option><option value="typescript">TypeScript</option><option value="html">HTML</option><option value="css">CSS</option><option value="markdown">Markdown</option><option value="json">JSON</option></Select></Field><TextArea aria-label="Code" value={input} onChange={(event) => setInput(event.target.value)} /><Button variant="primary" disabled={busy} onClick={() => { setBusy(true); void formatCode(language, input).then((value) => { setOutput(value); setError(""); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not format.")).finally(() => setBusy(false)); }}>{busy ? "Formatting…" : "Format"}</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function SqlTool() {
  const [input, setInput] = useState("select id,name from users where active=1");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><TextArea aria-label="SQL" value={input} onChange={(event) => setInput(event.target.value)} /><Button variant="primary" onClick={() => { try { setOutput(formatSqlCode(input)); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not format SQL."); } }}>Format</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}
