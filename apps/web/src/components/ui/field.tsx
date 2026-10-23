import { Input } from "@tools/ui/components/input";
import { NativeSelect } from "@tools/ui/components/native-select";
import { Textarea } from "@tools/ui/components/textarea";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export { Input };

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}

export function TextArea(props: ComponentProps<typeof Textarea>) {
  return <Textarea {...props} />;
}

export function Select(props: ComponentProps<typeof NativeSelect>) {
  return <NativeSelect {...props} />;
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
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
