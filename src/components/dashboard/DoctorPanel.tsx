import { useState } from "react";
import type { Patient } from "@/lib/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COL } from "@/lib/mondayApi";
import { writeStatus, writeTextField, writePhoneField, writeEmailField } from "@/lib/mondayWrite";
import { DOCTOR_STATUS_INDEX, CLINICALS_METHOD_INDEX } from "@/lib/mondayMapping";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  patient: Patient;
  onUpdate: (patch: Partial<Patient>) => void;
}

export function DoctorPanel({ patient, onUpdate }: Props) {
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [timers, setTimers] = useState<Record<string, ReturnType<typeof setTimeout>>>({});

  const doWrite = async (key: string, fn: () => Promise<void>) => {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      await fn();
    } catch (e) {
      toast.error(`Failed to save ${key}`, {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  const handleText = (field: keyof Patient, colId: string, value: string) => {
    onUpdate({ [field]: value });
    if (timers[field]) clearTimeout(timers[field]);
    const t = setTimeout(() => {
      doWrite(field, () => writeTextField(patient.id, colId, value));
    }, 800);
    setTimers((prev) => ({ ...prev, [field]: t }));
  };

  const handlePhone = (field: keyof Patient, colId: string, value: string) => {
    onUpdate({ [field]: value });
    if (timers[field]) clearTimeout(timers[field]);
    const t = setTimeout(() => {
      doWrite(field, () => writePhoneField(patient.id, colId, value));
    }, 800);
    setTimers((prev) => ({ ...prev, [field]: t }));
  };

  const handleEmail = (field: keyof Patient, colId: string, value: string) => {
    onUpdate({ [field]: value });
    if (timers[field]) clearTimeout(timers[field]);
    const t = setTimeout(() => {
      doWrite(field, () => writeEmailField(patient.id, colId, value));
    }, 800);
    setTimers((prev) => ({ ...prev, [field]: t }));
  };

  const handleStatus = (
    field: keyof Patient,
    colId: string,
    label: string,
    indexMap: Record<string, number>,
  ) => {
    onUpdate({ [field]: label });
    doWrite(field, () => writeStatus(patient.id, colId, label, indexMap));
  };

  const Spinner = ({ field }: { field: string }) =>
    saving[field] ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> : null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Doctor Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Doctor Status */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">Doctor Status <Spinner field="doctorStatus" /></Label>
            <Select
              value={patient.doctorStatus || undefined}
              onValueChange={(v) => handleStatus("doctorStatus", COL.doctorStatus, v, DOCTOR_STATUS_INDEX)}
            >
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {Object.keys(DOCTOR_STATUS_INDEX).map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clinicals Method */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">Clinicals Method <Spinner field="clinicalsMethod" /></Label>
            <Select
              value={patient.clinicalsMethod || undefined}
              onValueChange={(v) => handleStatus("clinicalsMethod", COL.clinicalsMethod, v, CLINICALS_METHOD_INDEX)}
            >
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {Object.keys(CLINICALS_METHOD_INDEX).map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor Name */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">Doctor Name <Spinner field="doctorName" /></Label>
            <Input
              value={patient.doctorName}
              onChange={(e) => handleText("doctorName", COL.doctorName, e.target.value)}
              placeholder="Dr. Name"
            />
          </div>

          {/* Doctor NPI */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">Doctor NPI <Spinner field="doctorNpi" /></Label>
            <Input
              value={patient.doctorNpi}
              onChange={(e) => handleText("doctorNpi", COL.doctorNpi, e.target.value)}
              placeholder="NPI number"
            />
          </div>

          {/* Doctor Phone */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">Doctor Phone <Spinner field="doctorPhone" /></Label>
            <Input
              value={patient.doctorPhone}
              onChange={(e) => handlePhone("doctorPhone", COL.doctorPhone, e.target.value)}
              placeholder="Phone number"
            />
          </div>

          {/* Doctor Email */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">Doctor Email <Spinner field="doctorEmail" /></Label>
            <Input
              type="email"
              value={patient.doctorEmail}
              onChange={(e) => handleEmail("doctorEmail", COL.doctorEmail, e.target.value)}
              placeholder="doctor@clinic.com"
            />
          </div>

          {/* Doctor Fax */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">Doctor Fax (@rcfax) <Spinner field="doctorFax" /></Label>
            <Input
              type="email"
              value={patient.doctorFax}
              onChange={(e) => handleEmail("doctorFax", COL.doctorFax, e.target.value)}
              placeholder="fax@rcfax.com"
            />
          </div>

          {/* Clinic Name (read-only — dropdown from Monday) */}
          <div className="space-y-1.5">
            <Label>Clinic Name</Label>
            <Input value={patient.clinicName} readOnly className="bg-muted/50" />
          </div>

          {/* Clinic Address (read-only — location) */}
          <div className="space-y-1.5 md:col-span-2">
            <Label>Clinic Address</Label>
            <Input value={patient.clinicAddress} readOnly className="bg-muted/50" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
