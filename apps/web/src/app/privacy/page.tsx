import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Tools handles text, files, and preferences.",
};

export default function PrivacyPage() {
  return (
    <article className="prose-width grid max-w-2xl gap-4 text-sm leading-6">
      <h1 className="text-2xl font-semibold">Privacy</h1>
      <p>Tools processes tool input in your browser. There is no account, and the application has no API that receives pasted text, secrets, images, or documents.</p>
      <p>Favorites and recently opened tools are saved in local storage as tool identifiers and timestamps. Color chips you keep in Color Studio are also stored only on this device. Inputs and generated secrets are not written to the URL.</p>
      <p>The site loads its own pages and assets. It does not include analytics. A service worker is not registered, so private results are not cached for offline reuse.</p>
      <p>Your browser, extensions, and the host serving this static site can still see that you opened the application. They do not receive the contents of a tool through Tools.</p>
    </article>
  );
}
