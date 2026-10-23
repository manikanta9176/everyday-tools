import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="grid gap-3">
      <h1 className="text-2xl font-semibold">That page is not here</h1>
      <p className="text-sm text-muted-foreground">Try search, or go back to the catalog.</p>
      <Link href="/" className="text-sm underline">Back home</Link>
    </div>
  );
}
