import { useState } from "react";
import type { Patient } from "@/lib/workflow";
import { formatPhone } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, User, Phone, Mail, Heart, MapPin, AlertCircle } from "lucide-react";
import { format, parse, isValid } from "date-fns";

interface Props {
  patient: Patient;
  onUpdate: (patch: Partial<Patient>) => void;
}

/** Parse MM/DD/YYYY string to Date, or return undefined */
function parseDob(dob: string): Date | undefined {
  if (!dob) return undefined;
  const d = parse(dob, "MM/dd/yyyy", new Date());
  return isValid(d) ? d : undefined;
}

export function PatientProfileCard({ patient, onUpdate }: Props) {
  const alreadyInSystem = patient.alreadyInSystem?.toLowerCase();
  const [calOpen, setCalOpen] = useState(false);

  const handlePhoneChange = (value: string) => {
    onUpdate({ ptPhone: formatPhone(value) });
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onUpdate({ dob: format(date, "MM/dd/yyyy") });
    }
    setCalOpen(false);
  };

  const dobDate = parseDob(patient.dob);

  return (
    <div className="rounded-xl bg-card border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Patient Profile</p>
        {patient.alreadyInSystem && (
          <Badge
            variant="outline"
            className={
              alreadyInSystem === "yes"
                ? "border-red-400 bg-red-50 text-red-700"
                : "border-green-400 bg-green-50 text-green-700"
            }
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            {alreadyInSystem === "yes" ? "Already In System" : "New Patient"}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Name */}
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" /> Name
          </Label>
          <Input
            value={patient.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Patient name"
            className="h-9"
          />
        </div>

        {/* DOB — Calendar picker that outputs MM/DD/YYYY */}
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> DOB
          </Label>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-9 justify-start text-left font-normal px-3"
              >
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                {patient.dob || <span className="text-muted-foreground">MM/DD/YYYY</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dobDate}
                onSelect={handleCalendarSelect}
                defaultMonth={dobDate || new Date(1990, 0)}
                captionLayout="dropdown-buttons"
                fromYear={1920}
                toYear={new Date().getFullYear()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" /> Phone
          </Label>
          <Input
            value={patient.ptPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(xxx) xxx-xxxx"
            className="h-9"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" /> Email
          </Label>
          <Input
            type="email"
            value={patient.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="patient@email.com"
            className="h-9"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5" /> Gender
          </Label>
          <Select
            value={patient.gender || "_blank"}
            onValueChange={(v) => onUpdate({ gender: v === "_blank" ? "" : v })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_blank">—</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Patient Address */}
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Address
          </Label>
          <Input
            value={patient.patientAddress}
            onChange={(e) => onUpdate({ patientAddress: e.target.value })}
            placeholder="Patient address"
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
}
