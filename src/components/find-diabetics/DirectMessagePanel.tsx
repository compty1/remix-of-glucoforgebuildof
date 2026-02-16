import React, { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useConversation, useSendMessage, useMarkAsRead } from '@/hooks/useDirectMessages';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DirectMessagePanelProps {
  open: boolean;
  onClose: () => void;
  otherUserId: string | null;
  otherUserName: string;
}

export function DirectMessagePanel({ open, onClose, otherUserId, otherUserName }: DirectMessagePanelProps) {
  const { user } = useAuthStore();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useConversation(open ? otherUserId : null);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // Mark messages as read when panel opens
  useEffect(() => {
    if (open && otherUserId) {
      markAsRead.mutate(otherUserId);
    }
  }, [open, otherUserId, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim() || !otherUserId) return;
    sendMessage.mutate({ receiverId: otherUserId, content: draft.trim() });
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-base">Chat with {otherUserName}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-2" ref={scrollRef as any}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No messages yet. Say hello! 👋
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p
                        className={cn(
                          'text-[10px] mt-1',
                          isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!draft.trim() || sendMessage.isPending}
            className="shrink-0"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
