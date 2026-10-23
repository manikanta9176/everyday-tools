export const SITE = {
  name: "Everyday Tools",
  tagline: "Small tools. Less busywork.",
  description: "Private utilities for everyday work. Processing stays in your browser.",
  github: "https://github.com/manikanta9176/everyday-tools",
  issues: "https://github.com/manikanta9176/everyday-tools/issues",
} as const;

export function siteUrl(): URL | undefined {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}
