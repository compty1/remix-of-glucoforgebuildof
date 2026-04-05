import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const MedicalDisclaimer: React.FC<{ className?: string }> = ({ className }) => (
  <Alert className={`border-warning/20 bg-warning/5 ${className || ''}`}>
    <AlertTriangle className="h-4 w-4 text-warning" />
    <AlertDescription className="text-xs text-muted-foreground">
      <strong>Medical Disclaimer:</strong> This information is for educational purposes only and does not constitute medical advice. 
      Always consult your healthcare provider before making changes to your diabetes management.
    </AlertDescription>
  </Alert>
);
