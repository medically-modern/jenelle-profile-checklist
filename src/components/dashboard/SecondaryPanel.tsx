import type { Patient } from "@/lib/workflow";

interface Props {
  patient: Patient;
}

export function SecondaryPanel({ patient }: Props) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-card space-y-6">
      <div>
        <h2 className="text-base font-semibold">Tab 2</h2>
        <p className="text-xs text-muted-foreground">
          TODO: Add your second tab content here.
        </p>
      </div>

      <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          This is a placeholder for your second tab. Customize or remove as needed.
        </p>
      </div>
    </section>
  );
}
