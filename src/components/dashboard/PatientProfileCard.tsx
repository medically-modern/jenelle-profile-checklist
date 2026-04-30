import type { Patient } from "@/lib/workflow";
import { CalendarDays, User, Phone, Mail, Heart } from "lucide-react";

interface Props {
  patient: Patient;
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-sm font-medium truncate" title={value || "—"}>{value || "—"}</p>
      </div>
    </div>
  );
}

export function PatientProfileCard({ patient }: Props) {
  return (
    <div className="rounded-xl bg-card border shadow-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Patient Profile</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Field icon={<User className="h-4 w-4" />} label="Name" value={patient.name} />
        <Field icon={<CalendarDays className="h-4 w-4" />} label="DOB" value={patient.dob} />
        <Field icon={<Phone className="h-4 w-4" />} label="Phone" value={patient.ptPhone} />
        <Field icon={<Mail className="h-4 w-4" />} label="Email" value={patient.email} />
        <Field icon={<Heart className="h-4 w-4" />} label="Gender" value={patient.gender} />
      </div>
    </div>
  );
}
