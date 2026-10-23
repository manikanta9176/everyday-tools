const NAMED_ZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export function timeZones() {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return [...new Set([local, ...NAMED_ZONES])];
}

export function detectTimestampUnit(value: number) {
  return Math.abs(value) >= 1e11 ? "milliseconds" : "seconds";
}

export function parseTimestamp(input: string, unit?: "seconds" | "milliseconds") {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a Unix timestamp or an ISO date.");
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) throw new Error("That number is not a usable timestamp.");
    const resolved = unit ?? detectTimestampUnit(numeric);
    const ms = resolved === "seconds" ? numeric * 1000 : numeric;
    return { date: new Date(ms), unit: resolved };
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) throw new Error("Use a Unix timestamp or a date such as 2026-10-23T04:50:00Z.");
  return { date, unit: "date" as const };
}

export function formatInstant(date: Date, timeZone: string) {
  if (Number.isNaN(date.getTime())) throw new Error("That date is invalid.");
  return {
    iso: date.toISOString(),
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
    zone: new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    }).format(date),
    relative: formatRelative(date),
  };
}

function formatRelative(date: Date) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  const [unit, size] = units.find(([, amount]) => Math.abs(seconds) >= amount) ?? ["second", 1];
  return formatter.format(Math.round(seconds / size), unit);
}

export function addCalendar(date: Date, amount: number, unit: "days" | "weeks" | "months" | "years") {
  const next = new Date(date.getTime());
  if (unit === "days") next.setUTCDate(next.getUTCDate() + amount);
  if (unit === "weeks") next.setUTCDate(next.getUTCDate() + amount * 7);
  if (unit === "months" || unit === "years") {
    const day = next.getUTCDate();
    next.setUTCDate(1);
    if (unit === "months") next.setUTCMonth(next.getUTCMonth() + amount);
    else next.setUTCFullYear(next.getUTCFullYear() + amount);
    const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
    next.setUTCDate(Math.min(day, lastDay));
  }
  return next;
}

export function dateDifference(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  const sign = ms < 0 ? -1 : 1;
  const absolute = Math.abs(ms);
  return {
    milliseconds: ms,
    seconds: ms / 1000,
    minutes: ms / 60000,
    hours: ms / 3600000,
    days: ms / 86400000,
    wholeDays: sign * Math.floor(absolute / 86400000),
  };
}

export function convertDuration(value: number, from: "ms" | "s" | "min" | "h" | "d") {
  const factors = { ms: 1, s: 1000, min: 60000, h: 3600000, d: 86400000 };
  const ms = value * factors[from];
  return {
    ms,
    s: ms / factors.s,
    min: ms / factors.min,
    h: ms / factors.h,
    d: ms / factors.d,
  };
}
