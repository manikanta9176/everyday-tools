export type AddressKind = "private" | "loopback" | "link-local" | "mdns" | "other";

export type DeviceFacts = {
  online: boolean;
  language: string;
  languages: string[];
  timeZone: string;
  cores: number;
  touchPoints: number;
  screen: string;
  viewport: string;
  pixelRatio: number;
  colorDepth: number;
  colorScheme: string;
  reducedMotion: boolean;
  cookies: boolean;
  pdf: boolean;
  platform: string;
  vendor: string;
  deviceMemory: number | null;
  userAgent: string;
  saveData: boolean | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
};

export type ConnectionSample = {
  downlink: number | null;
  rtt: number | null;
  latency: number | null;
  heap: number | null;
};

export type PublicNetwork = {
  ip: string;
  type: string;
  continent: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  postal: string;
  latitude: number | null;
  longitude: number | null;
  capital: string;
  callingCode: string;
  currency: string;
  languages: string;
  isp: string;
  org: string;
  asn: string;
  domain: string;
  network: string;
  timezone: string;
  utcOffset: string;
  flag: string;
};

export const PUBLIC_LOOKUP_URLS = ["https://ipapi.co/json/", "https://get.geojs.io/v1/ip/geo.json"] as const;

export type PageRequest = {
  name: string;
  type: string;
  duration: number;
  size: number;
  cached: boolean;
};

export function readHostCandidates(lines: string[]) {
  const addresses: string[] = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const typeIndex = parts.indexOf("typ");
    if (parts[typeIndex + 1] !== "host") continue;
    const address = parts[4]?.replace(/^\[|\]$/g, "");
    if (!address || address === "0.0.0.0" || address === "::") continue;
    if (!addresses.includes(address)) addresses.push(address);
  }
  return addresses;
}

export function addressKind(address: string): AddressKind {
  const value = address.toLowerCase();
  if (value.endsWith(".local")) return "mdns";
  if (value === "::1" || value.startsWith("127.")) return "loopback";
  if (value.startsWith("169.254.") || value.startsWith("fe80:")) return "link-local";
  if (value.startsWith("10.") || value.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(value) || value.startsWith("fc") || value.startsWith("fd")) return "private";
  return "other";
}

export function preferredAddress(addresses: string[]) {
  return addresses.find((address) => addressKind(address) === "private") ?? addresses.find((address) => addressKind(address) === "loopback") ?? addresses[0] ?? "";
}

export function localServiceUrl(address: string, port: number, path = "/") {
  const host = address.trim();
  if (!host || /\s/.test(host)) throw new Error("Enter an address from this device.");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Use a port from 1 to 65535.");
  const route = path.trim() === "" ? "/" : path.trim().startsWith("/") ? path.trim() : `/${path.trim()}`;
  const formatted = host.includes(":") && !host.startsWith("[") ? `[${host}]` : host;
  return `http://${formatted}:${port}${route}`;
}

export function deviceRows(facts: DeviceFacts) {
  return [
    ["Status", facts.online ? "Online" : "Offline"],
    ["Browser", facts.vendor || "Unknown"],
    ["Platform", facts.platform || "Unknown"],
    ["Language", facts.languages.join(", ") || facts.language || "Unknown"],
    ["Time zone", facts.timeZone || "Unknown"],
    ["Screen", facts.screen],
    ["Viewport", facts.viewport],
    ["Pixel ratio", String(facts.pixelRatio)],
    ["Color depth", `${facts.colorDepth}-bit`],
    ["Color scheme", facts.colorScheme],
    ["Reduced motion", facts.reducedMotion ? "On" : "Off"],
    ["Cookies", facts.cookies ? "Enabled" : "Blocked"],
    ["PDF viewer", facts.pdf ? "Available" : "Unavailable"],
    ["Processor threads", String(facts.cores)],
    ["Device memory", facts.deviceMemory == null ? "Not reported" : `${facts.deviceMemory} GB`],
    ["Touch points", String(facts.touchPoints)],
    ["Connection", facts.effectiveType ?? "Not reported"],
    ["Downlink estimate", facts.downlink == null ? "Not reported" : `${facts.downlink} Mb/s`],
    ["Round trip estimate", facts.rtt == null ? "Not reported" : `${facts.rtt} ms`],
    ["Data saver", facts.saveData == null ? "Not reported" : facts.saveData ? "On" : "Off"],
  ] as const;
}

export function parsePublicNetwork(value: unknown): PublicNetwork {
  if (!value || typeof value !== "object") throw new Error("The address lookup returned nothing.");
  const record = value as Record<string, unknown>;
  if (record.success === false || record.error === true) {
    throw new Error(text(record.message) || text(record.reason) || "The address lookup failed.");
  }
  const ip = text(record.ip);
  if (!ip) throw new Error("The address lookup did not include an address.");
  const countryCode = text(record.country_code) || (text(record.country).length === 2 ? text(record.country) : "");
  const country = text(record.country_name) || (text(record.country).length === 2 ? "" : text(record.country));
  const organization = text(record.organization);
  const asn = text(record.asn) || (typeof record.asn === "number" ? `AS${record.asn}` : organization.startsWith("AS") ? organization.split(" ")[0] ?? "" : "");
  return {
    ip,
    type: text(record.version) || text(record.type) || (ip.includes(":") ? "IPv6" : "IPv4"),
    continent: continentName(text(record.continent_code) || text(record.continent)),
    country,
    countryCode,
    region: text(record.region),
    city: text(record.city),
    postal: text(record.postal),
    latitude: numberOrNull(record.latitude),
    longitude: numberOrNull(record.longitude),
    capital: text(record.country_capital) || text(record.capital),
    callingCode: calling(text(record.country_calling_code) || text(record.calling_code)),
    currency: [text(record.currency), text(record.currency_name)].filter(Boolean).join(" · "),
    languages: text(record.languages),
    isp: text(record.organization_name) || text(record.org) || text(record.isp),
    org: text(record.org) || text(record.organization_name),
    asn,
    domain: text(record.domain) || text(record.country_tld),
    network: text(record.network),
    timezone: text(record.timezone) || text(recordOf(record.timezone).id),
    utcOffset: clockOffset(text(record.utc_offset) || text(recordOf(record.timezone).utc)),
    flag: flagEmoji(countryCode),
  };
}

export function publicRows(place: PublicNetwork) {
  const placeName = [place.city, place.region, place.country].filter(Boolean).join(", ");
  const position = place.latitude != null && place.longitude != null ? `${place.latitude}, ${place.longitude}` : "";
  return [
    ["Place", placeName || "Unknown"],
    ["Continent", place.continent || "Unknown"],
    ["Postal code", place.postal || "Unknown"],
    ["Coordinates", position || "Unknown"],
    ["Capital", place.capital || "Unknown"],
    ["Calling code", place.callingCode || "Unknown"],
    ["Currency", place.currency || "Unknown"],
    ["Languages", place.languages || "Unknown"],
    ["Provider", place.isp || "Unknown"],
    ["Organization", place.org || "Unknown"],
    ["Network", [place.asn, place.network].filter(Boolean).join(" · ") || "Unknown"],
    ["Domain", place.domain || "Unknown"],
    ["Lookup time zone", place.timezone ? `${place.timezone} ${place.utcOffset}`.trim() : "Unknown"],
  ] as const;
}

export function waterfallShare(duration: number, longest: number) {
  if (longest <= 0) return 8;
  return Math.max(8, Math.round((duration / longest) * 100));
}

export function readResource(entry: { name: string; initiatorType: string; duration: number; transferSize: number; decodedBodySize: number }): PageRequest {
  return {
    name: requestLabel(entry.name),
    type: entry.initiatorType || "other",
    duration: Math.round(entry.duration),
    size: entry.transferSize > 0 ? entry.transferSize : 0,
    cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
  };
}

export function requestLabel(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

function recordOf(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function calling(value: string) {
  if (!value) return "";
  return value.startsWith("+") ? value : `+${value}`;
}

function clockOffset(value: string) {
  const match = /^([+-])(\d{2})(\d{2})$/.exec(value);
  return match ? `${match[1]}${match[2]}:${match[3]}` : value;
}

function continentName(code: string) {
  const names: Record<string, string> = { AF: "Africa", AN: "Antarctica", AS: "Asia", EU: "Europe", NA: "North America", OC: "Oceania", SA: "South America" };
  return names[code.toUpperCase()] ?? code;
}

function flagEmoji(code: string) {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  return [...code.toUpperCase()].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join("");
}
