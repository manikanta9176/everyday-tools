import { pageMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description: "What Tools is for, and how the private utilities on tools.manikanta.net work.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="grid max-w-2xl gap-4 text-sm leading-6">
      <h1 className="text-2xl font-semibold">About</h1>
      <p>{SITE.tagline} Tools is a set of small utilities for repeated work: secrets, encoding, structured data, color, images, text, time, and documents. It lives at {SITE.url}.</p>
      <p>Each ready tool performs its operation locally. Search uses the same registry as the sidebar, so a tool appears only when it works.</p>
      <p>The source is available on <a className="underline" href={SITE.github}>GitHub</a>.</p>
    </article>
  );
}
