/**
 * Jenelle Profile Checklist — Data Model
 */

export interface Patient {
  id: string;
  name: string;

  // ── Demographics ──
  dob: string;
  ptPhone: string;
  email: string;
  gender: string;
  dateOfIntake: string;
  patientAddress: string;

  // ── Status / Workflow ──
  alreadyInSystem: string;
  moveToOnboarding: string;

  // ── Stedi ──
  runStediEligibility: string;
  stediEligibilityActive: string;
  stediCoverageType: string;
  stediPayerName: string;
  stediMedicareAdvantage: string;
  stediMedicareAdvantageCarrier: string;
  stediMedicareAdvantageMemberId: string;
  stediQmb: string;
  stediMedicareJurisdiction: string;
  stediMedicaidMltc: string;
  stediManagedMedicaid: string;
  stediInNetwork: string;
  stediPriorAuthRequired: string;
  stediCoinsurance: string;
  stediCopay: string;
  stediIndividualDeductible: string;
  stediIndividualDeductibleRemaining: string;
  stediFamilyDeductible: string;
  stediFamilyDeductibleRemaining: string;
  stediIndividualOopMax: string;
  stediIndividualOopMaxRemaining: string;
  stediFamilyOopMax: string;
  stediFamilyOopMaxRemaining: string;
  stediPlanBeginDate: string;
  stediErrorDescription: string;
  stediSecondaryMedicaidId: string;
  stediPlanName: string;

  // ── Insurance ──
  primaryInsurance: string;
  generalInsurance: string;
  memberId1: string;
  memberId2: string;
  secondaryInsurance: string;

  // ── Working cost-sharing (editable by user, default from individual) ──
  workingCoinsurance: string;
  workingDeductible: string;
  workingDeductibleRemaining: string;
  workingOopMax: string;
  workingOopMaxRemaining: string;

  // ── Doctor ──
  doctorStatus: string;
  doctorName: string;
  doctorPhone: string;
  doctorNpi: string;
  clinicalsMethod: string;
  doctorEmail: string;
  doctorFax: string;
  clinicName: string;
  clinicAddress: string;

  // ── Serving / Product ──
  referralType: string;
  referralSource: string;
  pumpType: string;
  cgmType: string;
  requestType: string;
  cgmCrossSell: string;
  serving: string;
  insulinPumpCoveragePath: string;
  cgmCoveragePath: string;
}

/**
 * Cross-sell logic: determines if we can cross-sell CGM based on primary insurance.
 * Any insurance with "Medicaid" in the name = can't cross-sell.
 */
export function canCrossSellCgm(primaryInsurance: string): boolean {
  if (!primaryInsurance) return false;
  return !primaryInsurance.toLowerCase().includes("medicaid");
}

/**
 * Derive the Serving value based on cross-sell status and request type.
 */
export function deriveServing(cgmCrossSell: string, requestType: string): string | null {
  if (cgmCrossSell === "Cross-Sell") {
    if (requestType === "Supplies Only") return "Supplies + CGM";
    if (requestType === "Insulin Pump") return "Insulin Pump + CGM";
  }
  if (cgmCrossSell === "Couldn't Cross-Sell" || cgmCrossSell === "Already Serving CGM") {
    // Serving stays same as request type
    return requestType || null;
  }
  return null;
}

/**
 * Phone number formatting: (xxx) xxx-xxxx
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Extract raw digits from formatted phone.
 */
export function phoneDigits(formatted: string): string {
  return formatted.replace(/\D/g, "").slice(0, 10);
}

/**
 * Validate a 5-digit zip code in an address string.
 * Returns the zip if valid, or null if not found / invalid.
 */
export function extractZip(address: string): string | null {
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : null;
}

export function hasValidZip(address: string): boolean {
  if (!address.trim()) return true; // empty is ok
  return extractZip(address) !== null;
}
