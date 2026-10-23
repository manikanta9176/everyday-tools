import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolWorkspace } from "@/features/tools/ui/tool-host";
import { getCategory } from "@/lib/categories";
import { getTool, tools } from "@/lib/tool-registry";
import { FavoriteToggle } from "@/components/tools/favorite-toggle";

export const instant = false;

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool not found" };
  return {
    title: tool.name,
    description: tool.description,
    openGraph: { title: tool.name, description: tool.description },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const related = tool.related.map((id) => getTool(id)).filter((item) => item !== undefined);

  return (
    <article className="grid gap-6">
      <header className="grid gap-3">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>{getCategory(tool.category).name}</span>
        </nav>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{tool.name}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{tool.description}</p>
          </div>
          <FavoriteToggle id={tool.id} name={tool.name} />
        </div>
        <p className="text-xs text-muted-foreground">Processed locally in your browser. Nothing you enter is uploaded.</p>
      </header>
      <ToolWorkspace slug={tool.slug} category={tool.category} />
      {tool.limitations?.length ? (
        <section className="text-sm text-muted-foreground">
          <h2 className="font-medium text-foreground">Limitations</h2>
          <ul className="mt-2 list-disc pl-5">{tool.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ) : null}
      {related.length ? (
        <section>
          <h2 className="text-sm font-medium">Related tools</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.id}><Link href={`/tools/${item.slug}`} className="rounded-full border bg-card px-3 py-1 text-sm hover:bg-muted">{item.name}</Link></li>
            ))}
          </ul>
        </section>
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: tool.name,
            description: tool.description,
            applicationCategory: "UtilitiesApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </article>
  );
}
