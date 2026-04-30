import type { Patient } from "@/lib/workflow";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  patient: Patient;
  onCheckChange: (id: string, checked: boolean) => void;
  onNotesChange: (v: string) => void;
}

export function ChecklistPanel({ patient, onCheckChange, onNotesChange }: Props) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-card space-y-6">
      <div>
        <h2 className="text-base font-semibold">Checklist</h2>
        <p className="text-xs text-muted-foreground">
          TODO: Add your checklist items here.
        </p>
      </div>

      <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Define your checklist items in <code>src/lib/workflow.ts</code> and render them here.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Notes
        </label>
        <Textarea
          value={patient.notes ?? ""}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add notes..."
          className="min-h-[80px]"
        />
      </div>
    </section>
  );
}
