import { CopyButton } from "@/components/ui/feedback";

export function OutputBlock({
  label = "Output",
  value,
  empty = "The result will show up here.",
}: {
  label?: string;
  value: string;
  empty?: string;
}) {
  return (
    <section className="grid gap-2" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{label}</h2>
        {value ? <CopyButton value={value} /> : null}
      </div>
      <pre key={value || "empty"} className="motion-in max-h-80 overflow-auto rounded-2xl bg-muted px-3 py-3 font-mono text-sm leading-6 wrap-break-word whitespace-pre-wrap">
        {value || <span className="text-muted-foreground">{empty}</span>}
      </pre>
    </section>
  );
}
