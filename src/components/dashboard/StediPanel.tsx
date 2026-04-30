import { useState } from "react";
import type { Patient } from "@/lib/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { triggerStediRun } from "@/lib/mondayWrite";
import { toast } from "sonner";
import { Play, Loader2 } from "lucide-react";

interface Props {
  patient: Patient;
  onRefresh: () => void;
}

const STEDI_FIELDS: { key: keyof Patient; label: string }[] = [
  { key: "stediEligibilityActive", label: "Eligibility Active?" },
  { key: "stediCoverageType", label: "Coverage Type" },
  { key: "stediPayerName", label: "Payer Name" },
  { key: "stediPlanName", label: "Plan Name" },
  { key: "stediMedicareAdvantage", label: "Medicare Advantage?" },
  { key: "stediMedicareAdvantageCarrier", label: "Medicare Advantage Carrier" },
  { key: "stediMedicareAdvantageMemberId", label: "Medicare Advantage Member ID" },
  { key: "stediQmb", label: "QMB?" },
  { key: "stediMedicareJurisdiction", label: "Medicare Jurisdiction" },
  { key: "stediMedicaidMltc", label: "Medicaid MLTC" },
  { key: "stediManagedMedicaid", label: "Managed Medicaid" },
  { key: "stediInNetwork", label: "In Network?" },
  { key: "stediPriorAuthRequired", label: "Prior Auth Required?" },
  { key: "stediCoinsurance", label: "Coinsurance %" },
  { key: "stediCopay", label: "Copay" },
  { key: "stediIndividualDeductible", label: "Individual Deductible" },
  { key: "stediIndividualDeductibleRemaining", label: "Individual Deductible Remaining" },
  { key: "stediFamilyDeductible", label: "Family Deductible" },
  { key: "stediFamilyDeductibleRemaining", label: "Family Deductible Remaining" },
  { key: "stediIndividualOopMax", label: "Individual OOP Max" },
  { key: "stediIndividualOopMaxRemaining", label: "Individual OOP Max Remaining" },
  { key: "stediFamilyOopMax", label: "Family OOP Max" },
  { key: "stediFamilyOopMaxRemaining", label: "Family OOP Max Remaining" },
  { key: "stediPlanBeginDate", label: "Plan Begin Date" },
  { key: "stediSecondaryMedicaidId", label: "Secondary / Medicaid ID" },
  { key: "stediErrorDescription", label: "Error Description" },
];

export function StediPanel({ patient, onRefresh }: Props) {
  const [running, setRunning] = useState(false);

  const handleRunStedi = async () => {
    setRunning(true);
    try {
      await triggerStediRun(patient.id);
      toast.success("Stedi eligibility check triggered");
      // Poll a few times to catch the results
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

  const eligStatus = patient.runStediEligibility;
  const isActive = patient.stediEligibilityActive?.toLowerCase() === "yes";

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Stedi Eligibility</CardTitle>
            {patient.stediEligibilityActive && (
              <Badge variant={isActive ? "default" : "destructive"} className={isActive ? "bg-green-600" : ""}>
                {isActive ? "Active" : patient.stediEligibilityActive}
              </Badge>
            )}
            {eligStatus && (
              <Badge variant="outline" className="text-xs">
                Last run: {eligStatus}
              </Badge>
            )}
          </div>
          <Button
            onClick={handleRunStedi}
            disabled={running}
            size="sm"
            className="gap-2 bg-gradient-primary shadow-elevate"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Running…" : "Run Stedi Check"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          {STEDI_FIELDS.map(({ key, label }) => {
            const value = patient[key] as string;
            if (!value && key !== "stediErrorDescription") return null;
            return (
              <div key={key} className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`text-sm font-medium text-right max-w-[60%] ${key === "stediErrorDescription" && value ? "text-red-500" : ""}`}>
                  {value || "—"}
                </span>
              </div>
            );
          })}
          {STEDI_FIELDS.every(({ key }) => !patient[key]) && (
            <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">
              No Stedi data yet. Click "Run Stedi Check" to fetch eligibility.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
