"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "cmdk";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ToolIcon } from "@/components/icons";
import { getCategory } from "@/lib/categories";
import { searchTools } from "@/lib/search/search-tools";
import { toolIcons, tools } from "@/lib/tool-registry";
import type { ToolDefinition } from "@/lib/tool-types";

export function CommandPalette({
  open,
  onOpenChange,
  initialQuery = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchTools(tools, query).slice(0, 30), [query]);

  function openTool(tool: ToolDefinition) {
    onOpenChange(false);
    router.push(`/tools/${tool.slug}`);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#141311]/25" />
        <Dialog.Content className="fixed top-[14vh] left-1/2 z-50 w-[min(640px,calc(100%-2rem))] -translate-x-1/2 rounded-[28px] border bg-card shadow-[var(--shadow)]">
          <Dialog.Title className="sr-only">Search tools</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search by tool name, alias, or task. Results stay on this device.
          </Dialog.Description>
          <Command shouldFilter={false} label="Tool search">
            <CommandInput
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search tools, like format JSON or generate secret"
              className="h-12 w-full border-b bg-transparent px-4 text-sm outline-none"
            />
            <CommandList className="max-h-80 overflow-auto p-2">
              <CommandEmpty className="px-3 py-8 text-center text-sm text-muted-foreground">
                No tools found. Try “format JSON”, “generate secret”, or “hex to RGB”.
              </CommandEmpty>
              {results.map((tool) => (
                <CommandItem
                  key={tool.id}
                  value={tool.slug}
                  onSelect={() => openTool(tool)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 aria-selected:bg-muted"
                >
                  <ToolIcon name={toolIcons[tool.slug] ?? "file"} className="size-4 text-signal" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{tool.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {getCategory(tool.category).name} · {tool.description}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
