import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';

interface IdleWarningDialogProps {
  open: boolean;
  secondsLeft: number;
  onStayActive: () => void;
}

export function IdleWarningDialog({ open, secondsLeft, onStayActive }: IdleWarningDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" aria-hidden="true" />
            Session Timeout Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            You've been inactive for a while. For your security, you'll be signed out in{' '}
            <span className="font-bold text-foreground">{secondsLeft} seconds</span>.
            <br />
            Click below to stay signed in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onStayActive}>
            Stay Signed In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
