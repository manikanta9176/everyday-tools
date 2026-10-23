"use client";

import { Button as UiButton } from "@tools/ui/components/button";
import type { ComponentProps } from "react";

const variants = {
  primary: "primary",
  secondary: "outline",
  ghost: "ghost",
  danger: "danger",
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
  ...props
}: Omit<ComponentProps<typeof UiButton>, "variant" | "size"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return <UiButton variant={variants[variant]} size={sizes[size]} {...props} />;
}
