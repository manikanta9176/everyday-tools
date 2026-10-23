"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ToolIcon } from "@/components/icons";
import { CommandPalette } from "@/components/search/command-palette";
import { FavoriteButton } from "@/components/ui/feedback";
import { categories } from "@/lib/categories";
import { PREFS_EVENT, readFavorites, readRecent, toggleFavorite } from "@/lib/preferences";
import { searchTools } from "@/lib/search/search-tools";
import { toolIcons, tools } from "@/lib/tool-registry";
import type { ToolDefinition } from "@/lib/tool-types";

export function HomePage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const results = useMemo(() => (query.trim() ? searchTools(tools, query) : []), [query]);

  useEffect(() => {
    const sync = () => {
      setFavorites(readFavorites());
      setRecent(readRecent().map((item) => item.id));
    };
    sync();
    window.addEventListener(PREFS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREFS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const favoriteTools = favorites.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean) as ToolDefinition[];
  const recentTools = recent.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean) as ToolDefinition[];

  return (
    <div className="grid gap-14">
      <section className="grid min-h-[46vh] content-end gap-8">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-medium tracking-[-0.045em] text-quiet md:text-7xl">Small tools. Less busywork.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Tokens, JSON, color, images, and the other small jobs that interrupt real work. Everything here runs in your browser.
          </p>
        </div>
        <label className="grid max-w-xl gap-2 rounded-[28px] border bg-card p-3 shadow-[var(--shadow)]">
          <span className="sr-only">Search tools</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen(true);
              }
            }}
            placeholder="What do you need?"
            className="h-12 rounded-full border bg-muted/70 px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <span className="px-2 text-xs text-muted-foreground">⌘K from anywhere. Try format JSON, generate secret, or hex to RGB.</span>
        </label>
        {query.trim() ? (
          <div className="grid gap-2">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tools found. Try “compress photo”, “convert epoch”, or “format JSON”.</p>
            ) : (
              results.slice(0, 8).map((tool) => <ToolRow key={tool.id} tool={tool} favorite={favorites.includes(tool.id)} onFavorite={() => setFavorites(toggleFavorite(tool.id))} />)
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tools.filter((tool) => tool.quickAction).map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.slug}`} className="rounded-full border bg-card px-3 py-1.5 text-sm shadow-[var(--shadow)] hover:bg-muted">
                {tool.name}
              </Link>
            ))}
          </div>
        )}
      </section>
      {recentTools.length > 0 ? <ToolSection title="Recently used" tools={recentTools} favorites={favorites} onFavorite={(id) => setFavorites(toggleFavorite(id))} /> : null}
      {favoriteTools.length > 0 ? <ToolSection title="Favorites" tools={favoriteTools} favorites={favorites} onFavorite={(id) => setFavorites(toggleFavorite(id))} /> : null}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Popular tools</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {tools.filter((tool) => tool.featured).map((tool) => (
            <ToolRow key={tool.id} tool={tool} favorite={favorites.includes(tool.id)} onFavorite={() => setFavorites(toggleFavorite(tool.id))} />
          ))}
        </div>
      </section>
      <section className="grid gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Categories</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <article key={category.id} className="rounded-[24px] border bg-card p-5 shadow-[var(--shadow)]">
              <h3 className="font-medium">{category.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              <ul className="mt-3 grid gap-1 text-sm">
                {tools.filter((tool) => tool.category === category.id).slice(0, 4).map((tool) => (
                  <li key={tool.id}><Link href={`/tools/${tool.slug}`} className="hover:underline">{tool.name}</Link></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="max-w-xl rounded-[24px] border bg-card p-5 text-sm leading-6 shadow-[var(--shadow)]">
        <h2 className="font-medium">Private by default</h2>
        <p className="mt-1 text-muted-foreground">
          Pasted text, secrets, colors, images, and PDFs are processed on this device. The app does not upload them and does not keep an input history. Favorites store only the tool id.
        </p>
      </section>
      {open ? <CommandPalette key={query} open={open} onOpenChange={setOpen} initialQuery={query} /> : null}
    </div>
  );
}

function ToolSection({ title, tools: items, favorites, onFavorite }: { title: string; tools: ToolDefinition[]; favorites: string[]; onFavorite: (id: string) => void }) {
  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="mt-3 grid gap-2">
        {items.map((tool) => <ToolRow key={tool.id} tool={tool} favorite={favorites.includes(tool.id)} onFavorite={() => onFavorite(tool.id)} />)}
      </div>
    </section>
  );
}

function ToolRow({ tool, favorite, onFavorite }: { tool: ToolDefinition; favorite: boolean; onFavorite: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border bg-card px-3 py-3 shadow-[var(--shadow)]">
      <ToolIcon name={toolIcons[tool.slug] ?? "file"} className="size-4 text-signal" />
      <Link href={`/tools/${tool.slug}`} className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{tool.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{tool.description}</span>
      </Link>
      <FavoriteButton active={favorite} onToggle={onFavorite} label={tool.name} />
    </div>
  );
}
