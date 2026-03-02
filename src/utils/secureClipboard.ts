/**
 * Wave 10.1: Clipboard Auto-Clear
 * Clears the clipboard after sensitive data is copied
 * to prevent background app hijacking.
 */

const CLIPBOARD_CLEAR_DELAY_MS = 30000; // 30 seconds

let clearTimerId: ReturnType<typeof setTimeout> | null = null;

/**
 * Copy text to clipboard and auto-clear after delay.
 * Use for API keys, medical doses, and other sensitive values.
 */
export async function secureCopyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    // Cancel any pending clear
    if (clearTimerId) clearTimeout(clearTimerId);

    // Schedule clipboard clear
    clearTimerId = setTimeout(async () => {
      try {
        await navigator.clipboard.writeText('');
      } catch {
        // Clipboard API may fail if tab is not focused
      }
      clearTimerId = null;
    }, CLIPBOARD_CLEAR_DELAY_MS);

    return true;
  } catch {
    return false;
  }
}
