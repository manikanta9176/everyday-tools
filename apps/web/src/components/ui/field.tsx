"use client";

import { Input as UiInput } from "@tools/ui/components/input";
import { NativeSelect } from "@tools/ui/components/native-select";
import { Textarea } from "@tools/ui/components/textarea";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const control = "h-11 max-h-11 w-full self-start rounded-2xl bg-card";

export function Input({ className, ...props }: ComponentProps<typeof UiInput>) {
  return <UiInput className={cn(control, className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<typeof Textarea>) {
  return <Textarea className={cn("min-h-40 rounded-2xl bg-card", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<typeof NativeSelect>) {
  return <NativeSelect className={cn(control, className)} {...props} />;
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
