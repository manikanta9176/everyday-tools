import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "What Everyday Tools is for.",
};

export default function AboutPage() {
  return (
    <article className="grid max-w-2xl gap-4 text-sm leading-6">
      <h1 className="text-2xl font-semibold">About</h1>
      <p>{SITE.tagline} Everyday Tools is a set of small utilities for repeated work: secrets, encoding, structured data, color, images, text, time, and documents.</p>
      <p>Each ready tool performs its operation locally. Search uses the same registry as the sidebar, so a tool appears only when it works.</p>
      <p>The source is available on <a className="underline" href={SITE.github}>GitHub</a>.</p>
    </article>
  );
}
