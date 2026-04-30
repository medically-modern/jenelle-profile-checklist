import { useState } from "react";
import type { Patient } from "@/lib/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COL } from "@/lib/mondayApi";
import { writeStatus, writeTextField } from "@/lib/mondayWrite";
import {
  PRIMARY_INSURANCE_INDEX,
  GENERAL_INSURANCE_INDEX,
  SECONDARY_INSURANCE_INDEX,
} from "@/lib/mondayMapping";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  patient: Patient;
  onUpdate: (patch: Partial<Patient>) => void;
}

function useDebouncedWrite() {
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const write = async (key: string, fn: () => Promise<void>) => {
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

  return { saving, write };
}

export function InsurancePanel({ patient, onUpdate }: Props) {
  const { saving, write } = useDebouncedWrite();
  const [timers, setTimers] = useState<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleTextChange = (field: keyof Patient, colId: string, value: string) => {
    onUpdate({ [field]: value });
    // Debounce text writes — 800ms after user stops typing
    if (timers[field]) clearTimeout(timers[field]);
    const t = setTimeout(() => {
      write(field, () => writeTextField(patient.id, colId, value));
    }, 800);
    setTimers((prev) => ({ ...prev, [field]: t }));
  };

  const handleStatusChange = (
    field: keyof Patient,
    colId: string,
    label: string,
    indexMap: Record<string, number>,
  ) => {
    onUpdate({ [field]: label });
    write(field, () => writeStatus(patient.id, colId, label, indexMap));
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Insurance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Primary Insurance */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              Primary Insurance
              {saving.primaryInsurance && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </Label>
            <Select
              value={patient.primaryInsurance || undefined}
              onValueChange={(v) =>
                handleStatusChange("primaryInsurance", COL.primaryInsurance, v, PRIMARY_INSURANCE_INDEX)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select insurance…" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PRIMARY_INSURANCE_INDEX).map((label) => (
                  <SelectItem key={label} value={label}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* General Insurance */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              General Insurance
              {saving.generalInsurance && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </Label>
            <Select
              value={patient.generalInsurance || undefined}
              onValueChange={(v) =>
                handleStatusChange("generalInsurance", COL.generalInsurance, v, GENERAL_INSURANCE_INDEX)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select insurance…" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(GENERAL_INSURANCE_INDEX).map((label) => (
                  <SelectItem key={label} value={label}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Member ID 1 */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              Member ID 1
              {saving.memberId1 && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </Label>
            <Input
              value={patient.memberId1}
              onChange={(e) => handleTextChange("memberId1", COL.memberId1, e.target.value)}
              placeholder="Enter member ID…"
            />
          </div>

          {/* Member ID 2 */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              Member ID 2
              {saving.memberId2 && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </Label>
            <Input
              value={patient.memberId2}
              onChange={(e) => handleTextChange("memberId2", COL.memberId2, e.target.value)}
              placeholder="Enter member ID…"
            />
          </div>

          {/* Secondary Insurance */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              Secondary Insurance
              {saving.secondaryInsurance && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </Label>
            <Select
              value={patient.secondaryInsurance || undefined}
              onValueChange={(v) =>
                handleStatusChange("secondaryInsurance", COL.secondaryInsurance, v, SECONDARY_INSURANCE_INDEX)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(SECONDARY_INSURANCE_INDEX).map((label) => (
                  <SelectItem key={label} value={label}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
