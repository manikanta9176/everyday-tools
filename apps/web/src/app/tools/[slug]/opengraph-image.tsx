import { getTool } from "@/lib/tool-registry";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} tool`;
export const size = ogSize;
export const contentType = ogContentType;

export default async function ToolOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  return renderOgImage(tool?.name ?? SITE.name, tool?.description ?? SITE.description);
}
