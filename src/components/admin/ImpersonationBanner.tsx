/**
 * Phase 17.1: Admin Impersonation Banner
 * Persistent red banner shown when admin is viewing as another user (read-only).
 */
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ImpersonationBannerProps {
  targetUserEmail?: string;
  targetUserId: string;
  onExit: () => void;
}

export function ImpersonationBanner({ targetUserEmail, targetUserId, onExit }: ImpersonationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between text-sm font-medium shadow-lg"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          READ-ONLY: Viewing as {targetUserEmail || targetUserId.slice(0, 8) + '…'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onExit}
          className="underline hover:no-underline text-xs"
        >
          Exit Impersonation
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
