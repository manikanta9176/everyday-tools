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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@tools/ui/components/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tools/ui/components/dialog";
import { Kbd } from "@tools/ui/components/kbd";
import { Separator } from "@tools/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@tools/ui/components/sidebar";
import { TooltipProvider } from "@tools/ui/components/tooltip";

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
    <TooltipProvider>
      <SidebarProvider>
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-card focus:px-3 focus:py-2">
          Skip to content
        </a>
        <AppSidebar />
        <SidebarInset id="content">
          <header className="flex h-14 shrink-0 items-center gap-2 px-3 md:px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4" />
            <Link href="/" className="flex items-center gap-2 text-sm font-medium tracking-tight md:hidden">
              <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
              {SITE.name}
            </Link>
            <button
              type="button"
              data-ready={mounted ? "true" : "false"}
              onClick={() => setOpen(true)}
              className="ml-auto flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border bg-muted/70 px-3 text-left text-sm text-muted-foreground md:max-w-sm"
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
          <div className="flex min-w-0 flex-1 flex-col px-4 py-6 md:px-8 md:py-8">{children}</div>
          <footer className="px-4 py-5 text-sm text-muted-foreground md:px-8">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <span>Inputs stay in your browser.</span>
              <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy</Link>
              <Link href="/about" className="underline-offset-4 hover:underline">About</Link>
              <a href={SITE.github} className="underline-offset-4 hover:underline">GitHub</a>
              <a href={SITE.issues} className="underline-offset-4 hover:underline">Feedback</a>
            </div>
          </footer>
        </SidebarInset>
        <CommandPalette open={open} onOpenChange={setOpen} />
        <Dialog open={shortcuts} onOpenChange={setShortcuts}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Keyboard shortcuts</DialogTitle>
              <DialogDescription>These stay out of the way of normal typing.</DialogDescription>
            </DialogHeader>
            <ul className="grid gap-2 text-sm">
              <li className="flex justify-between gap-4"><span>Search tools</span><Kbd>⌘/Ctrl K</Kbd></li>
              <li className="flex justify-between gap-4"><span>Toggle sidebar</span><Kbd>⌘/Ctrl B</Kbd></li>
              <li className="flex justify-between gap-4"><span>Run the current tool</span><Kbd>⌘/Ctrl Enter</Kbd></li>
              <li className="flex justify-between gap-4"><span>Copy the current result</span><Kbd>⌘/Ctrl Shift C</Kbd></li>
              <li className="flex justify-between gap-4"><span>Close a dialog</span><Kbd>Esc</Kbd></li>
            </ul>
          </DialogContent>
        </Dialog>
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
}

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={SITE.name} render={<Link href="/" />}>
              <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
                <span className="size-1.5 rounded-full bg-signal" />
              </span>
              <span className="grid text-left leading-tight">
                <span className="truncate font-medium">{SITE.name}</span>
                <span className="truncate text-xs text-muted-foreground">{SITE.tagline}</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ToolNav pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <p className="px-3 text-xs leading-5 text-muted-foreground group-data-[collapsible=icon]:hidden">
          Inputs stay in this browser.
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function ToolNav({ pathname }: { pathname: string }) {
  const activeCategory = categories.find((category) =>
    toolsInCategory(category.id).some((tool) => pathname === `/tools/${tool.slug}`),
  )?.id;
  const [override, setOverride] = useState<{ path: string; id: CategoryId | null } | null>(null);
  const openId = override?.path === pathname ? override.id : (activeCategory ?? null);
  const { state, setOpen } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {categories.map((category) => {
          const Icon = categoryIcons[category.id];
          const open = openId === category.id;
          return (
            <Collapsible key={category.id} open={open} onOpenChange={(next) => setOverride({ path: pathname, id: next ? category.id : null })} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton
                      tooltip={category.name}
                      onClick={() => {
                        if (state === "collapsed") setOpen(true);
                      }}
                    />
                  }
                >
                  <Icon />
                  <span>{category.name}</span>
                  <ChevronDown className="ml-auto transition-transform group-data-open/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {toolsInCategory(category.id).map((tool) => {
                      const active = pathname === `/tools/${tool.slug}`;
                      return (
                        <SidebarMenuSubItem key={tool.id}>
                          <SidebarMenuSubButton isActive={active} render={<Link href={`/tools/${tool.slug}`} />}>
                            <ToolIcon name={toolIcons[tool.slug] ?? "file"} />
                            <span>{tool.name}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function isTyping(event: KeyboardEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}
