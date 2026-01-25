
# Add Support for Additional File Types in CGM Data Upload

## Overview

This plan extends the glucose data upload system to support four additional file formats:
1. **Excel files** (.xlsx, .xls) - Common export format from CGM apps and manual tracking
2. **Nightscout JSON exports** - Popular open-source CGM tracking system format
3. **Image files** (PNG, JPG) - Screenshot-based extraction using AI vision
4. **XML files** - Alternative export format from some CGM systems

---

## Current State

The system currently supports:
- **CSV files** - Parsed with intelligent column detection (Dexcom, Libre, generic)
- **JSON files** - Basic array parsing for glucose/timestamp/value fields
- **PDF files** - AI vision extraction for CGM summary reports

File format detection happens in `detectFileFormat()` (line 952) and processing occurs in the main handler (line 2145+).

---

## Implementation Plan

### Phase 1: Frontend Updates

**File: `src/pages/DataUpload.tsx`**

Update the file input to accept new formats:

```typescript
// Current
input.accept = '.csv,.json,.pdf';

// Updated
input.accept = '.csv,.json,.pdf,.xlsx,.xls,.xml,.png,.jpg,.jpeg';
```

Update the "Supported Formats" UI section to show:
- CGM Data: CSV, JSON, XLSX
- Image Reports: PDF, PNG, JPG
- App Exports: XML, Nightscout JSON

### Phase 2: Edge Function Updates

**File: `supabase/functions/analyze-glucose/index.ts`**

#### 2.1 Add Excel Parsing Dependency

Add the xlsx library for Excel parsing:

```typescript
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";
```

#### 2.2 Update File Format Detection

Extend `detectFileFormat()` to recognize new types:

```typescript
function detectFileFormat(filename: string, content: string): 
  'pdf' | 'csv' | 'json' | 'txt' | 'xlsx' | 'xml' | 'image' | 'unknown' {
  
  const lowerFilename = filename.toLowerCase();
  
  // Excel files
  if (lowerFilename.endsWith('.xlsx') || lowerFilename.endsWith('.xls')) {
    return 'xlsx';
  }
  
  // XML files
  if (lowerFilename.endsWith('.xml') || content.trim().startsWith('<?xml')) {
    return 'xml';
  }
  
  // Image files
  if (lowerFilename.match(/\.(png|jpg|jpeg|webp)$/)) {
    return 'image';
  }
  
  // ... existing detection logic
}
```

#### 2.3 Add Excel Parser Function

```typescript
function parseExcel(base64Content: string): GlucoseReading[] {
  try {
    const workbook = XLSX.read(base64Content, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    const readings: GlucoseReading[] = [];
    
    for (const row of data) {
      // Try common column names
      const timestamp = new Date(
        row['Timestamp'] || row['Date'] || row['Time'] || 
        row['DateTime'] || row['timestamp'] || row['date']
      );
      
      const value = parseFloat(
        row['Glucose'] || row['BG'] || row['Value'] || 
        row['Historic Glucose'] || row['glucose'] || row['bg']
      );
      
      if (!isNaN(timestamp.getTime()) && !isNaN(value) && value > 0 && value < 600) {
        readings.push({ timestamp, value });
      }
    }
    
    return readings;
  } catch (error) {
    console.error('Excel parse error:', error);
    return [];
  }
}
```

#### 2.4 Enhance JSON Parser for Nightscout Format

Update `parseJSON()` to handle Nightscout's specific format:

```typescript
function parseJSON(content: string): GlucoseReading[] {
  try {
    const data = JSON.parse(content);
    const readings: GlucoseReading[] = [];
    
    const items = Array.isArray(data) ? data : data.result || data.entries || [];
    
    for (const item of items) {
      // Nightscout uses 'sgv' for sensor glucose value
      // and 'date' as Unix timestamp in milliseconds
      let timestamp: Date;
      let value: number;
      
      // Nightscout format detection
      if ('sgv' in item) {
        timestamp = new Date(item.date || item.dateString || item.created_at);
        value = parseFloat(item.sgv);
      } else {
        // Generic JSON format
        timestamp = new Date(item.timestamp || item.time || item.date || item.created_at);
        value = parseFloat(item.value || item.glucose || item.bg);
      }
      
      // Extract additional Nightscout fields if available
      const reading: GlucoseReading = {
        timestamp,
        value,
        eventType: item.type || item.eventType,
        insulinUnits: item.insulin,
        carbGrams: item.carbs
      };
      
      if (!isNaN(timestamp.getTime()) && !isNaN(value) && value > 0 && value < 600) {
        readings.push(reading);
      }
    }
    
    return readings;
  } catch {
    return [];
  }
}
```

#### 2.5 Add XML Parser Function

```typescript
function parseXML(content: string): GlucoseReading[] {
  const readings: GlucoseReading[] = [];
  
  try {
    // Simple regex-based XML parsing for CGM data
    // Handles Nightscout XML format and generic CGM exports
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const sgvRegex = /<sgv>(\d+)<\/sgv>/i;
    const dateRegex = /<date>(\d+)<\/date>/i;
    const dateStringRegex = /<dateString>([^<]+)<\/dateString>/i;
    
    let match;
    while ((match = itemRegex.exec(content)) !== null) {
      const item = match[1];
      
      const sgvMatch = item.match(sgvRegex);
      const dateMatch = item.match(dateRegex);
      const dateStringMatch = item.match(dateStringRegex);
      
      if (sgvMatch) {
        const value = parseFloat(sgvMatch[1]);
        let timestamp: Date;
        
        if (dateMatch) {
          timestamp = new Date(parseInt(dateMatch[1]));
        } else if (dateStringMatch) {
          timestamp = new Date(dateStringMatch[1]);
        } else {
          continue;
        }
        
        if (!isNaN(timestamp.getTime()) && value > 0 && value < 600) {
          readings.push({ timestamp, value });
        }
      }
    }
    
    // Also try generic glucose XML formats
    const glucoseRegex = /<glucose[^>]*>(\d+\.?\d*)<\/glucose>/gi;
    const timestampRegex = /<timestamp>([^<]+)<\/timestamp>/i;
    
    // ... additional parsing for other XML schemas
    
  } catch (error) {
    console.error('XML parse error:', error);
  }
  
  return readings;
}
```

#### 2.6 Add Image Extraction (Vision API)

```typescript
async function extractImageWithVision(base64Image: string, filename: string, mimeType: string): 
  Promise<{ metrics: PDFSummaryMetrics | null; text: string }> {
  
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return { metrics: null, text: '' };
  }
  
  console.log('Using AI Vision to extract image content...');
  
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a CGM (Continuous Glucose Monitor) screenshot data extractor...`
            // Same prompt as PDF extraction
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract CGM metrics from this ${filename} screenshot.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0
      }),
    });
    
    // ... same parsing logic as PDF extraction
  } catch (error) {
    console.error('Image vision extraction failed:', error);
    return { metrics: null, text: '' };
  }
}
```

#### 2.7 Update Main Processing Logic

Update the main request handler to route new file types:

```typescript
// ============= FILE PROCESSING =============
if (fileFormat === 'csv' || fileFormat === 'txt') {
  readings = parseCSV(fileContent);
} else if (fileFormat === 'json') {
  readings = parseJSON(fileContent);
} else if (fileFormat === 'xlsx') {
  readings = parseExcel(fileContent); // fileContent is base64 for Excel
} else if (fileFormat === 'xml') {
  readings = parseXML(fileContent);
} else if (fileFormat === 'pdf') {
  // Existing PDF logic
} else if (fileFormat === 'image') {
  // Use vision extraction like PDF
  const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const { metrics } = await extractImageWithVision(fileContent, filename, mimeType);
  // Convert to readings or summary report
} else {
  // Try CSV as fallback
  readings = parseCSV(fileContent);
}
```

### Phase 3: Update Frontend File Handler

**File: `src/pages/DataUpload.tsx`**

Update `processFile()` to handle binary file types correctly:

```typescript
const processFile = async (file: File) => {
  // ...existing code...

  try {
    const fileContent = await (async () => {
      const lowerName = file.name.toLowerCase();
      const isBinary = file.type === 'application/pdf' || 
                       lowerName.endsWith('.pdf') ||
                       lowerName.endsWith('.xlsx') ||
                       lowerName.endsWith('.xls') ||
                       lowerName.match(/\.(png|jpg|jpeg)$/);
      
      if (!isBinary) return await file.text();

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      return btoa(binary);
    })();
    
    // ... rest of processing
  }
}
```

Update supported formats display:

```typescript
<div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="text-center p-3 rounded-lg bg-muted/50">
    <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
    <p className="text-sm font-medium">CGM Data</p>
    <p className="text-xs text-muted-foreground">CSV, JSON, XLSX</p>
  </div>
  <div className="text-center p-3 rounded-lg bg-muted/50">
    <FileImage className="h-6 w-6 mx-auto mb-2 text-primary" />
    <p className="text-sm font-medium">Reports</p>
    <p className="text-xs text-muted-foreground">PDF, PNG, JPG</p>
  </div>
  <div className="text-center p-3 rounded-lg bg-muted/50">
    <Database className="h-6 w-6 mx-auto mb-2 text-primary" />
    <p className="text-sm font-medium">Nightscout</p>
    <p className="text-xs text-muted-foreground">JSON Export</p>
  </div>
  <div className="text-center p-3 rounded-lg bg-muted/50">
    <FileCode className="h-6 w-6 mx-auto mb-2 text-primary" />
    <p className="text-sm font-medium">XML Data</p>
    <p className="text-xs text-muted-foreground">CGM XML Exports</p>
  </div>
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/analyze-glucose/index.ts` | Add Excel, XML, image parsers; enhance JSON for Nightscout; update format detection |
| `src/pages/DataUpload.tsx` | Update file accept types, binary handling, UI format display |

---

## Technical Considerations

### Excel Parsing
- Uses SheetJS (xlsx) library from CDN for Deno compatibility
- Handles both .xlsx (modern) and .xls (legacy) formats
- Auto-detects glucose column names across different export formats

### Nightscout JSON Format
- `sgv` = sensor glucose value (mg/dL)
- `date` = Unix timestamp in milliseconds
- `dateString` = ISO format alternative
- May contain `insulin`, `carbs`, `eventType` for treatments

### XML Format
- Nightscout XML uses `<item>` tags with `<sgv>`, `<date>`, `<dateString>`
- Also supports generic CGM XML with `<glucose>`, `<timestamp>` tags

### Image Processing
- Uses same AI Vision approach as PDF extraction
- Supports PNG, JPG, JPEG formats
- Extracts summary metrics from CGM app screenshots

### Error Handling
- Each parser includes try-catch with graceful fallback
- Clear error messages for unsupported or corrupt files
- Logs parsing issues for debugging

---

## Expected Outcome

After implementation:
1. Users can upload **Excel spreadsheets** with CGM data
2. **Nightscout exports** are fully supported with treatment data extraction
3. **Screenshots** from CGM apps can be analyzed via AI vision
4. **XML exports** from various CGM systems work seamlessly
5. UI clearly shows all supported formats to users

This significantly expands the data sources users can analyze, making the platform accessible to more of the diabetes community.
