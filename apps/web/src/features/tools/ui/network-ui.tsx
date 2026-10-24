"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyButton, ErrorNote } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/field";
import { formatBytes } from "@/lib/utils";
import { styledQrDataUrl, styledQrSvg } from "@/features/tools/qr/styled-qr";
import { addressKind, deviceRows, localServiceUrl, parsePublicNetwork, preferredAddress, PUBLIC_LOOKUP_URLS, publicRows, readResource, waterfallShare, type ConnectionSample, type DeviceFacts, type PageRequest, type PublicNetwork } from "@/features/tools/web/network";
import { useHostAddresses } from "@/features/tools/web/use-host-addresses";

type BrowserConnection = {
  downlink?: number;
  rtt?: number;
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

export function NetworkDetails() {
  const { addresses, ready } = useHostAddresses();
  const [facts, setFacts] = useState<DeviceFacts | null>(null);
  const [samples, setSamples] = useState<ConnectionSample[]>([]);
  const [requests, setRequests] = useState<PageRequest[]>([]);
  const [place, setPlace] = useState<PublicNetwork | null>(null);
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const latency = await measurePageLatency();
      if (cancelled) return;
      const next = readFacts(latency);
      setFacts(next.facts);
      setSamples((current) => [...current, next.sample].slice(-40));
    };
    void tick();
    const timer = window.setInterval(() => void tick(), 2000);
    const connection = browserConnection();
    const onChange = () => void tick();
    connection?.addEventListener?.("change", onChange);
    window.addEventListener("online", onChange);
    window.addEventListener("offline", onChange);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      connection?.removeEventListener?.("change", onChange);
      window.removeEventListener("online", onChange);
      window.removeEventListener("offline", onChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void lookupPublicNetwork()
      .then((value) => {
        if (!cancelled) setPlace(value);
      })
      .catch((reason) => {
        if (!cancelled) setLookupError(reason instanceof Error ? reason.message : "The address lookup failed.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const list = () => {
      const entries = (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
        .filter((entry) => !entry.name.includes("__nextjs_original-stack-frames"));
      setRequests(entries.slice(-12).reverse().map((entry) => readResource(entry)));
    };
    list();
    const observer = new PerformanceObserver(list);
    observer.observe({ type: "resource", buffered: true });
    return () => observer.disconnect();
  }, []);

  const longest = Math.max(...requests.map((request) => request.duration), 1);

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted-foreground">
        The public address, place, and provider come from ipapi.co. If that is busy, the page asks geojs.io. The graphs after that are measured in this browser.
      </p>
      <ErrorNote message={lookupError} />
      {place ? (
        <section className="grid gap-4 rounded-[28px] border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Public {place.type}</p>
              <p className="mt-1 text-3xl font-medium tracking-tight">{place.flag ? `${place.flag} ` : ""}{place.ip}</p>
              <p className="mt-1 text-sm text-muted-foreground">{[place.city, place.region, place.country].filter(Boolean).join(", ") || "Place unavailable"}</p>
            </div>
            <CopyButton value={place.ip} label="Copy address" />
          </div>
          <dl className="grid gap-2 sm:grid-cols-2">
            {publicRows(place).map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 text-sm font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : lookupError ? null : (
        <p className="text-sm text-muted-foreground">Looking up the public address…</p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <Trend samples={samples} label="Downlink" unit="Mb/s" pick={(sample) => sample.downlink} />
        <Trend samples={samples} label="Browser round trip" unit="ms" pick={(sample) => sample.rtt} />
        <Trend samples={samples} label="Page latency" unit="ms" pick={(sample) => sample.latency} />
        <Trend samples={samples} label="JavaScript heap" unit="MB" pick={(sample) => sample.heap} />
      </div>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Addresses on this device</h2>
        {addresses.length ? (
          <ul className="grid gap-2">
            {addresses.map((address) => (
              <li key={address} className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
                <span>
                  <span className="font-medium">{address}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{kindLabel(addressKind(address))}</span>
                </span>
                <CopyButton value={address} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{ready ? "No local address was offered." : "Looking for local addresses…"}</p>
        )}
      </section>
      {facts ? (
        <section className="grid gap-2">
          <h2 className="text-sm font-medium">This browser</h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            {deviceRows(facts).map(([label, value]) => (
              <div key={label} className="rounded-2xl border bg-card px-4 py-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-2xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">User agent</p>
            <p className="mt-1 text-sm font-medium break-words">{facts.userAgent}</p>
          </div>
        </section>
      ) : null}
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Requests this page made</h2>
        <p className="text-xs leading-5 text-muted-foreground">Each bar is that request’s time compared with the slowest one in this list.</p>
        {requests.length ? (
          <ul className="grid gap-2">
            {requests.map((request, index) => (
              <li key={`${request.name}-${index}`} className="grid gap-1 rounded-2xl border bg-card px-4 py-3 text-sm">
                <span className="truncate font-medium">{request.name}</span>
                <span className="text-xs text-muted-foreground">{request.type} · {request.duration} ms · {request.cached ? "cached" : formatBytes(request.size)}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-foreground" style={{ width: `${waterfallShare(request.duration, longest)}%` }} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No page requests yet.</p>
        )}
      </section>
    </div>
  );
}

export function LocalPort() {
  const { addresses, ready } = useHostAddresses();
  const [address, setAddress] = useState("");
  const [touched, setTouched] = useState(false);
  const [port, setPort] = useState(3000);
  const [path, setPath] = useState("/");
  const [image, setImage] = useState("");
  const shown = touched ? address : preferredAddress(addresses);
  let url = "";
  let urlError = "";
  if (shown) {
    try {
      url = localServiceUrl(shown, port, path);
    } catch (reason) {
      urlError = reason instanceof Error ? reason.message : "Could not build a link.";
    }
  }

  useEffect(() => {
    if (!url) {
      setImage("");
      return;
    }
    let cancelled = false;
    void styledQrSvg(url, { dark: "#141311", light: "#ffffff", errorCorrectionLevel: "M" }).then((svg) => {
      if (!cancelled) setImage(styledQrDataUrl(svg));
    }).catch(() => {
      if (!cancelled) setImage("");
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Start the site on this computer first. Another device on the same Wi-Fi can open the link. To send a file you chose, use <Link href="/tools/qr-file-share" className="font-medium text-foreground underline">QR File Share</Link>.
      </p>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_9rem]">
        <Field label="Address" htmlFor="lan-address" hint="Use a 192.168 or 10. address when the browser only shows a .local name.">
          <Input
            id="lan-address"
            value={shown}
            placeholder={ready ? "192.168.1.20" : "Looking for an address…"}
            onChange={(event) => {
              setTouched(true);
              setAddress(event.target.value);
            }}
          />
        </Field>
        <Field label="Port" htmlFor="lan-port">
          <Input id="lan-port" inputMode="numeric" value={port} onChange={(event) => setPort(Number(event.target.value))} />
        </Field>
      </div>
      <Field label="Path" htmlFor="lan-path">
        <Input id="lan-path" value={path} onChange={(event) => setPath(event.target.value)} />
      </Field>
      <ErrorNote message={urlError} />
      {url ? (
        <div className="grid gap-3 rounded-[28px] border bg-card p-4">
          <a href={url} className="break-all text-sm font-medium underline">{url}</a>
          <CopyButton value={url} label="Copy link" />
          {image ? (
            // The code is drawn in the browser so the other device can open the link.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="QR code for the local link" className="w-full max-w-48 rounded-2xl bg-white" />
          ) : null}
        </div>
      ) : null}
      {addresses.length > 1 ? (
        <ul className="grid gap-2">
          {addresses.map((item) => {
            let href = "";
            try {
              href = localServiceUrl(item, port, path);
            } catch {
              return null;
            }
            return (
              <li key={item} className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
                <span className="min-w-0">
                  <a href={href} className="block truncate text-sm font-medium underline">{href}</a>
                  <span className="text-xs text-muted-foreground">{kindLabel(addressKind(item))}</span>
                </span>
                <CopyButton value={href} />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Trend({ samples, label, unit, pick }: { samples: ConnectionSample[]; label: string; unit: string; pick: (sample: ConnectionSample) => number | null }) {
  const values = samples.map(pick);
  const numbers = values.filter((value): value is number => value != null);
  const latest = numbers.at(-1);
  const max = Math.max(...numbers, 1);
  const width = 320;
  const height = 88;
  const step = samples.length > 1 ? width / (samples.length - 1) : width;
  const coords = values.flatMap((value, index) => (value == null ? [] : [`${index * step},${height - 8 - (value / max) * (height - 16)}`]));
  const area = coords.length > 1 ? `0,${height} ${coords.join(" ")} ${width},${height}` : "";

  return (
    <figure className="grid gap-2 rounded-[24px] border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <figcaption className="text-sm font-medium">{label}</figcaption>
        <p className="text-sm text-muted-foreground">{latest == null ? "Not reported" : `${latest} ${unit}`}</p>
      </div>
      {coords.length > 1 ? (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full text-foreground" role="img" aria-label={label}>
          <polygon points={area} fill="currentColor" opacity="0.12" />
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points={coords.join(" ")} />
        </svg>
      ) : (
        <p className="text-sm text-muted-foreground">{samples.length > 1 ? "Not reported by this browser." : "Waiting for samples."}</p>
      )}
    </figure>
  );
}

function kindLabel(kind: ReturnType<typeof addressKind>) {
  if (kind === "private") return "Reachable on this Wi-Fi";
  if (kind === "loopback") return "This computer only";
  if (kind === "link-local") return "Link-local";
  if (kind === "mdns") return "Name only. The numeric address is hidden.";
  return "Address";
}

function browserConnection() {
  return (navigator as Navigator & { connection?: BrowserConnection }).connection;
}

function readFacts(latency: number | null) {
  const connection = browserConnection();
  const browser = navigator as Navigator & { deviceMemory?: number; vendor?: string; platform?: string };
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
  const facts: DeviceFacts = {
    online: navigator.onLine,
    language: navigator.language,
    languages: [...navigator.languages],
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cores: navigator.hardwareConcurrency,
    touchPoints: navigator.maxTouchPoints,
    screen: `${window.screen.width} × ${window.screen.height}`,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio,
    colorDepth: window.screen.colorDepth,
    colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Light",
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    cookies: navigator.cookieEnabled,
    pdf: navigator.pdfViewerEnabled,
    platform: browser.platform ?? "",
    vendor: browser.vendor ?? "",
    deviceMemory: typeof browser.deviceMemory === "number" ? browser.deviceMemory : null,
    userAgent: navigator.userAgent,
    saveData: connection?.saveData ?? null,
    effectiveType: connection?.effectiveType ?? null,
    downlink: typeof connection?.downlink === "number" ? connection.downlink : null,
    rtt: typeof connection?.rtt === "number" ? connection.rtt : null,
  };
  return {
    facts,
    sample: {
      downlink: facts.downlink,
      rtt: facts.rtt,
      latency,
      heap: memory ? Math.round((memory.usedJSHeapSize / 1048576) * 10) / 10 : null,
    } satisfies ConnectionSample,
  };
}

async function lookupPublicNetwork() {
  let last = "The address lookup did not respond.";
  for (const url of PUBLIC_LOOKUP_URLS) {
    try {
      const response = await fetch(url);
      const value = await response.json() as unknown;
      return parsePublicNetwork(value);
    } catch (reason) {
      last = reason instanceof Error ? reason.message : last;
    }
  }
  throw new Error(last);
}

async function measurePageLatency() {
  try {
    const start = performance.now();
    await fetch("/favicon.ico", { cache: "no-store" });
    return Math.round(performance.now() - start);
  } catch {
    return null;
  }
}
