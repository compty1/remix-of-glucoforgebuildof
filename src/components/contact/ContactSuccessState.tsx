import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ContactSuccessStateProps {
  onReset: () => void;
}

export function ContactSuccessState({ onReset }: ContactSuccessStateProps) {
  return (
    <Card className="text-center">
      <CardContent className="py-12 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
        <h3 className="text-2xl font-semibold">Message Sent!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for reaching out. We've received your message and will respond within 24 hours during business days.
        </p>
        <Button variant="outline" onClick={onReset} className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Send Another Message
        </Button>
      </CardContent>
    </Card>
  );
}
