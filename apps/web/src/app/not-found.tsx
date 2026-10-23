import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid gap-3">
      <h1 className="text-2xl font-semibold">That page is not here</h1>
      <p className="text-sm text-muted-foreground">Try search, or go back to the catalog.</p>
      <Link href="/" className="text-sm underline">Back home</Link>
    </div>
  );
}
