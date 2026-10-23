import { SITE } from "@/lib/site";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = `${SITE.name}. ${SITE.tagline}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOgImage(SITE.tagline, "Private utilities that run in your browser.");
}
