/**
 * Phase 3: Comprehensive Data Parsing Utilities
 * Covers: 3.1-3.10 — CSV/Excel/XML parsing, unit detection, timestamp normalization,
 *         deduplication, validation, and error reporting.
 */

// ============= TYPES =============

export interface ParsedGlucoseReading {
  timestamp: Date;
  value: number; // always mg/dL after conversion
  originalValue: number;
  unit: 'mg/dL' | 'mmol/L';
  eventType?: string;
  insulinUnits?: number;
  carbGrams?: number;
  notes?: string;
  source?: string;
  lineNumber?: number;
}

export interface ParseError {
  line: number;
  column?: string;
  message: string;
  severity: 'warning' | 'error' | 'info';
  raw?: string;
}

export interface ParseResult {
  readings: ParsedGlucoseReading[];
  errors: ParseError[];
  metadata: ParseMetadata;
}

export interface ParseMetadata {
  totalLines: number;
  validReadings: number;
  skippedLines: number;
  duplicatesRemoved: number;
  detectedUnit: 'mg/dL' | 'mmol/L' | 'mixed' | 'unknown';
  detectedDevice: string | null;
  detectedFormat: string;
  dateRange: { start: string | null; end: string | null };
  parserVersion: string;
}

// ============= CONSTANTS =============

const PARSER_VERSION = '3.0.0';

// 3.6: Unit detection thresholds
const MMOL_L_MAX = 33.3; // Max plausible mmol/L value
const MG_DL_MIN_LIKELY = 36; // Below this in mg/dL context is unlikely

// Common timestamp formats for various CGM exports
const TIMESTAMP_FORMATS = [
  // ISO 8601
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
  // US: MM/DD/YYYY HH:MM:SS
  /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?/i,
  // EU: DD/MM/YYYY HH:MM:SS
  /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/,
  // Dexcom: YYYY-MM-DD HH:MM:SS
  /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/,
  // Unix timestamp (seconds or ms)
  /^\d{10,13}$/,
];

// Known CGM column headers mapped to our fields
const COLUMN_MAPPINGS: Record<string, string[]> = {
  timestamp: [
    'timestamp', 'date', 'time', 'datetime', 'display time', 'event date time',
    'device timestamp', 'local time', 'created_at', 'readingdatetime',
    'glucose date', 'meter timestamp', 'record date',
  ],
  value: [
    'glucose value (mg/dl)', 'glucose value', 'bg reading (mg/dl)', 'value',
    'reading', 'glucose', 'sgv', 'mbg', 'bg', 'historic glucose mg/dl',
    'scan glucose mg/dl', 'historic glucose(mg/dl)', 'blood glucose value',
    'sensor glucose (mg/dl)', 'glucose reading (mg/dl)',
    'historic glucose mmol/l', 'scan glucose mmol/l',
  ],
  insulin: [
    'insulin value', 'insulin', 'bolus volume delivered', 'bolus',
    'rapid-acting insulin', 'long-acting insulin', 'insulin dose',
    'bolus volume (u)', 'basal rate', 'insulin units',
  ],
  carbs: [
    'carb value', 'carbs', 'carbohydrates', 'carb input',
    'carbs (grams)', 'carbohydrate input', 'meal carbs',
  ],
  notes: [
    'notes', 'comment', 'description', 'event type', 'event subtype',
  ],
};

// ============= 3.1: CSV PARSER =============

/**
 * Parse CSV file content into glucose readings.
 * Handles Dexcom, LibreView, Medtronic, Nightscout, and generic CSV formats.
 */
export function parseCSV(content: string): ParseResult {
  const errors: ParseError[] = [];
  const lines = content.split(/\r?\n/).filter(l => l.trim());

  if (lines.length < 2) {
    return emptyResult('CSV', [{ line: 0, message: 'File is empty or has no data rows', severity: 'error' }]);
  }

  // Detect and skip header preamble (Dexcom exports have metadata rows)
  const { headerIndex, deviceInfo } = detectHeaderRow(lines);
  const format = detectCSVFormat(lines, headerIndex);

  const headerLine = lines[headerIndex];
  const delimiter = detectDelimiter(headerLine);
  const headers = parseCSVLine(headerLine, delimiter).map(h => h.toLowerCase().trim());

  // Map columns
  const colMap = mapColumns(headers);

  if (colMap.timestamp === -1) {
    errors.push({ line: headerIndex + 1, message: 'No timestamp column found', severity: 'error' });
    return emptyResult(format, errors);
  }
  if (colMap.value === -1) {
    errors.push({ line: headerIndex + 1, message: 'No glucose value column found', severity: 'error' });
    return emptyResult(format, errors);
  }

  const rawReadings: ParsedGlucoseReading[] = [];
  let skippedLines = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { skippedLines++; continue; }

    const fields = parseCSVLine(line, delimiter);

    // Parse timestamp
    const tsRaw = fields[colMap.timestamp]?.trim();
    const ts = parseTimestamp(tsRaw);
    if (!ts) {
      errors.push({ line: i + 1, column: 'timestamp', message: `Invalid timestamp: "${tsRaw}"`, severity: 'warning', raw: line });
      skippedLines++;
      continue;
    }

    // Parse glucose value
    const valRaw = fields[colMap.value]?.trim();
    const val = parseGlucoseValue(valRaw);
    if (val === null) {
      // Skip rows with "Low", "High", or empty glucose — not an error
      if (valRaw && /^(low|high|lo|hi)$/i.test(valRaw)) {
        skippedLines++;
        continue;
      }
      if (!valRaw) { skippedLines++; continue; }
      errors.push({ line: i + 1, column: 'value', message: `Invalid glucose value: "${valRaw}"`, severity: 'warning', raw: line });
      skippedLines++;
      continue;
    }

    const reading: ParsedGlucoseReading = {
      timestamp: ts,
      value: val,
      originalValue: val,
      unit: 'mg/dL', // will be corrected by unit detection
      lineNumber: i + 1,
    };

    // Optional fields
    if (colMap.insulin !== -1) {
      const ins = parseFloat(fields[colMap.insulin]);
      if (!isNaN(ins) && ins > 0) reading.insulinUnits = ins;
    }
    if (colMap.carbs !== -1) {
      const carb = parseFloat(fields[colMap.carbs]);
      if (!isNaN(carb) && carb > 0) reading.carbGrams = carb;
    }
    if (colMap.notes !== -1) {
      const note = fields[colMap.notes]?.trim();
      if (note) reading.notes = note;
    }

    rawReadings.push(reading);
  }

  // 3.6: Detect units and convert if needed
  const unitResult = detectAndConvertUnits(rawReadings);
  const readings = unitResult.readings;
  if (unitResult.conversionApplied) {
    errors.push({
      line: 0,
      message: `Detected mmol/L values — converted ${unitResult.convertedCount} readings to mg/dL`,
      severity: 'info',
    });
  }

  // 3.7: Timestamp normalization (sort chronologically)
  readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // 3.8: Deduplication
  const { deduplicated, removedCount } = deduplicateReadings(readings);
  if (removedCount > 0) {
    errors.push({ line: 0, message: `Removed ${removedCount} duplicate readings`, severity: 'info' });
  }

  // 3.9: Validation — remove implausible values
  const validated = validateReadings(deduplicated, errors);

  const dateRange = validated.length > 0
    ? { start: validated[0].timestamp.toISOString(), end: validated[validated.length - 1].timestamp.toISOString() }
    : { start: null, end: null };

  return {
    readings: validated,
    errors,
    metadata: {
      totalLines: lines.length,
      validReadings: validated.length,
      skippedLines,
      duplicatesRemoved: removedCount,
      detectedUnit: unitResult.detectedUnit,
      detectedDevice: deviceInfo,
      detectedFormat: format,
      dateRange,
      parserVersion: PARSER_VERSION,
    },
  };
}

// ============= 3.2: NIGHTSCOUT JSON PARSER =============

export function parseNightscoutJSON(content: string): ParseResult {
  const errors: ParseError[] = [];

  let data: any[];
  try {
    const parsed = JSON.parse(content);
    data = Array.isArray(parsed) ? parsed : parsed.entries || parsed.sgvs || [parsed];
  } catch {
    return emptyResult('Nightscout JSON', [{ line: 0, message: 'Invalid JSON format', severity: 'error' }]);
  }

  const readings: ParsedGlucoseReading[] = [];

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const ts = entry.dateString ? new Date(entry.dateString)
      : entry.date ? new Date(entry.date)
        : entry.created_at ? new Date(entry.created_at)
          : entry.sysTime ? new Date(entry.sysTime)
            : null;

    if (!ts || isNaN(ts.getTime())) {
      errors.push({ line: i + 1, message: `Invalid timestamp in entry ${i}`, severity: 'warning' });
      continue;
    }

    const val = entry.sgv ?? entry.mbg ?? entry.glucose ?? entry.value;
    if (val === undefined || val === null || isNaN(Number(val))) continue;

    readings.push({
      timestamp: ts,
      value: Number(val),
      originalValue: Number(val),
      unit: 'mg/dL', // Nightscout uses mg/dL
      source: 'nightscout',
      lineNumber: i + 1,
    });
  }

  readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const { deduplicated, removedCount } = deduplicateReadings(readings);
  const validated = validateReadings(deduplicated, errors);

  return {
    readings: validated,
    errors,
    metadata: {
      totalLines: data.length,
      validReadings: validated.length,
      skippedLines: data.length - readings.length,
      duplicatesRemoved: removedCount,
      detectedUnit: 'mg/dL',
      detectedDevice: 'Nightscout',
      detectedFormat: 'Nightscout JSON',
      dateRange: validated.length > 0
        ? { start: validated[0].timestamp.toISOString(), end: validated[validated.length - 1].timestamp.toISOString() }
        : { start: null, end: null },
      parserVersion: PARSER_VERSION,
    },
  };
}

// ============= 3.3: XML PARSER (LibreView/Medtronic) =============

export function parseXML(content: string): ParseResult {
  const errors: ParseError[] = [];
  const readings: ParsedGlucoseReading[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return emptyResult('XML', [{ line: 0, message: 'Invalid XML format', severity: 'error' }]);
    }

    // Try common XML structures
    const glucoseNodes =
      doc.querySelectorAll('GlucoseReading, Reading, Entry, Measurement, glucose, sgv');

    if (glucoseNodes.length === 0) {
      // Try generic approach: find any element with glucose-like attributes
      const allNodes = doc.querySelectorAll('*');
      for (let i = 0; i < allNodes.length; i++) {
        const node = allNodes[i];
        const valAttr = node.getAttribute('value') || node.getAttribute('glucose') || node.getAttribute('sgv');
        const tsAttr = node.getAttribute('timestamp') || node.getAttribute('dateTime') || node.getAttribute('time');
        if (valAttr && tsAttr) {
          const ts = parseTimestamp(tsAttr);
          const val = parseGlucoseValue(valAttr);
          if (ts && val !== null) {
            readings.push({ timestamp: ts, value: val, originalValue: val, unit: 'mg/dL', lineNumber: i + 1 });
          }
        }
      }
    } else {
      glucoseNodes.forEach((node, i) => {
        const valStr = node.getAttribute('value') || node.getAttribute('glucose') || node.textContent?.trim();
        const tsStr = node.getAttribute('timestamp') || node.getAttribute('dateTime')
          || node.getAttribute('time') || node.getAttribute('date');
        if (tsStr && valStr) {
          const ts = parseTimestamp(tsStr);
          const val = parseGlucoseValue(valStr);
          if (ts && val !== null) {
            readings.push({ timestamp: ts, value: val, originalValue: val, unit: 'mg/dL', lineNumber: i + 1 });
          }
        }
      });
    }
  } catch (e) {
    return emptyResult('XML', [{ line: 0, message: `XML parsing failed: ${e}`, severity: 'error' }]);
  }

  const unitResult = detectAndConvertUnits(readings);
  unitResult.readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const { deduplicated, removedCount } = deduplicateReadings(unitResult.readings);
  const validated = validateReadings(deduplicated, errors);

  return {
    readings: validated,
    errors,
    metadata: {
      totalLines: readings.length,
      validReadings: validated.length,
      skippedLines: 0,
      duplicatesRemoved: removedCount,
      detectedUnit: unitResult.detectedUnit,
      detectedDevice: null,
      detectedFormat: 'XML',
      dateRange: validated.length > 0
        ? { start: validated[0].timestamp.toISOString(), end: validated[validated.length - 1].timestamp.toISOString() }
        : { start: null, end: null },
      parserVersion: PARSER_VERSION,
    },
  };
}

// ============= 3.4: AUTO-FORMAT DETECTION =============

/**
 * Automatically detect file format and parse accordingly.
 */
export function autoParseFile(content: string, filename: string): ParseResult {
  const ext = filename.toLowerCase().split('.').pop() || '';

  if (ext === 'json') {
    return parseNightscoutJSON(content);
  }

  if (ext === 'xml') {
    return parseXML(content);
  }

  // Try JSON first (some files have .txt or .csv extension but are JSON)
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    try {
      return parseNightscoutJSON(content);
    } catch {
      // Not valid JSON, try CSV
    }
  }

  // Try XML
  if (content.trim().startsWith('<?xml') || content.trim().startsWith('<')) {
    try {
      return parseXML(content);
    } catch {
      // Not valid XML, try CSV
    }
  }

  // Default: CSV
  return parseCSV(content);
}

// ============= INTERNAL HELPERS =============

function emptyResult(format: string, errors: ParseError[]): ParseResult {
  return {
    readings: [],
    errors,
    metadata: {
      totalLines: 0,
      validReadings: 0,
      skippedLines: 0,
      duplicatesRemoved: 0,
      detectedUnit: 'unknown',
      detectedDevice: null,
      detectedFormat: format,
      dateRange: { start: null, end: null },
      parserVersion: PARSER_VERSION,
    },
  };
}

function detectHeaderRow(lines: string[]): { headerIndex: number; deviceInfo: string | null } {
  let deviceInfo: string | null = null;

  // Dexcom exports: first few lines are metadata
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('dexcom')) deviceInfo = 'Dexcom';
    else if (line.includes('libreview') || line.includes('freestyle libre')) deviceInfo = 'FreeStyle Libre';
    else if (line.includes('medtronic') || line.includes('carelink')) deviceInfo = 'Medtronic';
    else if (line.includes('omnipod')) deviceInfo = 'Omnipod';
    else if (line.includes('tandem') || line.includes('t:slim')) deviceInfo = 'Tandem';

    // Look for the actual header row (has multiple known column names)
    const fields = lines[i].toLowerCase().split(/[,\t;|]/);
    const matchCount = fields.filter(f =>
      COLUMN_MAPPINGS.timestamp.includes(f.trim()) ||
      COLUMN_MAPPINGS.value.some(v => f.trim().includes(v))
    ).length;
    if (matchCount >= 2) return { headerIndex: i, deviceInfo };
  }

  return { headerIndex: 0, deviceInfo };
}

function detectCSVFormat(lines: string[], headerIndex: number): string {
  const header = lines[headerIndex]?.toLowerCase() || '';
  if (header.includes('display time') && header.includes('glucose value')) return 'Dexcom Clarity';
  if (header.includes('historic glucose') || header.includes('scan glucose')) return 'LibreView';
  if (header.includes('sensor glucose') && header.includes('bolus volume')) return 'Medtronic CareLink';
  if (header.includes('sgv') || header.includes('datestring')) return 'Nightscout CSV';
  if (header.includes('bg reading')) return 'Tidepool';
  return 'Generic CSV';
}

function detectDelimiter(line: string): string {
  const counts = { ',': 0, '\t': 0, ';': 0, '|': 0 };
  for (const char of line) {
    if (char in counts) counts[char as keyof typeof counts]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function mapColumns(headers: string[]): { timestamp: number; value: number; insulin: number; carbs: number; notes: number } {
  const find = (candidates: string[]): number => {
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].trim();
      if (candidates.includes(h)) return i;
    }
    // Partial match
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].trim();
      if (candidates.some(c => h.includes(c) || c.includes(h))) return i;
    }
    return -1;
  };

  return {
    timestamp: find(COLUMN_MAPPINGS.timestamp),
    value: find(COLUMN_MAPPINGS.value),
    insulin: find(COLUMN_MAPPINGS.insulin),
    carbs: find(COLUMN_MAPPINGS.carbs),
    notes: find(COLUMN_MAPPINGS.notes),
  };
}

// 3.7: Timestamp normalization
function parseTimestamp(raw: string | undefined): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^["']|["']$/g, '');

  // Unix timestamp
  if (/^\d{10,13}$/.test(trimmed)) {
    const ms = trimmed.length === 10 ? Number(trimmed) * 1000 : Number(trimmed);
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // Try native Date.parse first (handles ISO 8601)
  const native = new Date(trimmed);
  if (!isNaN(native.getTime())) return native;

  // US format: M/D/YYYY H:MM:SS AM/PM
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (usMatch) {
    let [, month, day, year, hour, min, sec, ampm] = usMatch;
    if (year.length === 2) year = `20${year}`;
    let h = parseInt(hour);
    if (ampm?.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm?.toUpperCase() === 'AM' && h === 12) h = 0;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, parseInt(min), parseInt(sec || '0'));
    return isNaN(d.getTime()) ? null : d;
  }

  // EU format: D.M.YYYY H:MM:SS
  const euMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (euMatch) {
    let [, day, month, year, hour, min, sec] = euMatch;
    if (year.length === 2) year = `20${year}`;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min), parseInt(sec || '0'));
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function parseGlucoseValue(raw: string | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/,/g, '.');
  if (/^(low|high|lo|hi|--|na|n\/a)$/i.test(trimmed)) return null;
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
}

// 3.6: Unit detection and conversion
function detectAndConvertUnits(readings: ParsedGlucoseReading[]): {
  readings: ParsedGlucoseReading[];
  detectedUnit: 'mg/dL' | 'mmol/L' | 'mixed' | 'unknown';
  conversionApplied: boolean;
  convertedCount: number;
} {
  if (readings.length === 0) return { readings, detectedUnit: 'unknown', conversionApplied: false, convertedCount: 0 };

  const values = readings.map(r => r.value);
  const likelyMmol = values.filter(v => v > 0 && v <= MMOL_L_MAX).length;
  const likelyMgDl = values.filter(v => v >= MG_DL_MIN_LIKELY).length;

  // If >80% of values are in mmol/L range, convert all
  const mmolRatio = likelyMmol / values.length;
  const mgdlRatio = likelyMgDl / values.length;

  if (mmolRatio > 0.8 && mgdlRatio < 0.3) {
    // Convert mmol/L to mg/dL
    return {
      readings: readings.map(r => ({
        ...r,
        value: Math.round(r.value * 18.018),
        originalValue: r.value,
        unit: 'mmol/L' as const,
      })),
      detectedUnit: 'mmol/L',
      conversionApplied: true,
      convertedCount: readings.length,
    };
  }

  if (mgdlRatio > 0.8) {
    return { readings, detectedUnit: 'mg/dL', conversionApplied: false, convertedCount: 0 };
  }

  // Mixed or ambiguous — convert individual values that look like mmol/L
  let convertedCount = 0;
  const converted = readings.map(r => {
    if (r.value > 0 && r.value <= MMOL_L_MAX && r.value < MG_DL_MIN_LIKELY) {
      convertedCount++;
      return { ...r, value: Math.round(r.value * 18.018), originalValue: r.value, unit: 'mmol/L' as const };
    }
    return r;
  });

  return {
    readings: converted,
    detectedUnit: convertedCount > 0 ? 'mixed' : 'mg/dL',
    conversionApplied: convertedCount > 0,
    convertedCount,
  };
}

// 3.8: Deduplication by timestamp (within 30-second window)
function deduplicateReadings(readings: ParsedGlucoseReading[]): {
  deduplicated: ParsedGlucoseReading[];
  removedCount: number;
} {
  if (readings.length <= 1) return { deduplicated: readings, removedCount: 0 };

  const result: ParsedGlucoseReading[] = [readings[0]];
  let removedCount = 0;

  for (let i = 1; i < readings.length; i++) {
    const prev = result[result.length - 1];
    const curr = readings[i];
    const timeDiff = Math.abs(curr.timestamp.getTime() - prev.timestamp.getTime());

    // Same timestamp (within 30s) and same value → duplicate
    if (timeDiff < 30000 && curr.value === prev.value) {
      removedCount++;
      continue;
    }
    result.push(curr);
  }

  return { deduplicated: result, removedCount };
}

// 3.9: Validation — flag/remove implausible values
function validateReadings(readings: ParsedGlucoseReading[], errors: ParseError[]): ParsedGlucoseReading[] {
  const validated: ParsedGlucoseReading[] = [];
  const now = new Date();
  const minDate = new Date('2000-01-01'); // CGM tech didn't exist before this

  for (const r of readings) {
    // Physiologically implausible glucose
    if (r.value < 20 || r.value > 600) {
      errors.push({
        line: r.lineNumber || 0,
        message: `Glucose ${r.value} mg/dL outside plausible range (20-600)`,
        severity: 'warning',
      });
      continue;
    }

    // Future timestamp
    if (r.timestamp > now) {
      errors.push({
        line: r.lineNumber || 0,
        message: `Future timestamp: ${r.timestamp.toISOString()}`,
        severity: 'warning',
      });
      continue;
    }

    // Too old
    if (r.timestamp < minDate) {
      errors.push({
        line: r.lineNumber || 0,
        message: `Timestamp before year 2000: ${r.timestamp.toISOString()}`,
        severity: 'warning',
      });
      continue;
    }

    validated.push(r);
  }

  return validated;
}

// ============= 3.10: ERROR REPORTING SUMMARY =============

/**
 * Generate a human-readable error report from parse results.
 */
export function generateParseReport(result: ParseResult): string {
  const { metadata: m, errors } = result;
  const lines = [
    `📊 Parse Report (v${m.parserVersion})`,
    `Format: ${m.detectedFormat}${m.detectedDevice ? ` (${m.detectedDevice})` : ''}`,
    `Unit: ${m.detectedUnit}`,
    `Total lines: ${m.totalLines}`,
    `Valid readings: ${m.validReadings}`,
    `Skipped: ${m.skippedLines}`,
    `Duplicates removed: ${m.duplicatesRemoved}`,
  ];

  if (m.dateRange.start && m.dateRange.end) {
    lines.push(`Date range: ${m.dateRange.start.split('T')[0]} → ${m.dateRange.end.split('T')[0]}`);
  }

  const criticalErrors = errors.filter(e => e.severity === 'error');
  const warnings = errors.filter(e => e.severity === 'warning');

  if (criticalErrors.length > 0) {
    lines.push(`\n❌ ${criticalErrors.length} error(s):`);
    criticalErrors.slice(0, 5).forEach(e => lines.push(`  Line ${e.line}: ${e.message}`));
  }
  if (warnings.length > 0) {
    lines.push(`\n⚠️ ${warnings.length} warning(s):`);
    warnings.slice(0, 5).forEach(e => lines.push(`  Line ${e.line}: ${e.message}`));
    if (warnings.length > 5) lines.push(`  ... and ${warnings.length - 5} more`);
  }

  return lines.join('\n');
}
