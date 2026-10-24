"use client";

import * as Switch from "@radix-ui/react-switch";
import * as Tabs from "@radix-ui/react-tabs";
import { Check, CircleAlert, Copy, Star } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "accent" && "bg-accent-soft text-foreground",
        tone === "success" && "bg-muted text-success",
        tone === "danger" && "bg-danger-soft text-danger",
      )}
    >
      {children}
    </span>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="motion-in flex items-start gap-2.5 rounded-2xl border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm text-danger">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <p className="leading-5">{message}</p>
    </div>
  );
}

export function EmptyNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed px-4 py-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border bg-card px-3 text-xs font-medium transition-colors duration-200 hover:bg-muted",
        className,
      )}
      onClick={async () => {
        try {
          await copyText(value);
          setCopied(true);
          toast.success("Copied");
          window.setTimeout(() => setCopied(false), 1200);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not copy");
        }
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function Toggle({
  checked,
  onCheckedChange,
  label,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative h-6 w-11 shrink-0 rounded-full bg-muted transition-colors duration-200 data-[state=checked]:bg-primary"
      >
        <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-card shadow transition-transform duration-200 ease-out data-[state=checked]:translate-x-5" />
      </Switch.Root>
    </label>
  );
}

export function FavoriteButton({
  active,
  onToggle,
  label,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      onClick={onToggle}
      className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
    >
      <Star className={cn("size-4 text-muted-foreground transition-colors duration-200", active && "fill-star text-star")} />
    </button>
  );
}

export function PanelTabs({
  value,
  onValueChange,
  tabs,
}: {
  value: string;
  onValueChange: (value: string) => void;
  tabs: { id: string; label: string; content: ReactNode }[];
}) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange}>
      <Tabs.List className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.id} value={tab.id} className="mt-4">
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
