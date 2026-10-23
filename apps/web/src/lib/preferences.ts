const FAVORITES_KEY = "everyday-tools:favorites";
const RECENT_KEY = "everyday-tools:recent";
export const PREFS_EVENT = "everyday-tools:prefs";

export type RecentTool = { id: string; at: number };

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(PREFS_EVENT));
}

export function readFavorites() {
  const value = readJson<unknown>(FAVORITES_KEY, []);
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function toggleFavorite(id: string) {
  const current = readFavorites();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  writeJson(FAVORITES_KEY, next);
  return next;
}

export function readRecent() {
  const value = readJson<unknown>(RECENT_KEY, []);
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is RecentTool =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "at" in item &&
        typeof item.id === "string" &&
        typeof item.at === "number",
    )
    .slice(0, 8);
}

export function rememberTool(id: string) {
  const next = [{ id, at: Date.now() }, ...readRecent().filter((item) => item.id !== id)].slice(
    0,
    8,
  );
  writeJson(RECENT_KEY, next);
  return next;
}
