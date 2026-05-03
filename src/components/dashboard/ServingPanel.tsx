import { useEffect } from "react";
import type { Patient } from "@/lib/workflow";
import { canCrossSellCgm, deriveServing } from "@/lib/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  REFERRAL_TYPE_INDEX, REFERRAL_SOURCE_INDEX,
  REQUEST_TYPE_INDEX, SERVING_INDEX, PUMP_TYPE_INDEX,
  CGM_TYPE_INDEX, CGM_CROSS_SELL_INDEX,
  INSULIN_PUMP_COVERAGE_PATH_INDEX, CGM_COVERAGE_PATH_INDEX,
} from "@/lib/mondayMapping";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  patient: Patient;
  onUpdate: (patch: Partial<Patient>) => void;
}

interface StatusFieldConfig {
  field: keyof Patient;
  label: string;
  indexMap: Record<string, number>;
}

function StatusSelect({ value, config, onChange }: {
  value: string; config: StatusFieldConfig; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{config.label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
        <SelectContent>
          {Object.keys(config.indexMap).map((l) => (
            <SelectItem key={l} value={l}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ServingPanel({ patient, onUpdate }: Props) {
  const crossSellStatus = patient.cgmCrossSell;
  const primaryIns = patient.primaryInsurance;
  const requestType = patient.requestType;

  // Auto-evaluate cross-sell when primary insurance changes
  useEffect(() => {
    if (crossSellStatus !== "Evaluate" || !primaryIns) return;
    const eligible = canCrossSellCgm(primaryIns);
    if (eligible) {
      onUpdate({
        cgmCrossSell: "Cross-Sell",
        cgmType: "Dexcom G7",
        // cgmCoveragePath left blank — user must pick Insulin or Hypoglycemia
      });
    } else {
      onUpdate({
        cgmCrossSell: "Couldn't Cross-Sell",
        cgmType: "Not Serving",
        cgmCoveragePath: "Not Serving",
      });
    }
  }, [primaryIns]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-derive Serving from cross-sell + request type
  useEffect(() => {
    if (!crossSellStatus || !requestType) return;
    const derived = deriveServing(crossSellStatus, requestType);
    if (derived && derived !== patient.serving) {
      onUpdate({ serving: derived });
    }
  }, [crossSellStatus, requestType]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCrossSellEligible = crossSellStatus === "Cross-Sell";
  const needsCgmCoveragePath = isCrossSellEligible && !patient.cgmCoveragePath;

  return (
    <div className="space-y-5">
      {/* Section 1: Referral */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Referral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StatusSelect
              value={patient.referralType}
              config={{ field: "referralType", label: "Referral Type", indexMap: REFERRAL_TYPE_INDEX }}
              onChange={(v) => onUpdate({ referralType: v })}
            />
            <StatusSelect
              value={patient.referralSource}
              config={{ field: "referralSource", label: "Referral Source", indexMap: REFERRAL_SOURCE_INDEX }}
              onChange={(v) => onUpdate({ referralSource: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: CGM Cross-Sell */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">CGM Cross-Sell</CardTitle>
            {crossSellStatus && (
              <Badge
                variant="outline"
                className={
                  crossSellStatus === "Cross-Sell"
                    ? "border-green-400 bg-green-50 text-green-700"
                    : crossSellStatus === "Couldn't Cross-Sell"
                      ? "border-red-400 bg-red-50 text-red-700"
                      : crossSellStatus === "Already Serving CGM"
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-amber-400 bg-amber-50 text-amber-700"
                }
              >
                {crossSellStatus === "Cross-Sell" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {crossSellStatus === "Couldn't Cross-Sell" && <XCircle className="h-3 w-3 mr-1" />}
                {crossSellStatus === "Evaluate" && <AlertTriangle className="h-3 w-3 mr-1" />}
                {crossSellStatus}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
            <StatusSelect
              value={patient.cgmCrossSell}
              config={{ field: "cgmCrossSell", label: "Cross-Sell Status", indexMap: CGM_CROSS_SELL_INDEX }}
              onChange={(v) => onUpdate({ cgmCrossSell: v })}
            />

            {/* If cross-sell eligible, user MUST pick CGM Coverage Path (Insulin or Hypoglycemia) */}
            {isCrossSellEligible && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  CGM Coverage Path
                  {needsCgmCoveragePath && <span className="text-red-400">* required</span>}
                </Label>
                <Select
                  value={patient.cgmCoveragePath || undefined}
                  onValueChange={(v) => onUpdate({ cgmCoveragePath: v })}
                >
                  <SelectTrigger className={needsCgmCoveragePath ? "border-amber-400" : ""}>
                    <SelectValue placeholder="Select Insulin or Hypoglycemia…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Insulin">Insulin</SelectItem>
                    <SelectItem value="Hypoglycemia">Hypoglycemia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {crossSellStatus === "Evaluate" && !primaryIns && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Set Primary Insurance on the Stedi tab to auto-evaluate cross-sell eligibility
            </p>
          )}

          {crossSellStatus === "Couldn't Cross-Sell" && (
            <p className="text-xs text-muted-foreground">
              Medicaid plans are not eligible for CGM cross-sell.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Request & Serving + Pump/CGM Type */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Request &amp; Serving</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StatusSelect
              value={patient.requestType}
              config={{ field: "requestType", label: "Request Type", indexMap: REQUEST_TYPE_INDEX }}
              onChange={(v) => onUpdate({ requestType: v })}
            />
            <StatusSelect
              value={patient.serving}
              config={{ field: "serving", label: "Serving", indexMap: SERVING_INDEX }}
              onChange={(v) => onUpdate({ serving: v })}
            />
            <StatusSelect
              value={patient.pumpType}
              config={{ field: "pumpType", label: "Pump Type", indexMap: PUMP_TYPE_INDEX }}
              onChange={(v) => onUpdate({ pumpType: v })}
            />
            <StatusSelect
              value={patient.cgmType}
              config={{ field: "cgmType", label: "CGM Type", indexMap: CGM_TYPE_INDEX }}
              onChange={(v) => onUpdate({ cgmType: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Coverage Paths */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Coverage Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StatusSelect
              value={patient.insulinPumpCoveragePath}
              config={{ field: "insulinPumpCoveragePath", label: "Insulin Pump Coverage Path", indexMap: INSULIN_PUMP_COVERAGE_PATH_INDEX }}
              onChange={(v) => onUpdate({ insulinPumpCoveragePath: v })}
            />
            {/* Only show CGM Coverage Path here if NOT cross-sell eligible (otherwise it's in section 2) */}
            {!isCrossSellEligible && (
              <StatusSelect
                value={patient.cgmCoveragePath}
                config={{ field: "cgmCoveragePath", label: "CGM Coverage Path", indexMap: CGM_COVERAGE_PATH_INDEX }}
                onChange={(v) => onUpdate({ cgmCoveragePath: v })}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
