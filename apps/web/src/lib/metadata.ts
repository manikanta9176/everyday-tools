import type { Metadata } from "next";
import { SITE, siteUrl } from "@/lib/site";

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl()).toString();
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const pageTitle = title ?? `${SITE.name} · ${SITE.tagline}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: absoluteUrl(path),
      siteName: SITE.name,
      title: pageTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
    },
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
