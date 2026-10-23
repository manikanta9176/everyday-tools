"use client";

import { Calendar } from "@tools/ui/components/calendar";
import { Input as UiInput } from "@tools/ui/components/input";
import { Slider } from "@tools/ui/components/slider";
import { Textarea } from "@tools/ui/components/textarea";
import { CalendarDays } from "lucide-react";
import { useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SelectMenu } from "@/components/ui/select-menu";

const control = "h-11 max-h-11 w-full self-start rounded-2xl bg-card";

export function Input({ className, type, value, onChange, id, ...props }: ComponentProps<typeof UiInput>) {
  if (type === "date") {
    return (
      <DateControl
        id={id}
        value={String(value ?? "")}
        className={className}
        onChange={(next) => onChange?.({ target: { value: next }, currentTarget: { value: next } } as never)}
      />
    );
  }
  return <UiInput id={id} type={type} value={value} onChange={onChange} className={cn(control, className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<typeof Textarea>) {
  return <Textarea className={cn("min-h-40 rounded-2xl bg-card", className)} {...props} />;
}

export function Select(props: ComponentProps<typeof SelectMenu>) {
  return <SelectMenu {...props} />;
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function DateControl({
  id,
  value,
  onChange,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  return (
    <div className="relative w-full">
      <button
        id={id}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(control, "flex items-center justify-between px-3.5 text-left text-sm", className)}
      >
        <span>{selected ? selected.toLocaleDateString() : "Choose a date"}</span>
        <CalendarDays className="size-4 text-muted-foreground" />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="mt-2 rounded-2xl border border-border bg-card shadow-[var(--shadow)]">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (!date) return;
                onChange(formatIsoDate(date));
                setOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RangeControl({
  id,
  value,
  min,
  max,
  step,
  onValueChange,
}: {
  id?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <Slider
      id={id}
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={(next) => {
        const incoming = Array.isArray(next) ? next[0] : next;
        if (typeof incoming === "number") onValueChange(incoming);
      }}
    />
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid content-start items-start gap-1.5 self-start">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
