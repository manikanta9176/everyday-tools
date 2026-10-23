import { HomePage } from "@/components/home/home-page";
import { jsonLd } from "@/lib/metadata";
import { SITE } from "@/lib/site";

export default function Page() {
  return (
    <>
      <HomePage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            description: SITE.description,
            url: SITE.url,
            publisher: { "@type": "Person", name: "Manikanta", url: "https://manikanta.net" },
          }),
        }}
      />
    </>
  );
}
