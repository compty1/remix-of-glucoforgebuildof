import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MedicalDisclaimerProps {
  context?: string;
}

export function MedicalDisclaimer({ context }: MedicalDisclaimerProps) {
  return (
    <Alert className="border-warning/50 bg-warning/5">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="text-sm text-muted-foreground">
        <strong>Not medical advice.</strong> {context || 'The information provided here is for educational and informational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment.'} Always consult your healthcare provider before making changes to your diabetes management.
      </AlertDescription>
    </Alert>
  );
}
