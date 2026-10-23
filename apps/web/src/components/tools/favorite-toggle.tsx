"use client";

import { useEffect, useSyncExternalStore } from "react";
import { FavoriteButton } from "@/components/ui/feedback";
import { PREFS_EVENT, readFavorites, rememberTool, toggleFavorite } from "@/lib/preferences";

const emptyFavorites: string[] = [];
let cachedKey = "";
let cachedFavorites = emptyFavorites;

function subscribe(callback: () => void) {
  window.addEventListener(PREFS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PREFS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function favoriteSnapshot() {
  const next = readFavorites().join("\n");
  if (next !== cachedKey) {
    cachedKey = next;
    cachedFavorites = next ? next.split("\n") : emptyFavorites;
  }
  return cachedFavorites;
}

export function FavoriteToggle({ id, name }: { id: string; name: string }) {
  const favorites = useSyncExternalStore(subscribe, favoriteSnapshot, () => emptyFavorites);
  useEffect(() => {
    rememberTool(id);
  }, [id]);
  return (
    <FavoriteButton
      active={favorites.includes(id)}
      label={name}
      onToggle={() => toggleFavorite(id)}
    />
  );
}
