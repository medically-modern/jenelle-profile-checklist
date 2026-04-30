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
