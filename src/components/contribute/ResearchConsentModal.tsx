import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileCheck, Lock, Users } from 'lucide-react';

interface ResearchConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyTitle: string;
  consentText?: string;
  onConsent: () => void;
}

const defaultConsentText = `By participating in this research survey, you acknowledge and agree to the following:

**Purpose of Data Collection**
Your responses will be collected to support research aimed at improving the understanding, treatment, and quality of life for people living with Type 1 Diabetes. This data may be shared with medical institutions, researchers, and advocacy organizations.

**Anonymity & Privacy**
• All responses are collected anonymously
• No personally identifiable information (PII) is required
• Your user account is not linked to your survey responses in any identifiable way
• Data is stored securely using industry-standard encryption

**Data Usage**
Your anonymized responses may be:
• Aggregated with other responses for statistical analysis
• Used in research publications and presentations
• Shared with partner research institutions
• Used to inform advocacy efforts and policy recommendations

**Your Rights**
• Participation is completely voluntary
• You may skip any question you prefer not to answer
• You may stop the survey at any time
• You may request deletion of your responses by contacting support

**Benefits**
By contributing your experience, you help:
• Advance T1D research and understanding
• Improve device and treatment development
• Inform healthcare policy decisions
• Support the T1D community`;

export const ResearchConsentModal = ({
  open,
  onOpenChange,
  surveyTitle,
  consentText,
  onConsent,
}: ResearchConsentModalProps) => {
  const [agreed, setAgreed] = useState(false);
  const [understoodAnonymity, setUnderstoodAnonymity] = useState(false);

  const handleConsent = () => {
    if (agreed && understoodAnonymity) {
      onConsent();
      onOpenChange(false);
      // Reset for next time
      setAgreed(false);
      setUnderstoodAnonymity(false);
    }
  };

  const handleClose = () => {
    setAgreed(false);
    setUnderstoodAnonymity(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Research Participation Consent
          </DialogTitle>
          <DialogDescription>
            Before participating in "{surveyTitle}", please review and acknowledge the following
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 py-4">
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 text-center">
            <Lock className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Encrypted</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 text-center">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Anonymous</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 text-center">
            <FileCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Research Grade</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 text-center">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Your Rights</span>
          </div>
        </div>

        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {(consentText || defaultConsentText).split('\n\n').map((paragraph, idx) => (
              <div key={idx} className="mb-4">
                {paragraph.startsWith('**') ? (
                  <h4 className="font-semibold text-foreground mb-2">
                    {paragraph.replace(/\*\*/g, '')}
                  </h4>
                ) : paragraph.startsWith('•') ? (
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {paragraph.split('\n').map((item, i) => (
                      <li key={i}>{item.replace('• ', '')}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">{paragraph}</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent-agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <Label htmlFor="consent-agree" className="text-sm leading-relaxed cursor-pointer">
              I have read and understand the above information about data collection and usage, and I voluntarily agree to participate in this research survey.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent-anonymity"
              checked={understoodAnonymity}
              onCheckedChange={(checked) => setUnderstoodAnonymity(checked === true)}
            />
            <Label htmlFor="consent-anonymity" className="text-sm leading-relaxed cursor-pointer">
              I understand that my responses are anonymous and will be used to support Type 1 Diabetes research and advocacy.
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConsent}
            disabled={!agreed || !understoodAnonymity}
          >
            I Consent - Continue to Survey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
