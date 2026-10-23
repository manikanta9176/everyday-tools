import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Everyday Tools",
    short_name: "Everyday",
    description: "Small tools. Less busywork. Private utilities that run in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#5b46c7",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
