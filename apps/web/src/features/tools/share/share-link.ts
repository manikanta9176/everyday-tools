import { fitsInQr } from "./signal";

export function phoneHost(addresses: string[]) {
  return addresses.find((address) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(address))
    ?? addresses.find((address) => address.endsWith(".local"))
    ?? "";
}

export function sharePageUrl(pageUrl: string, packed: string, addresses: string[] = []) {
  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    return "";
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    const lan = phoneHost(addresses);
    if (!lan) return "";
    url.hostname = lan;
  }
  url.search = "";
  url.hash = packed;
  const href = url.toString();
  return fitsInQr(href) ? href : "";
}

export function readSharePayload(value: string) {
  const text = value.trim();
  if (!text) return "";
  const hash = text.includes("#") ? text.slice(text.indexOf("#") + 1) : text.replace(/^#/, "");
  let payload = hash;
  try {
    payload = decodeURIComponent(hash);
  } catch {
    payload = hash;
  }
  return payload.startsWith("1") && payload.length > 20 ? payload : "";
}
