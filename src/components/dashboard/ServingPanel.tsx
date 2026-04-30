import { useState } from "react";
import type { Patient } from "@/lib/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COL } from "@/lib/mondayApi";
import { writeStatus } from "@/lib/mondayWrite";
import {
  REFERRAL_TYPE_INDEX,
  REFERRAL_SOURCE_INDEX,
  PUMP_TYPE_INDEX,
  CGM_TYPE_INDEX,
  REQUEST_TYPE_INDEX,
  CGM_CROSS_SELL_INDEX,
  SERVING_INDEX,
  INSULIN_PUMP_COVERAGE_PATH_INDEX,
  CGM_COVERAGE_PATH_INDEX,
} from "@/lib/mondayMapping";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  patient: Patient;
  onUpdate: (patch: Partial<Patient>) => void;
}

interface StatusFieldConfig {
  field: keyof Patient;
  colId: string;
  label: string;
  indexMap: Record<string, number>;
}

const FIELDS: StatusFieldConfig[] = [
  { field: "referralType", colId: COL.referralType, label: "Referral Type", indexMap: REFERRAL_TYPE_INDEX },
  { field: "referralSource", colId: COL.referralSource, label: "Referral Source", indexMap: REFERRAL_SOURCE_INDEX },
  { field: "requestType", colId: COL.requestType, label: "Request Type", indexMap: REQUEST_TYPE_INDEX },
  { field: "serving", colId: COL.serving, label: "Serving", indexMap: SERVING_INDEX },
  { field: "pumpType", colId: COL.pumpType, label: "Pump Type", indexMap: PUMP_TYPE_INDEX },
  { field: "cgmType", colId: COL.cgmType, label: "CGM Type", indexMap: CGM_TYPE_INDEX },
  { field: "cgmCrossSell", colId: COL.cgmCrossSell, label: "CGM Cross-Sell", indexMap: CGM_CROSS_SELL_INDEX },
  { field: "insulinPumpCoveragePath", colId: COL.insulinPumpCoveragePath, label: "Insulin Pump Coverage Path", indexMap: INSULIN_PUMP_COVERAGE_PATH_INDEX },
  { field: "cgmCoveragePath", colId: COL.cgmCoveragePath, label: "CGM Coverage Path", indexMap: CGM_COVERAGE_PATH_INDEX },
];

export function ServingPanel({ patient, onUpdate }: Props) {
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const handleChange = async (config: StatusFieldConfig, label: string) => {
    onUpdate({ [config.field]: label });
    setSaving((s) => ({ ...s, [config.field]: true }));
    try {
      await writeStatus(patient.id, config.colId, label, config.indexMap);
    } catch (e) {
      toast.error(`Failed to save ${config.label}`, {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSaving((s) => ({ ...s, [config.field]: false }));
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Serving & Product</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FIELDS.map((config) => (
            <div key={config.field} className="space-y-1.5">
              <Label className="flex items-center gap-2">
                {config.label}
                {saving[config.field] && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </Label>
              <Select
                value={(patient[config.field] as string) || undefined}
                onValueChange={(v) => handleChange(config, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(config.indexMap).map((label) => (
                    <SelectItem key={label} value={label}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
