import { describe, expect, it } from "vitest";
import { addressKind, deviceRows, localServiceUrl, parsePublicNetwork, preferredAddress, publicRows, readHostCandidates, readResource, waterfallShare } from "./network";

describe("local network", () => {
  it("reads host addresses from ICE candidates", () => {
    const lines = [
      "candidate:1 1 udp 2122260223 192.168.1.20 54000 typ host generation 0",
      "candidate:2 1 udp 2122260223 192.168.1.20 54000 typ host",
      "candidate:3 1 tcp 1518280447 127.0.0.1 9 typ host tcptype active",
      "candidate:4 1 udp 1686052607 203.0.113.8 54000 typ srflx raddr 192.168.1.20 rport 54000",
    ];
    expect(readHostCandidates(lines)).toEqual(["192.168.1.20", "127.0.0.1"]);
  });

  it("prefers a private address over loopback and an mDNS name", () => {
    expect(addressKind("192.168.0.4")).toBe("private");
    expect(addressKind("abcd.local")).toBe("mdns");
    expect(preferredAddress(["abcd.local", "127.0.0.1", "10.0.0.8"])).toBe("10.0.0.8");
  });

  it("builds a link for a port on this device", () => {
    expect(localServiceUrl("192.168.1.20", 3000)).toBe("http://192.168.1.20:3000/");
    expect(localServiceUrl("fe80::1", 3000, "docs")).toBe("http://[fe80::1]:3000/docs");
    expect(() => localServiceUrl("192.168.1.20", 0)).toThrow(/port/);
  });

  it("describes this browser without a network lookup", () => {
    const rows = deviceRows({
      online: true,
      language: "en",
      languages: ["en-US"],
      timeZone: "Asia/Kolkata",
      cores: 8,
      touchPoints: 0,
      screen: "1440 × 900",
      viewport: "1200 × 800",
      pixelRatio: 2,
      colorDepth: 24,
      colorScheme: "Dark",
      reducedMotion: false,
      cookies: true,
      pdf: true,
      platform: "MacIntel",
      vendor: "Google Inc.",
      deviceMemory: 8,
      userAgent: "test",
      saveData: false,
      effectiveType: "4g",
      downlink: 10,
      rtt: 50,
    });
    expect(rows).toContainEqual(["Time zone", "Asia/Kolkata"]);
    expect(rows).toContainEqual(["Downlink estimate", "10 Mb/s"]);
    expect(rows).toContainEqual(["Device memory", "8 GB"]);
  });

  it("reads a public address lookup", () => {
    const place = parsePublicNetwork({
      ip: "203.0.113.10",
      version: "IPv4",
      city: "Hyderabad",
      region: "Telangana",
      country: "IN",
      country_name: "India",
      country_code: "IN",
      continent_code: "AS",
      postal: "500001",
      latitude: 17.38,
      longitude: 78.47,
      country_capital: "New Delhi",
      country_calling_code: "+91",
      currency: "INR",
      currency_name: "Rupee",
      languages: "en-IN,hi",
      timezone: "Asia/Kolkata",
      utc_offset: "+0530",
      asn: "AS17488",
      org: "Example Net",
      network: "203.0.113.0/24",
      country_tld: ".in",
    });
    expect(place.flag).toBe("🇮🇳");
    expect(place.continent).toBe("Asia");
    expect(place.utcOffset).toBe("+05:30");
    expect(publicRows(place)).toContainEqual(["Place", "Hyderabad, Telangana, India"]);
    expect(publicRows(place)).toContainEqual(["Currency", "INR · Rupee"]);
    const fallback = parsePublicNetwork({
      ip: "203.0.113.11",
      country: "India",
      country_code: "IN",
      city: "Hyderabad",
      latitude: "17.38",
      longitude: "78.47",
      organization_name: "Example Net",
      organization: "AS17488 Example Net",
      timezone: "Asia/Kolkata",
    });
    expect(fallback.asn).toBe("AS17488");
    expect(fallback.latitude).toBe(17.38);
    expect(() => parsePublicNetwork({ error: true, reason: "RateLimited" })).toThrow(/RateLimited/);
  });

  it("scales a request bar against the slowest call", () => {
    expect(waterfallShare(50, 200)).toBe(25);
    expect(waterfallShare(0, 0)).toBe(8);
  });

  it("labels a page request without its query string", () => {
    expect(readResource({
      name: "https://tools.manikanta.net/icon.svg?token=secret",
      initiatorType: "img",
      duration: 12.4,
      transferSize: 0,
      decodedBodySize: 80,
    })).toEqual({
      name: "https://tools.manikanta.net/icon.svg",
      type: "img",
      duration: 12,
      size: 0,
      cached: true,
    });
  });
});
