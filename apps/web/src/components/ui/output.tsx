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
      <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-all rounded-lg border bg-card p-3 font-mono text-sm leading-6">
        {value || <span className="text-muted-foreground">{empty}</span>}
      </pre>
    </section>
  );
}
