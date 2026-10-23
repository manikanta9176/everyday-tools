"use client";

import { Check, ChevronDown } from "lucide-react";
import { Children, isValidElement, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

function readOptions(children: ReactNode): Option[] {
  const options: Option[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode }>(child)) return;
    if (child.type !== "option") return;
    const value = String(child.props.value ?? child.props.children ?? "");
    const label = child.props.children == null ? value : String(child.props.children);
    options.push({ value, label });
  });
  return options;
}

export function SelectMenu({
  id,
  value,
  onChange,
  children,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value?: string | number;
  onChange?: (event: { target: { value: string }; currentTarget: { value: string } }) => void;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const options = readOptions(children);
  const selected = String(value ?? "");
  const current = options.find((option) => option.value === selected);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: string) {
    onChange?.({ target: { value: next }, currentTarget: { value: next } });
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3.5 text-left text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring/40",
          className,
        )}
      >
        <span className="truncate">{current?.label ?? "Choose"}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="mt-2 max-h-64 overflow-auto rounded-2xl border border-border bg-card p-1 shadow-[var(--shadow)]"
          >
            {options.map((option) => {
              const active = option.value === selected;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(option.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-muted",
                      active && "bg-muted font-medium",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {active ? <Check className="size-4 shrink-0 text-signal" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
