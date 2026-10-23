import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: `${SITE.tagline} Private utilities that run in your browser.`,
    id: "/",
    start_url: "/",
    scope: "/",
    lang: "en",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#5b46c7",
    categories: ["utilities", "productivity", "developer"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
