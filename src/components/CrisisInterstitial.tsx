/**
 * Phase 11.3: Mental Health Crisis Interstitial
 * Shows 988 Suicide & Crisis Lifeline and other resources
 */
import { AlertTriangle, Phone, MessageSquare, ExternalLink, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CRISIS_INTERSTITIAL } from '@/utils/medicalCompliance';

interface CrisisInterstitialProps {
  open: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

export function CrisisInterstitial({ open, onClose, onContinue }: CrisisInterstitialProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <Heart className="h-6 w-6" />
            <DialogTitle className="text-xl">{CRISIS_INTERSTITIAL.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {CRISIS_INTERSTITIAL.message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {CRISIS_INTERSTITIAL.resources.map((resource) => (
            <a
              key={resource.name}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors"
            >
              {resource.url.startsWith('tel:') ? (
                <Phone className="h-5 w-5 text-destructive shrink-0" />
              ) : resource.url.startsWith('sms:') ? (
                <MessageSquare className="h-5 w-5 text-destructive shrink-0" />
              ) : (
                <ExternalLink className="h-5 w-5 text-destructive shrink-0" />
              )}
              <div>
                <div className="font-semibold text-sm">{resource.name}</div>
                <div className="text-xs text-muted-foreground">{resource.action}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground text-center">
            You are not alone. Help is available 24/7.
          </p>
          {onContinue && (
            <Button variant="ghost" size="sm" onClick={onContinue} className="text-xs">
              Continue to chat
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
