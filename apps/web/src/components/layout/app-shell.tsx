"use client";

import {
  Binary,
  Braces,
  Calculator,
  ChevronDown,
  Clock,
  Code,
  FileText,
  Globe,
  Image,
  KeyRound,
  Menu,
  Moon,
  Palette,
  Search,
  Sparkles,
  Sun,
  Type,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ToolIcon } from "@/components/icons";
import { CommandPalette } from "@/components/search/command-palette";
import { categories, type CategoryId } from "@/lib/categories";
import { SITE } from "@/lib/site";
import { toolIcons, toolsInCategory } from "@/lib/tool-registry";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@tools/ui/components/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tools/ui/components/dialog";
import { Kbd } from "@tools/ui/components/kbd";

const categoryIcons: Record<CategoryId, ComponentType<{ className?: string }>> = {
  secrets: KeyRound,
  encoding: Binary,
  data: Braces,
  color: Palette,
  image: Image,
  text: Type,
  code: Code,
  time: Clock,
  math: Calculator,
  web: Globe,
  documents: FileText,
  generators: Sparkles,
};

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "?" && !isTyping(event)) setShortcuts(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-svh w-72 shrink-0 flex-col border-r border-border bg-card md:flex">
        <ToolNav pathname={pathname} />
      </aside>
      {mobile ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-foreground/30" aria-label="Close navigation" onClick={() => setMobile(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-card shadow-[var(--shadow)]">
            <ToolNav pathname={pathname} onNavigate={() => setMobile(false)} />
          </aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur md:px-5">
          <button type="button" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted md:hidden" aria-label="Open navigation" onClick={() => setMobile(true)}>
            <Menu className="size-4" />
          </button>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium tracking-tight">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
            {SITE.name}
          </Link>
          <button
            type="button"
            data-ready={mounted ? "true" : "false"}
            onClick={() => setOpen(true)}
            className="ml-auto flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-3 text-left text-sm text-muted-foreground md:max-w-sm"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search tools</span>
            <Kbd className="ml-auto hidden md:inline-flex">⌘K</Kbd>
          </button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted"
            aria-label="Toggle color theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button type="button" className="hidden h-10 rounded-full px-3 text-sm hover:bg-muted sm:inline-flex" onClick={() => setShortcuts(true)}>
            Shortcuts
          </button>
        </header>
        <main id="content" className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
        <footer className="border-t border-border px-4 py-5 text-sm text-muted-foreground md:px-8">
          <div className="mx-auto flex w-full max-w-4xl flex-wrap gap-x-4 gap-y-2">
            <span>Inputs stay in your browser.</span>
            <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy</Link>
            <Link href="/about" className="underline-offset-4 hover:underline">About</Link>
            <a href={SITE.github} className="underline-offset-4 hover:underline">GitHub</a>
            <a href={SITE.issues} className="underline-offset-4 hover:underline">Feedback</a>
          </div>
        </footer>
      </div>
      <CommandPalette open={open} onOpenChange={setOpen} />
      <Dialog open={shortcuts} onOpenChange={setShortcuts}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>These stay out of the way of normal typing.</DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2 text-sm">
            <li className="flex justify-between gap-4"><span>Search tools</span><Kbd>⌘/Ctrl K</Kbd></li>
            <li className="flex justify-between gap-4"><span>Run the current tool</span><Kbd>⌘/Ctrl Enter</Kbd></li>
            <li className="flex justify-between gap-4"><span>Copy the current result</span><Kbd>⌘/Ctrl Shift C</Kbd></li>
            <li className="flex justify-between gap-4"><span>Close a dialog</span><Kbd>Esc</Kbd></li>
          </ul>
        </DialogContent>
      </Dialog>
      <Toaster position="bottom-right" />
    </div>
  );
}

function ToolNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const activeCategory = categories.find((category) =>
    toolsInCategory(category.id).some((tool) => pathname === `/tools/${tool.slug}`),
  )?.id;
  const [override, setOverride] = useState<{ path: string; id: CategoryId | null } | null>(null);
  const openId = override?.path === pathname ? override.id : (activeCategory ?? "secrets");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
          <span className="size-1.5 rounded-full bg-signal" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{SITE.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{SITE.tagline}</span>
        </span>
      </div>
      <nav aria-label="Tools" className="flex-1 overflow-y-auto px-3 pb-4">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id];
          const open = openId === category.id;
          return (
            <Collapsible key={category.id} open={open} onOpenChange={(next) => setOverride({ path: pathname, id: next ? category.id : null })}>
              <CollapsibleTrigger className="flex h-9 w-full items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-muted">
                <Icon className="size-4 text-muted-foreground" />
                <span>{category.name}</span>
                <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-1 mb-2 grid gap-0.5 border-l border-border py-1 pl-3">
                  {toolsInCategory(category.id).map((tool) => {
                    const active = pathname === `/tools/${tool.slug}`;
                    return (
                      <li key={tool.id}>
                        <Link
                          href={`/tools/${tool.slug}`}
                          aria-current={active ? "page" : undefined}
                          onClick={onNavigate}
                          className={cn(
                            "flex h-8 items-center gap-2 rounded-full px-3 text-sm text-foreground/80 hover:bg-muted",
                            active && "bg-background font-medium text-foreground shadow-[var(--shadow)]",
                          )}
                        >
                          <ToolIcon name={toolIcons[tool.slug] ?? "file"} className={cn("size-4 shrink-0", active ? "text-signal" : "text-muted-foreground")} />
                          <span className="truncate">{tool.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
      <p className="px-4 py-3 text-xs leading-5 text-muted-foreground">Inputs stay in this browser.</p>
    </div>
  );
}

function isTyping(event: KeyboardEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}
