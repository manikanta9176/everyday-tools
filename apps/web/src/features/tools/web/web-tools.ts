import { assertTextLimit } from "@/lib/limits";

export function parseUrl(input: string, revealPassword = false) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a full URL, including the scheme, such as https://example.com/path.");
  }
  return {
    href: url.href,
    protocol: url.protocol,
    username: url.username,
    password: url.password ? (revealPassword ? url.password : "••••••") : "",
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    params: [...url.searchParams.entries()].map(([key, value]) => ({ key, value })),
  };
}

export function buildUrl(parts: {
  protocol: string;
  host: string;
  path: string;
  params: { key: string; value: string }[];
  hash: string;
}) {
  const protocol = parts.protocol.endsWith(":") ? parts.protocol : `${parts.protocol}:`;
  const path = parts.path.startsWith("/") || parts.path === "" ? parts.path : `/${parts.path}`;
  const url = new URL(`${protocol}//${parts.host}${path}`);
  for (const param of parts.params) {
    if (param.key) url.searchParams.append(param.key, param.value);
  }
  url.hash = parts.hash.replace(/^#/, "");
  return url.toString();
}

export function buildUtm(url: string, campaign: { source: string; medium: string; campaign: string; term?: string; content?: string }) {
  const parsed = new URL(url);
  const entries: [string, string | undefined][] = [
    ["utm_source", campaign.source],
    ["utm_medium", campaign.medium],
    ["utm_campaign", campaign.campaign],
    ["utm_term", campaign.term],
    ["utm_content", campaign.content],
  ];
  for (const [key, value] of entries) {
    if (value) parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

export function buildCurl(options: { method: string; url: string; headers: { name: string; value: string }[]; body: string }) {
  const method = options.method.toUpperCase();
  const parts = [`curl -X ${method} ${shellQuote(options.url)}`];
  for (const header of options.headers) {
    if (header.name) parts.push(`-H ${shellQuote(`${header.name}: ${header.value}`)}`);
  }
  if (options.body && method !== "GET") parts.push(`--data ${shellQuote(options.body)}`);
  return parts.join(" \\\n  ");
}

function shellQuote(value: string) {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

export function curlToFetch(command: string) {
  assertTextLimit(command, "Command");
  const url = command.match(/https?:\/\/[^\s'"]+/)?.[0] ?? command.match(/'([^']+)'/)?.[1];
  if (!url) throw new Error("Include a URL. This converter understands curl -X, -H, and --data or -d.");
  const method = command.match(/(?:-X|--request)\s+([A-Za-z]+)/)?.[1]?.toUpperCase() ?? (/(--data|-d)\s/.test(command) ? "POST" : "GET");
  const headers = [...command.matchAll(/(?:-H|--header)\s+(?:'([^']*)'|"([^"]*)"|(\S+))/g)].map((match) => match[1] ?? match[2] ?? match[3] ?? "");
  const body = command.match(/(?:--data|--data-raw|-d)\s+(?:'([^']*)'|"([^"]*)")/)?.[1] ?? command.match(/(?:--data|--data-raw|-d)\s+(?:'([^']*)'|"([^"]*)")/)?.[2];
  const headerObject = Object.fromEntries(headers.filter(Boolean).map((header) => {
    const index = header.indexOf(":");
    return [header.slice(0, index).trim(), header.slice(index + 1).trim()];
  }));
  return `const response = await fetch(${JSON.stringify(url)}, ${JSON.stringify({ method, headers: headerObject, body: body ?? undefined }, null, 2)});\nconst text = await response.text();`;
}

export function decodeJwt(token: string) {
  assertTextLimit(token, "Token");
  const parts = token.trim().split(".");
  if (parts.length < 2) throw new Error("A JWT has a header, payload, and usually a signature, separated by dots.");
  const header = decodePart(parts[0]!, "header");
  const payload = decodePart(parts[1]!, "payload");
  const claims = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  return {
    header,
    payload,
    signature: parts[2] ?? "",
    claims: {
      expires: formatClaim(claims.exp),
      notBefore: formatClaim(claims.nbf),
      issued: formatClaim(claims.iat),
    },
    verified: false,
  };
}

function decodePart(part: string, label: string) {
  try {
    const padded = part.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (part.length % 4)) % 4);
    const json = new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)));
    return JSON.parse(json) as unknown;
  } catch {
    throw new Error(`The JWT ${label} is not valid Base64URL JSON.`);
  }
}

function formatClaim(value: unknown) {
  if (typeof value !== "number") return null;
  const ms = value > 1e11 ? value : value * 1000;
  return new Date(ms).toISOString();
}

export async function digestText(algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", text: string) {
  assertTextLimit(text);
  const bytes = new Uint8Array(await crypto.subtle.digest(algorithm, new TextEncoder().encode(text)));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function parseCidr(input: string) {
  const match = input.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (!match) throw new Error("Enter an IPv4 CIDR such as 192.168.1.10/24.");
  const octets = match[1]!.split(".").map(Number);
  const prefix = Number(match[2]);
  if (octets.some((octet) => octet > 255) || prefix > 32) throw new Error("IPv4 octets must be 0–255 and the prefix 0–32.");
  const ip = octets.reduce((sum, octet) => (sum << 8) + octet, 0) >>> 0;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = ip & mask;
  const broadcast = network | (~mask >>> 0);
  const hosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : 2 ** (32 - prefix) - 2;
  const format = (value: number) => [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
  return {
    network: format(network),
    broadcast: format(broadcast),
    netmask: format(mask),
    firstHost: prefix >= 31 ? format(network) : format(network + 1),
    lastHost: prefix >= 31 ? format(broadcast) : format(broadcast - 1),
    hosts,
    prefix,
  };
}

export function chmod(bits: { owner: number; group: number; other: number }) {
  const values = [bits.owner, bits.group, bits.other];
  if (values.some((value) => !Number.isInteger(value) || value < 0 || value > 7)) {
    throw new Error("Each permission group is a number from 0 to 7.");
  }
  const symbolic = values
    .map((value) => `${value & 4 ? "r" : "-"}${value & 2 ? "w" : "-"}${value & 1 ? "x" : "-"}`)
    .join("");
  return { octal: values.join(""), symbolic };
}

const HTTP_STATUS: { code: number; name: string; summary: string }[] = [
  { code: 200, name: "OK", summary: "The request succeeded." },
  { code: 201, name: "Created", summary: "A resource was created." },
  { code: 204, name: "No Content", summary: "Success, with no response body." },
  { code: 301, name: "Moved Permanently", summary: "The resource has a new permanent URL." },
  { code: 302, name: "Found", summary: "The resource is temporarily at another URL." },
  { code: 304, name: "Not Modified", summary: "Cached content is still valid." },
  { code: 400, name: "Bad Request", summary: "The server could not understand the request." },
  { code: 401, name: "Unauthorized", summary: "Authentication is required or failed." },
  { code: 403, name: "Forbidden", summary: "The server understood the request and refuses it." },
  { code: 404, name: "Not Found", summary: "No resource matches the URL." },
  { code: 409, name: "Conflict", summary: "The request conflicts with the current state." },
  { code: 422, name: "Unprocessable Content", summary: "The syntax was valid, but the content cannot be processed." },
  { code: 429, name: "Too Many Requests", summary: "The client sent too many requests." },
  { code: 500, name: "Internal Server Error", summary: "The server failed while handling the request." },
  { code: 502, name: "Bad Gateway", summary: "An upstream server returned an invalid response." },
  { code: 503, name: "Service Unavailable", summary: "The server is not ready to handle the request." },
  { code: 504, name: "Gateway Timeout", summary: "An upstream server did not respond in time." },
];

export function searchHttpStatus(query: string) {
  const needle = query.trim().toLowerCase();
  return HTTP_STATUS.filter((status) => !needle || `${status.code} ${status.name} ${status.summary}`.toLowerCase().includes(needle));
}

export function parseUserAgent(agent: string) {
  const browser = agent.match(/(Edg|Chrome|Firefox|Version|Safari)\/(\d+(?:\.\d+)?)/);
  const os = agent.includes("Windows") ? "Windows" : agent.includes("Mac OS X") ? "macOS" : agent.includes("Android") ? "Android" : agent.includes("iPhone") || agent.includes("iPad") ? "iOS" : agent.includes("Linux") ? "Linux" : "Unknown";
  const name = browser?.[1] === "Version" ? "Safari" : browser?.[1] === "Edg" ? "Edge" : browser?.[1] ?? "Unknown";
  return { browser: name, version: browser?.[2] ?? "", os, mobile: /Mobile|Android|iPhone/.test(agent), note: "This is a best-effort reading of common tokens, not a complete user-agent database." };
}

export function metaTags(input: { title: string; description: string; url: string; image: string }) {
  return [
    `<title>${escapeHtml(input.title)}</title>`,
    `<meta name="description" content="${escapeHtml(input.description)}">`,
    `<link rel="canonical" href="${escapeHtml(input.url)}">`,
    `<meta property="og:title" content="${escapeHtml(input.title)}">`,
    `<meta property="og:description" content="${escapeHtml(input.description)}">`,
    `<meta property="og:url" content="${escapeHtml(input.url)}">`,
    `<meta property="og:image" content="${escapeHtml(input.image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join("\n");
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

export function robotsTxt(rules: { agent: string; allow: string; disallow: string }[], sitemap?: string) {
  const body = rules
    .map((rule) => [`User-agent: ${rule.agent || "*"}`, rule.allow ? `Allow: ${rule.allow}` : "", rule.disallow ? `Disallow: ${rule.disallow}` : ""].filter(Boolean).join("\n"))
    .join("\n\n");
  return sitemap ? `${body}\n\nSitemap: ${sitemap}\n` : `${body}\n`;
}

export function sitemapXml(urls: string[]) {
  const body = urls
    .filter(Boolean)
    .map((url) => `  <url><loc>${url.replaceAll("&", "&amp;")}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function gitignore(selections: string[]) {
  const blocks: Record<string, string> = {
    node: "node_modules/\n.pnpm-store/",
    next: ".next/\nout/",
    env: ".env\n.env.*\n!.env.example",
    macos: ".DS_Store",
    python: "__pycache__/\n.venv/\n*.pyc",
    logs: "*.log\nnpm-debug.log*",
  };
  return selections.map((selection) => blocks[selection] ?? "").filter(Boolean).join("\n");
}

export function envTemplate(keys: string[]) {
  return keys
    .map((key) => key.trim())
    .filter(Boolean)
    .map((key) => `${key.replace(/[^A-Za-z0-9_]/g, "_").toUpperCase()}=`)
    .join("\n");
}

export function readmeTemplate(project: { name: string; description: string; license: string }) {
  return `# ${project.name}\n\n${project.description}\n\n## Develop\n\n\`\`\`bash\npnpm install\npnpm dev\n\`\`\`\n\n## License\n\n${project.license}\n`;
}

export const LICENSES: Record<string, (year: string, name: string) => string> = {
  MIT: (year, name) => `MIT License\n\nCopyright (c) ${year} ${name}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`,
  ISC: (year, name) => `ISC License\n\nCopyright (c) ${year} ${name}\n\nPermission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.\n\nTHE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.`,
  "BSD-2-Clause": (year, name) => `BSD 2-Clause License\n\nCopyright (c) ${year} ${name}\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n\n1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\n\n2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED.`,
};

export function htmlBoilerplate(title: string, description: string) {
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${escapeHtml(title)}</title>\n  <meta name="description" content="${escapeHtml(description)}">\n</head>\n<body>\n  <main>\n    <h1>${escapeHtml(title)}</h1>\n  </main>\n</body>\n</html>\n`;
}

export function dockerCompose(service: string, image: string, port: number) {
  const name = service.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "app";
  return `services:\n  ${name}:\n    image: ${image || "nginx:alpine"}\n    ports:\n      - "${port}:80"\n    restart: unless-stopped\n`;
}

export function nginxServer(serverName: string, root: string, port: number) {
  return `server {\n  listen ${port};\n  server_name ${serverName || "example.com"};\n  root ${root || "/var/www/html"};\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n`;
}

export function testRegex(pattern: string, flags: string, text: string) {
  assertTextLimit(text);
  if (!/^[dgimsuvy]*$/.test(flags)) throw new Error("Flags can include d, g, i, m, s, u, v, and y.");
  let expression: RegExp;
  try {
    expression = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "That regular expression is invalid.");
  }
  const matches: { value: string; index: number }[] = [];
  for (const match of text.matchAll(expression)) {
    matches.push({ value: match[0], index: match.index ?? 0 });
    if (matches.length === 200) break;
  }
  return { matches, truncated: matches.length === 200 };
}

export function placeholderSvg(width: number, height: number, background: string, label: string) {
  if (width < 1 || height < 1 || width > 4000 || height > 4000) throw new Error("Use dimensions from 1 to 4000 pixels.");
  const safeLabel = label.replace(/[<>&"]/g, "");
  const fill = /^#[0-9a-f]{6}$/i.test(background) ? background : "#d6d3d1";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#1c1917" font-family="sans-serif" font-size="20">${safeLabel || `${width}×${height}`}</text></svg>`;
}
