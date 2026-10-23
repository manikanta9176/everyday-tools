"use client";

import { Button as UiButton } from "@tools/ui/components/button";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "primary",
  secondary: "outline",
  ghost: "ghost",
  danger: "danger",
} as const;

const looks = {
  primary: "h-11 bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "h-11 border-border bg-card text-foreground hover:bg-muted",
  ghost: "hover:bg-muted",
  danger: "h-11 bg-destructive text-primary-foreground hover:bg-destructive/90",
} as const;

const sizes = {
  sm: "sm",
  md: "default",
  lg: "lg",
  icon: "icon",
} as const;

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: Omit<ComponentProps<typeof UiButton>, "variant" | "size"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return <UiButton variant={variants[variant]} size={sizes[size]} className={cn(looks[variant], className)} {...props} />;
}
