/**
 * Domain 5.2: RPM Auto-Billing Reports
 * Maps patient monitoring data to CPT codes for insurance billing.
 */

export interface PatientMonitoringData {
  patientId: string;
  patientName: string;
  daysWithData: number;       // days in month with transmitted glucose data
  providerReviewMinutes: number; // minutes provider spent reviewing
  isInitialSetup: boolean;    // first month of monitoring
  monthYear: string;          // e.g. '2026-03'
}

export interface CPTCode {
  code: string;
  description: string;
  qualified: boolean;
  reason: string;
}

export interface BillingReport {
  patient: PatientMonitoringData;
  cptCodes: CPTCode[];
  totalBillableEvents: number;
}

/**
 * Determine CPT code eligibility for a patient's monthly monitoring.
 */
export function generateBillingCodes(patient: PatientMonitoringData): BillingReport {
  const codes: CPTCode[] = [];

  // CPT 99453: Initial setup (one-time, first month only)
  codes.push({
    code: '99453',
    description: 'Remote monitoring device setup & patient education',
    qualified: patient.isInitialSetup,
    reason: patient.isInitialSetup
      ? 'Initial setup month'
      : 'Not initial setup month',
  });

  // CPT 99454: Device supply + data transmission (requires 16+ days/month)
  codes.push({
    code: '99454',
    description: 'Device supply with daily recording/transmission (16+ days)',
    qualified: patient.daysWithData >= 16,
    reason: `${patient.daysWithData}/16 required days with data`,
  });

  // CPT 99457: Provider review (requires 20+ minutes/month)
  codes.push({
    code: '99457',
    description: 'Remote physiologic monitoring treatment (20+ min review)',
    qualified: patient.providerReviewMinutes >= 20,
    reason: `${patient.providerReviewMinutes}/20 required review minutes`,
  });

  return {
    patient,
    cptCodes: codes,
    totalBillableEvents: codes.filter((c) => c.qualified).length,
  };
}

/**
 * Generate a CSV-formatted billing summary for multiple patients.
 */
export function generateBillingCSV(patients: PatientMonitoringData[]): string {
  const reports = patients.map(generateBillingCodes);
  const lines = [
    'Patient ID,Patient Name,Month,CPT 99453,CPT 99454 (Days),CPT 99457 (Minutes)',
  ];

  for (const report of reports) {
    const p = report.patient;
    const c99453 = report.cptCodes.find((c) => c.code === '99453')?.qualified ? 'YES' : 'NO';
    const c99454 = report.cptCodes.find((c) => c.code === '99454')?.qualified ? 'YES' : 'NO';
    const c99457 = report.cptCodes.find((c) => c.code === '99457')?.qualified ? 'YES' : 'NO';

    lines.push(
      `${p.patientId},${p.patientName},${p.monthYear},${c99453},${c99454} (${p.daysWithData} days),${c99457} (${p.providerReviewMinutes} min)`
    );
  }

  return lines.join('\n');
}
