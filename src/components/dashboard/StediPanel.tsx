import { useState } from "react";
import type { Patient } from "@/lib/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { triggerStediRun } from "@/lib/mondayWrite";
import {
  GENERAL_INSURANCE_INDEX,
  PRIMARY_INSURANCE_INDEX,
  SECONDARY_INSURANCE_INDEX,
} from "@/lib/mondayMapping";
import { toast } from "sonner";
import { Play, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  patient: Patient;
  onRefresh: () => void;
  onUpdate: (patch: Partial<Patient>) => void;
}

// Fields always shown after Stedi run
const ALWAYS_FIELDS: { key: keyof Patient; label: string }[] = [
  { key: "stediEligibilityActive", label: "Active?" },
  { key: "stediCoverageType", label: "Coverage Type" },
  { key: "stediPayerName", label: "Payer Name" },
  { key: "stediPlanName", label: "Plan Name" },
  { key: "stediInNetwork", label: "In Network?" },
  { key: "stediPriorAuthRequired", label: "Prior Auth Required?" },
  { key: "stediPlanBeginDate", label: "Plan Begin Date" },
  { key: "stediErrorDescription", label: "Error Description" },
];

// Medicare-only fields
const MEDICARE_FIELDS: { key: keyof Patient; label: string }[] = [
  { key: "stediMedicareAdvantage", label: "Medicare Advantage?" },
  { key: "stediMedicareAdvantageCarrier", label: "Medicare Advantage Carrier" },
  { key: "stediMedicareJurisdiction", label: "Medicare Jurisdiction" },
  { key: "stediQmb", label: "QMB?" },
  { key: "stediSecondaryMedicaidId", label: "Medicaid ID" },
];

// Medicaid-only fields
const MEDICAID_FIELDS: { key: keyof Patient; label: string }[] = [
  { key: "stediManagedMedicaid", label: "Managed Medicaid" },
  { key: "stediMedicaidMltc", label: "MLTC" },
  { key: "stediSecondaryMedicaidId", label: "Medicaid ID" },
];

function ResultRow({ label, value, isError }: { label: string; value: string; isError?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium text-right max-w-[60%] ${isError ? "text-red-500" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export function StediPanel({ patient, onRefresh, onUpdate }: Props) {
  const [running, setRunning] = useState(false);

  const generalIns = patient.generalInsurance;
  const isMedicare = generalIns === "Medicare A&B";
  const isMedicaid = generalIns === "Medicaid";

  // Prerequisites for Run Stedi button
  const canRunStedi = !!(
    patient.name.trim() &&
    patient.dob.trim() &&
    patient.generalInsurance &&
    patient.memberId1.trim()
  );

  const hasStediData = ALWAYS_FIELDS.some(({ key }) => !!(patient[key] as string));

  const handleRunStedi = async () => {
    setRunning(true);
    try {
      await triggerStediRun(patient.id);
      toast.success("Stedi eligibility check triggered");
      // Poll for results
      setTimeout(onRefresh, 3000);
      setTimeout(onRefresh, 8000);
      setTimeout(onRefresh, 15000);
    } catch (e) {
      toast.error("Failed to trigger Stedi run", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setRunning(false);
    }
  };

  const isActive = patient.stediEligibilityActive?.toLowerCase() === "yes";

  return (
    <div className="space-y-5">
      {/* Step A: Insurance Input + Run Stedi */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Insurance & Eligibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* General Insurance + Member IDs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label>General Insurance <span className="text-red-400">*</span></Label>
              <Select
                value={patient.generalInsurance || undefined}
                onValueChange={(v) => onUpdate({ generalInsurance: v })}
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

            <div className="space-y-1.5">
              <Label>Member ID 1 <span className="text-red-400">*</span></Label>
              <Input
                value={patient.memberId1}
                onChange={(e) => onUpdate({ memberId1: e.target.value })}
                placeholder="Enter member ID…"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Member ID 2</Label>
              <Input
                value={patient.memberId2}
                onChange={(e) => onUpdate({ memberId2: e.target.value })}
                placeholder="Enter member ID…"
              />
            </div>
          </div>

          {/* Run Stedi Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRunStedi}
              disabled={running || !canRunStedi}
              className="gap-2 bg-gradient-primary shadow-elevate"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Running…" : "Run Stedi Check"}
            </Button>
            {!canRunStedi && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Fill in Name, DOB, General Insurance, and Member ID 1 first
              </p>
            )}
            {hasStediData && patient.stediEligibilityActive && (
              <Badge variant={isActive ? "default" : "destructive"} className={isActive ? "bg-green-600" : ""}>
                {isActive ? "Active" : patient.stediEligibilityActive}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step B: Stedi Results (only show if we have data) */}
      {hasStediData && (
        <>
          {/* Always-show results */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Eligibility Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {ALWAYS_FIELDS.map(({ key, label }) => (
                  <ResultRow
                    key={key}
                    label={label}
                    value={patient[key] as string}
                    isError={key === "stediErrorDescription"}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medicare-only fields */}
          {isMedicare && (
            <Card className="shadow-card border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Medicare Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  {MEDICARE_FIELDS.map(({ key, label }) => (
                    <ResultRow key={key} label={label} value={patient[key] as string} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medicaid-only fields */}
          {isMedicaid && (
            <Card className="shadow-card border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Medicaid Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  {MEDICAID_FIELDS.map(({ key, label }) => (
                    <ResultRow key={key} label={label} value={patient[key] as string} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Sharing section */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cost Sharing</CardTitle>
              <p className="text-xs text-muted-foreground">
                Edit the working values below. They default to the individual amounts — adjust if family values are more relevant.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Editable working values */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Co-insurance %</Label>
                  <Input
                    value={patient.workingCoinsurance || patient.stediCoinsurance}
                    onChange={(e) => onUpdate({ workingCoinsurance: e.target.value })}
                    placeholder="—"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Co-pay</Label>
                  <Input
                    value={patient.stediCopay}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Deductible</Label>
                  <Input
                    value={patient.workingDeductible || patient.stediIndividualDeductible}
                    onChange={(e) => onUpdate({ workingDeductible: e.target.value })}
                    placeholder="—"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Deductible Remaining</Label>
                  <Input
                    value={patient.workingDeductibleRemaining || patient.stediIndividualDeductibleRemaining}
                    onChange={(e) => onUpdate({ workingDeductibleRemaining: e.target.value })}
                    placeholder="—"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>OOP Max</Label>
                  <Input
                    value={patient.workingOopMax || patient.stediIndividualOopMax}
                    onChange={(e) => onUpdate({ workingOopMax: e.target.value })}
                    placeholder="—"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>OOP Max Remaining</Label>
                  <Input
                    value={patient.workingOopMaxRemaining || patient.stediIndividualOopMaxRemaining}
                    onChange={(e) => onUpdate({ workingOopMaxRemaining: e.target.value })}
                    placeholder="—"
                  />
                </div>
              </div>

              {/* Reference: Individual vs Family (read-only) */}
              <details className="group">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Show individual &amp; family breakdown
                </summary>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  <div className="font-medium text-xs uppercase tracking-wider text-muted-foreground pt-2 col-span-full">Individual</div>
                  <ResultRow label="Deductible" value={patient.stediIndividualDeductible} />
                  <ResultRow label="Deductible Remaining" value={patient.stediIndividualDeductibleRemaining} />
                  <ResultRow label="OOP Max" value={patient.stediIndividualOopMax} />
                  <ResultRow label="OOP Max Remaining" value={patient.stediIndividualOopMaxRemaining} />

                  <div className="font-medium text-xs uppercase tracking-wider text-muted-foreground pt-2 col-span-full">Family</div>
                  <ResultRow label="Deductible" value={patient.stediFamilyDeductible} />
                  <ResultRow label="Deductible Remaining" value={patient.stediFamilyDeductibleRemaining} />
                  <ResultRow label="OOP Max" value={patient.stediFamilyOopMax} />
                  <ResultRow label="OOP Max Remaining" value={patient.stediFamilyOopMaxRemaining} />
                </div>
              </details>
            </CardContent>
          </Card>
        </>
      )}

      {/* Step C: Primary + Secondary Insurance */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Primary &amp; Secondary Insurance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Primary Insurance</Label>
              <Select
                value={patient.primaryInsurance || undefined}
                onValueChange={(v) => onUpdate({ primaryInsurance: v })}
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

            <div className="space-y-1.5">
              <Label>Secondary Insurance</Label>
              <Select
                value={patient.secondaryInsurance || undefined}
                onValueChange={(v) => onUpdate({ secondaryInsurance: v })}
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
    </div>
  );
}
