export const SITE = {
  name: "Tools",
  tagline: "Small tools. Less busywork.",
  description: "Private utilities for everyday work. Processing stays in your browser.",
  url: "https://tools.manikanta.net",
  github: "https://github.com/manikanta9176/everyday-tools",
  issues: "https://github.com/manikanta9176/everyday-tools/issues",
} as const;

export function siteUrl(): URL {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (value) {
    try {
      return new URL(value);
    } catch {
      return new URL(SITE.url);
    }
  }
  return new URL(SITE.url);
}
