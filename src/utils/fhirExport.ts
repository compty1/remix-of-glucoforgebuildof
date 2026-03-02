/**
 * Phase 16.5: FHIR R4 Bundle Export
 * Generates a FHIR-compliant JSON bundle with LOINC-coded observations.
 */

export interface GlucoseObservation {
  timestamp: string;
  value: number;
  unit: 'mg/dL' | 'mmol/L';
}

interface FHIRCoding {
  system: string;
  code: string;
  display: string;
}

interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'final';
  category: Array<{ coding: FHIRCoding[] }>;
  code: { coding: FHIRCoding[]; text: string };
  effectiveDateTime: string;
  valueQuantity: { value: number; unit: string; system: string; code: string };
}

interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'collection';
  timestamp: string;
  meta: { lastUpdated: string };
  entry: Array<{ resource: FHIRObservation }>;
}

const LOINC_GLUCOSE: FHIRCoding = {
  system: 'http://loinc.org',
  code: '15074-8',
  display: 'Glucose [Moles/volume] in Blood',
};

const LOINC_GLUCOSE_MGDL: FHIRCoding = {
  system: 'http://loinc.org',
  code: '2339-0',
  display: 'Glucose [Mass/volume] in Blood',
};

const VITAL_SIGNS_CATEGORY: FHIRCoding = {
  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
  code: 'vital-signs',
  display: 'Vital Signs',
};

/**
 * Convert glucose readings to a FHIR R4 Bundle.
 */
export function generateFHIRBundle(
  observations: GlucoseObservation[],
  patientId?: string
): FHIRBundle {
  const now = new Date().toISOString();

  const entries = observations.map((obs, index): { resource: FHIRObservation } => {
    const isMgDl = obs.unit === 'mg/dL';

    return {
      resource: {
        resourceType: 'Observation',
        id: `glucose-${index + 1}`,
        status: 'final',
        category: [{ coding: [VITAL_SIGNS_CATEGORY] }],
        code: {
          coding: [isMgDl ? LOINC_GLUCOSE_MGDL : LOINC_GLUCOSE],
          text: `Blood Glucose (${obs.unit})`,
        },
        effectiveDateTime: obs.timestamp,
        valueQuantity: {
          value: Math.round(obs.value * 10) / 10,
          unit: obs.unit,
          system: 'http://unitsofmeasure.org',
          code: isMgDl ? 'mg/dL' : 'mmol/L',
        },
      },
    };
  });

  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: now,
    meta: { lastUpdated: now },
    entry: entries,
  };
}

/**
 * Download FHIR bundle as JSON file.
 */
export function downloadFHIRBundle(observations: GlucoseObservation[], filename?: string): void {
  const bundle = generateFHIRBundle(observations);
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: 'application/fhir+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `glucose-fhir-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
