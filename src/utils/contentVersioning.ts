/**
 * Phase 17.4: Content Versioning & Edit History
 * Client-side utilities for tracking post revisions and computing diffs.
 */

export interface PostRevision {
  id: string;
  postId: string;
  previousContent: string;
  newContent: string;
  previousTitle?: string;
  newTitle?: string;
  editedAt: string;
  editedBy: string;
  editReason?: string;
}

/**
 * Simple line-level diff for displaying changes.
 */
export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export function computeSimpleDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: DiffLine[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      result.push({ type: 'unchanged', text: oldLine ?? '' });
    } else {
      if (oldLine !== undefined) {
        result.push({ type: 'removed', text: oldLine });
      }
      if (newLine !== undefined) {
        result.push({ type: 'added', text: newLine });
      }
    }
  }

  return result;
}

/**
 * Calculate time since last edit in human-readable form.
 */
export function timeSinceEdit(editedAt: string): string {
  const diff = Date.now() - new Date(editedAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
