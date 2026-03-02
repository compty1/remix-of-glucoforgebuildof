/**
 * Wave 6.5: UTF-16LE Encoding Detection
 * Windows Dexcom CSVs use UTF-16LE encoding with BOM.
 * Detects and decodes before parsing.
 */

/**
 * Detect encoding from file ArrayBuffer and return decoded string.
 * Handles UTF-16LE (BOM: FF FE), UTF-16BE (BOM: FE FF), and UTF-8.
 */
export function decodeFileContent(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // Check for UTF-16LE BOM: FF FE
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return new TextDecoder('utf-16le').decode(buffer);
  }

  // Check for UTF-16BE BOM: FE FF
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return new TextDecoder('utf-16be').decode(buffer);
  }

  // Check for UTF-8 BOM: EF BB BF
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return new TextDecoder('utf-8').decode(buffer);
  }

  // Default: UTF-8
  return new TextDecoder('utf-8').decode(buffer);
}

/**
 * Detect encoding from raw string content (for cases where FileReader.readAsText was used).
 * Returns true if content appears to be incorrectly decoded UTF-16.
 */
export function looksLikeMisdecodedUTF16(content: string): boolean {
  // UTF-16LE misread as UTF-8 produces null bytes between ASCII chars
  const nullByteRatio = (content.match(/\0/g) || []).length / content.length;
  return nullByteRatio > 0.2;
}
