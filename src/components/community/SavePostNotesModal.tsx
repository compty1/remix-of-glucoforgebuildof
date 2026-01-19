import React, { useState, useEffect } from 'react';
import { StickyNote } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SavePostNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string | null) => void;
  initialNotes?: string | null;
  postTitle?: string;
  isSaving?: boolean;
}

const MAX_CHARS = 500;

export const SavePostNotesModal: React.FC<SavePostNotesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNotes = '',
  postTitle,
  isSaving = false,
}) => {
  const [notes, setNotes] = useState(initialNotes || '');

  useEffect(() => {
    setNotes(initialNotes || '');
  }, [initialNotes, isOpen]);

  const handleSave = () => {
    onSave(notes.trim() || null);
  };

  const handleSkip = () => {
    onSave(null);
  };

  const remainingChars = MAX_CHARS - notes.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            {initialNotes ? 'Edit Note' : 'Add a Note'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {postTitle && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              "{postTitle}"
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Your personal note (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Why are you saving this? Any thoughts or reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, MAX_CHARS))}
              rows={4}
              className="resize-none"
            />
            <p className={`text-xs ${remainingChars < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remainingChars} characters remaining
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {!initialNotes && (
            <Button variant="ghost" onClick={handleSkip} disabled={isSaving}>
              Skip
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
