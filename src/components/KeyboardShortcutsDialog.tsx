import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: ['Ctrl', 'K'], description: 'Open search' },
  { keys: ['/'], description: 'Focus search input' },
  { keys: ['Ctrl', 'H'], description: 'Go to Home' },
  { keys: ['Ctrl', 'Shift', 'D'], description: 'Go to Devices' },
  { keys: ['Ctrl', 'Shift', 'R'], description: 'Go to Research' },
  { keys: ['Ctrl', 'Shift', 'N'], description: 'Go to News' },
  { keys: ['Ctrl', 'Shift', 'M'], description: 'Go to Medicines' },
  { keys: ['?'], description: 'Show this help' },
];

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((key, j) => (
                  <React.Fragment key={j}>
                    {j > 0 && <span className="text-xs text-muted-foreground">+</span>}
                    <kbd className="px-2 py-0.5 text-xs font-mono bg-muted rounded border border-border">
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          On macOS, use ⌘ instead of Ctrl.
        </p>
      </DialogContent>
    </Dialog>
  );
};
