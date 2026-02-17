import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSend: (message?: string) => void;
  isSending: boolean;
}

export const ConnectionRequestModal: React.FC<Props> = ({ open, onClose, onSend, isSending }) => {
  const [message, setMessage] = useState('');

  // Clear draft when modal opens
  useEffect(() => {
    if (open) setMessage('');
  }, [open]);

  const handleSend = () => {
    onSend(message || undefined);
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Send Connection Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label>Message (optional)</Label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Hi! I'm also T1D and live nearby..."
              maxLength={300}
            />
          </div>
          <Button onClick={handleSend} disabled={isSending} className="w-full">
            <Send className="h-4 w-4 mr-1" />
            {isSending ? 'Sending...' : 'Send Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
