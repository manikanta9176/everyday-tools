import type { MetadataRoute } from "next";
import { tools } from "@/lib/tool-registry";
import { absoluteUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.4, changeFrequency: "monthly" as const },
    ...tools.map((tool) => ({
      path: `/tools/${tool.slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
  ];
  return pages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
