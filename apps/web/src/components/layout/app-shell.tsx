"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, Moon, PanelLeft, Search, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ToolIcon } from "@/components/icons";
import { CommandPalette } from "@/components/search/command-palette";
import { categories } from "@/lib/categories";
import { SITE } from "@/lib/site";
import { toolIcons, toolsInCategory } from "@/lib/tool-registry";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
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
    <div className="flex min-h-screen flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur md:px-4">
        <button type="button" className="inline-flex size-10 items-center justify-center rounded-md hover:bg-muted md:hidden" aria-label="Open navigation" onClick={() => setMobile(true)}>
          <Menu className="size-4" />
        </button>
        <button type="button" className="hidden size-10 items-center justify-center rounded-md hover:bg-muted md:inline-flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((value) => !value)}>
          <PanelLeft className="size-4" />
        </button>
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-accent text-xs text-accent-foreground">T</span>
          <span className="hidden sm:inline">{SITE.name}</span>
        </Link>
        <button type="button" data-ready={mounted ? "true" : "false"} onClick={() => setOpen(true)} className="ml-auto flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border bg-card px-3 text-left text-sm text-muted-foreground md:mx-6 md:max-w-xl">
          <Search className="size-4 shrink-0" />
          <span className="truncate">Search tools</span>
          <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[11px] md:inline">⌘K</kbd>
        </button>
        <button type="button" className="inline-flex size-10 items-center justify-center rounded-md hover:bg-muted" aria-label="Toggle color theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
          {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button type="button" className="hidden h-10 rounded-md px-2 text-sm hover:bg-muted sm:inline-flex" onClick={() => setShortcuts(true)}>
          Shortcuts
        </button>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className={cn("sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto border-r bg-sidebar md:block", collapsed ? "w-16" : "w-60")}>
          <Nav collapsed={collapsed} pathname={pathname} />
        </aside>
        <div className="min-w-0 flex-1">
          <main id="content" className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8">
            {children}
          </main>
          <footer className="border-t px-4 py-6 text-sm text-muted-foreground md:px-8">
            <div className="mx-auto flex max-w-5xl flex-wrap gap-x-4 gap-y-2">
              <span>Inputs stay in your browser.</span>
              <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy</Link>
              <Link href="/about" className="underline-offset-4 hover:underline">About</Link>
              <a href={SITE.github} className="underline-offset-4 hover:underline">GitHub</a>
              <a href={SITE.issues} className="underline-offset-4 hover:underline">Feedback</a>
            </div>
          </footer>
        </div>
      </div>
      <CommandPalette open={open} onOpenChange={setOpen} />
      <Dialog.Root open={mobile} onOpenChange={setMobile}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30 md:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r bg-sidebar p-3 md:hidden" aria-describedby={undefined}>
            <Dialog.Title className="px-2 py-2 text-sm font-semibold">Tools</Dialog.Title>
            <div onClick={() => setMobile(false)}>
              <Nav collapsed={false} pathname={pathname} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={shortcuts} onOpenChange={setShortcuts}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30" />
          <Dialog.Content className="fixed top-[20vh] left-1/2 z-50 w-[min(420px,calc(100%-2rem))] -translate-x-1/2 rounded-xl border bg-card p-5">
            <Dialog.Title className="text-lg font-semibold">Keyboard shortcuts</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">These stay out of the way of normal typing.</Dialog.Description>
            <ul className="mt-4 grid gap-2 text-sm">
              <li className="flex justify-between gap-4"><span>Search tools</span><kbd>⌘/Ctrl K</kbd></li>
              <li className="flex justify-between gap-4"><span>Run the current tool</span><kbd>⌘/Ctrl Enter</kbd></li>
              <li className="flex justify-between gap-4"><span>Copy the current result</span><kbd>⌘/Ctrl Shift C</kbd></li>
              <li className="flex justify-between gap-4"><span>Close a dialog</span><kbd>Esc</kbd></li>
            </ul>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Toaster position="bottom-right" />
    </div>
  );
}

function Nav({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  return (
    <nav aria-label="Tools" className="grid gap-4 p-3">
      {categories.map((category) => (
        <div key={category.id}>
          {!collapsed ? <p className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{category.name}</p> : null}
          <ul className="grid gap-0.5">
            {toolsInCategory(category.id).map((item) => {
              const active = pathname === `/tools/${item.slug}`;
              return (
                <li key={item.id}>
                  <Link href={`/tools/${item.slug}`} title={item.name} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted", active && "bg-accent-soft font-medium")}>
                    <ToolIcon name={toolIcons[item.slug] ?? "file"} className="size-4 shrink-0" />
                    {!collapsed ? <span className="truncate">{item.name}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function isTyping(event: KeyboardEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}
