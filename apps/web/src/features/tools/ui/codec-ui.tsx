"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, TextArea } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import {
  binaryToText,
  buildQuery,
  countUtf8,
  decodeDataUrl,
  decodeHtml,
  decodeUrlComponent,
  decodeUtf8Base64,
  decodeUtf8Base64Url,
  encodeDataUrl,
  encodeHtml,
  encodeUrlComponent,
  encodeUtf8Base64,
  encodeUtf8Base64Url,
  escapeJsonString,
  hexToText,
  inspectUnicode,
  parseQuery,
  textToBinary,
  textToHex,
  unescapeJsonString,
} from "@/features/tools/encoding/codecs";
import { lookupMime } from "@/features/tools/encoding/mime";
import { TextWorkspace } from "./text-workspace";
import { useToolHotkeys } from "./use-hotkeys";

export default function CodecTools({ slug }: { slug: string }) {
  if (slug === "unicode-inspector") return <UnicodeTool />;
  if (slug === "utf8-byte-counter") return <CounterTool />;
  if (slug === "query-string") return <QueryTool />;
  if (slug === "mime-types") return <MimeTool />;
  if (slug === "data-url-codec") return <DataUrlTool />;
  const pair = pairs[slug];
  if (!pair) return null;
  return <PairTool {...pair} />;
}

const pairs: Record<string, { encode: (value: string) => string; decode: (value: string) => string; placeholder: string }> = {
  "base64-codec": { encode: encodeUtf8Base64, decode: decodeUtf8Base64, placeholder: "Text or Base64" },
  "base64url-codec": { encode: encodeUtf8Base64Url, decode: decodeUtf8Base64Url, placeholder: "Text or Base64URL" },
  "hex-codec": { encode: textToHex, decode: hexToText, placeholder: "Text or hex" },
  "url-codec": { encode: encodeUrlComponent, decode: decodeUrlComponent, placeholder: "Text or a percent-encoded string" },
  "html-entities": { encode: encodeHtml, decode: decodeHtml, placeholder: "Text or HTML entities" },
  "json-escape": { encode: escapeJsonString, decode: unescapeJsonString, placeholder: "Text or a JSON string escape" },
  "binary-codec": { encode: textToBinary, decode: binaryToText, placeholder: "Text or space-separated binary bytes" },
};

function PairTool({ encode, decode, placeholder }: { encode: (value: string) => string; decode: (value: string) => string; placeholder: string }) {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "encode" ? "primary" : "secondary"} onClick={() => setMode("encode")}>Encode</Button>
        <Button size="sm" variant={mode === "decode" ? "primary" : "secondary"} onClick={() => setMode("decode")}>Decode</Button>
      </div>
      <TextWorkspace key={mode} action={mode === "encode" ? "Encode" : "Decode"} placeholder={placeholder} run={(input) => (mode === "encode" ? encode(input) : decode(input))} />
    </div>
  );
}

function UnicodeTool() {
  return <TextWorkspace action="Inspect" placeholder="Paste text" outputLabel="Code points" run={(input) => inspectUnicode(input).map((row) => `${row.character}  ${row.codePoint}  UTF-8 ${row.utf8}  ${row.escape}`).join("\n")} />;
}

function CounterTool() {
  return <TextWorkspace action="Count" placeholder="Paste text" run={(input) => {
    const stats = countUtf8(input);
    return `${stats.characters} characters\n${stats.utf16CodeUnits} UTF-16 code units\n${stats.utf8Bytes} UTF-8 bytes`;
  }} />;
}

function QueryTool() {
  const [input, setInput] = useState("https://example.com/search?q=tools");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      const entries = parseQuery(input);
      setOutput(entries.length ? entries.map((entry) => `${entry.key}=${entry.value}`).join("\n") : buildQuery([{ key: "q", value: "tools" }], "https://example.com"));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not parse that query.");
    }
  }
  useToolHotkeys(run, output);
  return (
    <div className="grid gap-4">
      <TextArea aria-label="URL or query" value={input} onChange={(event) => setInput(event.target.value)} />
      <Button variant="primary" onClick={run}>Parse</Button>
      <ErrorNote message={error} />
      <OutputBlock value={output} />
    </div>
  );
}

function MimeTool() {
  return <TextWorkspace action="Look up" placeholder="png or image/png" run={(input) => {
    const matches = lookupMime(input);
    if (!matches.length) throw new Error("No common type matched. Try png, json, or pdf.");
    return matches.map((match) => `.${match.extension}  ${match.type}`).join("\n");
  }} />;
}

function DataUrlTool() {
  const [text, setText] = useState("hello");
  const [mime, setMime] = useState("text/plain");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      setOutput(text.startsWith("data:") ? decodeDataUrl(text).text : encodeDataUrl(new TextEncoder().encode(text), mime));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not convert that data URL.");
    }
  }
  useToolHotkeys(run, output);
  return (
    <div className="grid gap-4">
      <TextArea aria-label="Text or data URL" value={text} onChange={(event) => setText(event.target.value)} />
      <Field label="MIME type when encoding" htmlFor="mime"><Input id="mime" value={mime} onChange={(event) => setMime(event.target.value)} /></Field>
      <Button variant="primary" onClick={run}>Convert</Button>
      <ErrorNote message={error} />
      <OutputBlock value={output} />
    </div>
  );
}
