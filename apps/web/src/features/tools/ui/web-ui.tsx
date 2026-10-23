"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, TextArea } from "@/components/ui/field";
import { ErrorNote, Toggle } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { buildCurl, buildUrl, buildUtm, chmod, curlToFetch, decodeJwt, digestText, dockerCompose, envTemplate, gitignore, htmlBoilerplate, LICENSES, metaTags, nginxServer, parseCidr, parseUrl, parseUserAgent, readmeTemplate, robotsTxt, searchHttpStatus, sitemapXml, testRegex } from "@/features/tools/web/web-tools";
import { useToolHotkeys } from "./use-hotkeys";

export default function WebTools({ slug }: { slug: string }) {
  if (slug === "url-parser") return <UrlParser />;
  if (slug === "url-builder") return <UrlBuilder />;
  if (slug === "utm-builder") return <UtmTool />;
  if (slug === "http-status") return <StatusTool />;
  if (slug === "curl-builder") return <CurlTool />;
  if (slug === "jwt-inspector") return <JwtTool />;
  if (slug === "cidr-calculator") return <CidrTool />;
  if (slug === "meta-tags") return <MetaTool />;
  if (slug === "user-agent") return <AgentTool />;
  if (slug === "hash-generator") return <HashTool />;
  if (slug === "chmod-calculator") return <ChmodTool />;
  if (slug === "regex-tester") return <RegexTool />;
  return <SnippetTool slug={slug} />;
}

function UrlParser() {
  const [input, setInput] = useState("https://ada:secret@example.com:8443/docs?q=1#top");
  const [reveal, setReveal] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      const url = parseUrl(input, reveal);
      setOutput(Object.entries(url).map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`).join("\n"));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invalid URL.");
    }
  }
  useToolHotkeys(run, output);
  return <div className="grid gap-4"><TextArea aria-label="URL" value={input} onChange={(event) => setInput(event.target.value)} /><Toggle id="reveal" label="Reveal password" checked={reveal} onCheckedChange={setReveal} /><Button variant="primary" onClick={run}>Parse</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function UrlBuilder() {
  const [host, setHost] = useState("example.com");
  const [path, setPath] = useState("/docs");
  const [query, setQuery] = useState("q=tools");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><Field label="Host" htmlFor="host"><Input id="host" value={host} onChange={(event) => setHost(event.target.value)} /></Field><Field label="Path" htmlFor="path"><Input id="path" value={path} onChange={(event) => setPath(event.target.value)} /></Field><Field label="Query" htmlFor="query"><Input id="query" value={query} onChange={(event) => setQuery(event.target.value)} /></Field><Button variant="primary" onClick={() => { try { setOutput(buildUrl({ protocol: "https", host, path, hash: "", params: query.split("&").filter(Boolean).map((part) => { const [key, value] = part.split("="); return { key: key ?? "", value: value ?? "" }; }) })); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not build that URL."); } }}>Build</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function UtmTool() {
  const [url, setUrl] = useState("https://example.com");
  const [source, setSource] = useState("newsletter");
  const [medium, setMedium] = useState("email");
  const [campaign, setCampaign] = useState("launch");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><Field label="URL" htmlFor="utm-url"><Input id="utm-url" value={url} onChange={(event) => setUrl(event.target.value)} /></Field><Field label="Source" htmlFor="source"><Input id="source" value={source} onChange={(event) => setSource(event.target.value)} /></Field><Field label="Medium" htmlFor="medium"><Input id="medium" value={medium} onChange={(event) => setMedium(event.target.value)} /></Field><Field label="Campaign" htmlFor="campaign"><Input id="campaign" value={campaign} onChange={(event) => setCampaign(event.target.value)} /></Field><Button variant="primary" onClick={() => { try { setOutput(buildUtm(url, { source, medium, campaign })); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Enter a full URL."); } }}>Build link</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function StatusTool() {
  const [query, setQuery] = useState("");
  const matches = searchHttpStatus(query);
  return <div className="grid gap-4"><Field label="Search codes" htmlFor="status"><Input id="status" value={query} placeholder="404 or not found" onChange={(event) => setQuery(event.target.value)} /></Field><ul className="grid gap-2">{matches.map((status) => <li key={status.code} className="rounded-lg border bg-card px-3 py-2 text-sm"><strong>{status.code} {status.name}</strong><p className="text-muted-foreground">{status.summary}</p></li>)}</ul></div>;
}

function CurlTool() {
  const [url, setUrl] = useState("https://example.com/api");
  const [method, setMethod] = useState("POST");
  const [body, setBody] = useState('{"ok":true}');
  const [command, setCommand] = useState("");
  const [fetchCode, setFetchCode] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><p className="text-sm text-muted-foreground">The fetch sketch only understands a URL, -X, -H, and a quoted --data or -d. It does not run the command.</p><Field label="URL" htmlFor="curl-url"><Input id="curl-url" value={url} onChange={(event) => setUrl(event.target.value)} /></Field><Field label="Method" htmlFor="method"><Input id="method" value={method} onChange={(event) => setMethod(event.target.value)} /></Field><TextArea aria-label="Body" value={body} onChange={(event) => setBody(event.target.value)} /><Button variant="primary" onClick={() => setCommand(buildCurl({ method, url, headers: [{ name: "Content-Type", value: "application/json" }], body }))}>Build curl</Button><OutputBlock label="curl" value={command} /><Button onClick={() => { try { setFetchCode(curlToFetch(command || buildCurl({ method, url, headers: [], body }))); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not convert."); } }}>Sketch fetch</Button><ErrorNote message={error} /><OutputBlock label="fetch" value={fetchCode} /></div>;
}

function JwtTool() {
  const [token, setToken] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><p className="rounded-md bg-muted px-3 py-2 text-sm">Decoding reads the header and payload. It does not verify the signature.</p><TextArea aria-label="JWT" value={token} onChange={(event) => setToken(event.target.value)} /><Button variant="primary" onClick={() => { try { const decoded = decodeJwt(token); setOutput(`Verified: no\nExpires: ${decoded.claims.expires ?? "n/a"}\nNot before: ${decoded.claims.notBefore ?? "n/a"}\nIssued: ${decoded.claims.issued ?? "n/a"}\n\nHeader\n${JSON.stringify(decoded.header, null, 2)}\n\nPayload\n${JSON.stringify(decoded.payload, null, 2)}`); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Invalid JWT."); } }}>Decode</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function CidrTool() {
  const [input, setInput] = useState("192.168.1.10/24");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><Field label="IPv4 CIDR" htmlFor="cidr"><Input id="cidr" value={input} onChange={(event) => setInput(event.target.value)} /></Field><Button variant="primary" onClick={() => { try { const result = parseCidr(input); setOutput(Object.entries(result).map(([key, value]) => `${key}: ${value}`).join("\n")); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Invalid CIDR."); } }}>Calculate</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function MetaTool() {
  const [title, setTitle] = useState("Tools");
  const [description, setDescription] = useState("Small tools. Less busywork.");
  const [url, setUrl] = useState("https://example.com");
  const [image, setImage] = useState("https://example.com/cover.png");
  const [output, setOutput] = useState("");
  return <div className="grid gap-4"><Field label="Title" htmlFor="title"><Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} /></Field><Field label="Description" htmlFor="description"><Input id="description" value={description} onChange={(event) => setDescription(event.target.value)} /></Field><Field label="Canonical URL" htmlFor="canonical"><Input id="canonical" value={url} onChange={(event) => setUrl(event.target.value)} /></Field><Field label="Image URL" htmlFor="image"><Input id="image" value={image} onChange={(event) => setImage(event.target.value)} /></Field><Button variant="primary" onClick={() => setOutput(metaTags({ title, description, url, image }))}>Generate</Button><OutputBlock value={output} /></div>;
}

function AgentTool() {
  const [input, setInput] = useState(typeof navigator === "undefined" ? "" : navigator.userAgent);
  const [output, setOutput] = useState("");
  return <div className="grid gap-4"><TextArea aria-label="User agent" value={input} onChange={(event) => setInput(event.target.value)} /><Button variant="primary" onClick={() => { const parsed = parseUserAgent(input); setOutput(`${parsed.browser} ${parsed.version}\n${parsed.os}\nMobile: ${parsed.mobile ? "yes" : "no"}\n${parsed.note}`); }}>Parse</Button><OutputBlock value={output} /></div>;
}

function HashTool() {
  const [input, setInput] = useState("abc");
  const [algorithm, setAlgorithm] = useState<"SHA-1" | "SHA-256" | "SHA-384" | "SHA-512">("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><p className="text-sm text-muted-foreground">SHA-1 is included for checksums. Do not use it for new security decisions.</p><TextArea aria-label="Text to hash" value={input} onChange={(event) => setInput(event.target.value)} /><Field label="Algorithm" htmlFor="alg"><select id="alg" className="h-10 rounded-md border bg-card px-3" value={algorithm} onChange={(event) => setAlgorithm(event.target.value as typeof algorithm)}><option>SHA-1</option><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></Field><Button variant="primary" onClick={() => { void digestText(algorithm, input).then((value) => { setOutput(value); setError(""); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not hash.")); }}>Hash</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function ChmodTool() {
  const [owner, setOwner] = useState(7);
  const [group, setGroup] = useState(5);
  const [other, setOther] = useState(5);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4 md:grid-cols-3"><Field label="Owner" htmlFor="owner"><Input id="owner" type="number" min={0} max={7} value={owner} onChange={(event) => setOwner(Number(event.target.value))} /></Field><Field label="Group" htmlFor="group"><Input id="group" type="number" min={0} max={7} value={group} onChange={(event) => setGroup(Number(event.target.value))} /></Field><Field label="Other" htmlFor="other"><Input id="other" type="number" min={0} max={7} value={other} onChange={(event) => setOther(Number(event.target.value))} /></Field><div className="md:col-span-3"><Button variant="primary" onClick={() => { try { const result = chmod({ owner, group, other }); setOutput(`${result.octal}\n${result.symbolic}`); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Invalid bits."); } }}>Calculate</Button><ErrorNote message={error} /><OutputBlock value={output} /></div></div>;
}

function RegexTool() {
  const [pattern, setPattern] = useState("a+");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("baaa");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><p className="text-sm text-muted-foreground">Matches are highlighted below. A glossary is more reliable than an automatic English explanation of every pattern.</p><Field label="Pattern" htmlFor="pattern"><Input id="pattern" value={pattern} onChange={(event) => setPattern(event.target.value)} /></Field><Field label="Flags" htmlFor="flags"><Input id="flags" value={flags} onChange={(event) => setFlags(event.target.value)} /></Field><TextArea aria-label="Test text" value={text} onChange={(event) => setText(event.target.value)} /><Button variant="primary" onClick={() => { try { const result = testRegex(pattern, flags, text); setOutput(result.matches.length ? result.matches.map((match) => `${match.index}: ${match.value}`).join("\n") : "No matches."); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Invalid pattern."); } }}>Test</Button><ErrorNote message={error} /><OutputBlock value={output} /><ul className="text-xs text-muted-foreground"><li>\d digit, \w word, \s space</li><li>^ start, $ end, . any character except newline unless s is set</li><li>* + ? counts, [] a set, () a group</li></ul></div>;
}

function SnippetTool({ slug }: { slug: string }) {
  const [output, setOutput] = useState("");
  const [name, setName] = useState("everyday-tools");
  if (slug === "gitignore-generator") return <div className="grid gap-3"><Button variant="primary" onClick={() => setOutput(gitignore(["node", "next", "env", "macos"]))}>Node and Next</Button><OutputBlock value={output} /></div>;
  if (slug === "robots-generator") return <div className="grid gap-3"><Button variant="primary" onClick={() => setOutput(robotsTxt([{ agent: "*", allow: "/", disallow: "/private" }], "https://example.com/sitemap.xml"))}>Generate</Button><OutputBlock value={output} /></div>;
  if (slug === "sitemap-generator") return <div className="grid gap-3"><Button variant="primary" onClick={() => setOutput(sitemapXml(["https://example.com/", "https://example.com/docs"]))}>Generate</Button><OutputBlock value={output} /></div>;
  if (slug === "docker-compose-generator") return <div className="grid gap-3"><Button variant="primary" onClick={() => setOutput(dockerCompose("web", "nginx:alpine", 8080))}>Generate</Button><OutputBlock value={output} /></div>;
  if (slug === "nginx-generator") return <div className="grid gap-3"><p className="text-sm text-muted-foreground">A starter server block, not a hardened production config.</p><Button variant="primary" onClick={() => setOutput(nginxServer("example.com", "/var/www/html", 80))}>Generate</Button><OutputBlock value={output} /></div>;
  if (slug === "env-template") return <div className="grid gap-3"><Button variant="primary" onClick={() => setOutput(envTemplate(["database_url", "api_key"]))}>Generate</Button><OutputBlock value={output} /></div>;
  if (slug === "readme-generator") return <div className="grid gap-3"><Field label="Project name" htmlFor="project"><Input id="project" value={name} onChange={(event) => setName(event.target.value)} /></Field><Button variant="primary" onClick={() => setOutput(readmeTemplate({ name, description: "Describe the project.", license: "MIT" }))}>Generate</Button><OutputBlock value={output} /></div>;
  if (slug === "license-helper") return <div className="grid gap-3"><p className="text-sm text-muted-foreground">Standard license text for convenience, not legal advice.</p><Button variant="primary" onClick={() => setOutput(LICENSES.MIT(String(new Date().getFullYear()), name))}>MIT</Button><Button onClick={() => setOutput(LICENSES.ISC(String(new Date().getFullYear()), name))}>ISC</Button><Button onClick={() => setOutput(LICENSES["BSD-2-Clause"](String(new Date().getFullYear()), name))}>BSD-2-Clause</Button><OutputBlock value={output} /></div>;
  return <div className="grid gap-3"><Button variant="primary" onClick={() => setOutput(htmlBoilerplate(name, "A short description."))}>Generate</Button><OutputBlock value={output} /></div>;
}
