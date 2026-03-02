/**
 * Domain 3.3: NFC Supply Scanning
 * Uses NDEFReader API to read NFC tags on insulin vials / sensor boxes.
 */

export interface NFCSupplyData {
  lotNumber: string | null;
  expiryDate: Date | null;
  ndcCode: string | null;
  productName: string | null;
  rawText: string;
}

/**
 * Check if NFC is available in this browser.
 */
export function isNFCAvailable(): boolean {
  return 'NDEFReader' in window;
}

/**
 * Scan an NFC tag and parse pharmaceutical data.
 * Returns a promise that resolves when a tag is read or rejects on error/timeout.
 */
export async function scanNFCTag(timeoutMs = 30000): Promise<NFCSupplyData | null> {
  if (!isNFCAvailable()) return null;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('NFC scan timed out'));
    }, timeoutMs);

    try {
      const reader = new (window as any).NDEFReader();

      reader.scan().then(() => {
        reader.addEventListener('reading', (event: any) => {
          clearTimeout(timeout);
          const records: string[] = [];

          for (const record of event.message.records) {
            if (record.recordType === 'text') {
              const decoder = new TextDecoder(record.encoding || 'utf-8');
              records.push(decoder.decode(record.data));
            } else if (record.recordType === 'url') {
              const decoder = new TextDecoder();
              records.push(decoder.decode(record.data));
            }
          }

          const rawText = records.join(' | ');
          resolve(parsePharmaceuticalNFC(rawText));
        });

        reader.addEventListener('readingerror', () => {
          clearTimeout(timeout);
          reject(new Error('NFC read error'));
        });
      }).catch((err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

/**
 * Parse pharmaceutical NFC text data.
 * Common formats include GS1 barcodes encoded as text.
 */
function parsePharmaceuticalNFC(text: string): NFCSupplyData {
  const result: NFCSupplyData = {
    lotNumber: null,
    expiryDate: null,
    ndcCode: null,
    productName: null,
    rawText: text,
  };

  // GS1 Application Identifiers
  // (10) = Lot Number
  const lotMatch = text.match(/\(10\)([A-Za-z0-9]+)/);
  if (lotMatch) result.lotNumber = lotMatch[1];

  // (17) = Expiry Date (YYMMDD)
  const expiryMatch = text.match(/\(17\)(\d{6})/);
  if (expiryMatch) {
    const raw = expiryMatch[1];
    const year = 2000 + parseInt(raw.substring(0, 2));
    const month = parseInt(raw.substring(2, 4)) - 1;
    const day = parseInt(raw.substring(4, 6)) || 28;
    result.expiryDate = new Date(year, month, day);
  }

  // (01) = GTIN / NDC
  const ndcMatch = text.match(/\(01\)(\d{14})/);
  if (ndcMatch) result.ndcCode = ndcMatch[1];

  // Fallback: look for common patterns
  if (!result.lotNumber) {
    const fallbackLot = text.match(/LOT[:\s]*([A-Za-z0-9]+)/i);
    if (fallbackLot) result.lotNumber = fallbackLot[1];
  }

  if (!result.expiryDate) {
    const fallbackExp = text.match(/EXP[:\s]*(\d{2})[\/-](\d{2,4})/i);
    if (fallbackExp) {
      const month = parseInt(fallbackExp[1]) - 1;
      const year = parseInt(fallbackExp[2]) + (fallbackExp[2].length === 2 ? 2000 : 0);
      result.expiryDate = new Date(year, month, 28);
    }
  }

  return result;
}
