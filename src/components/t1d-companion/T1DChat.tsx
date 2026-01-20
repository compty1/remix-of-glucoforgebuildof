import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { useSavedIssues } from '@/hooks/useSavedIssues';
import { useActiveChat } from '@/hooks/useChatSessions';
import { ChatMessage } from './ChatMessage';
import { SuggestedQuestions } from '@/components/chat/SuggestedQuestions';
import { 
  Send, 
  Loader2, 
  Bookmark, 
  RefreshCw, 
  AlertTriangle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface T1DChatProps {
  initialMessage?: string;
  initialContext?: {
    title: string;
    description: string;
    category: string;
  };
  sessionId?: string;
}

const SUGGESTED_PROMPTS = [
  "I keep going low in the mornings",
  "How do I prevent post-meal spikes?",
  "Tips for traveling with diabetes",
  "My CGM sensor keeps falling off",
  "How to handle exercise lows",
];

const CATEGORIES = [
  'Glucose Patterns',
  'Device Issues',
  'Lifestyle',
  'Emotional',
  'Technical',
];

export function T1DChat({ initialMessage, initialContext, sessionId }: T1DChatProps) {
  const [input, setInput] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueCategory, setIssueCategory] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // Use the persistent chat hook instead of local state
  const { 
    messages, 
    isLoading, 
    suggestedQuestions,
    sendMessage, 
    startNewChat, 
    loadSession,
    getLastAssistantMessage 
  } = useActiveChat('general', undefined, initialContext?.title || 'T1D Companion');
  
  const { createIssue } = useSavedIssues();

  // Load session if sessionId is provided
  useEffect(() => {
    if (sessionId && !hasInitialized) {
      loadSession(sessionId);
      setHasInitialized(true);
    }
  }, [sessionId, loadSession, hasInitialized]);

  // Handle initial message from explore section
  useEffect(() => {
    if (initialMessage && messages.length === 0 && !hasInitialized && !sessionId) {
      sendMessage(initialMessage);
      setHasInitialized(true);
    }
  }, [initialMessage, messages.length, sendMessage, hasInitialized, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleSelectQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleNewChat = () => {
    startNewChat();
    setHasInitialized(false);
  };

  const handleSaveIssue = async () => {
    if (!issueTitle.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your issue.',
        variant: 'destructive',
      });
      return;
    }

    await createIssue.mutateAsync({
      title: issueTitle,
      description: issueDescription || undefined,
      category: issueCategory || undefined,
    });

    setShowSaveDialog(false);
    setIssueTitle('');
    setIssueDescription('');
    setIssueCategory('');
  };

  const openSaveDialog = () => {
    // Pre-fill with context if available
    if (initialContext) {
      setIssueTitle(initialContext.title);
      setIssueDescription(initialContext.description);
      setIssueCategory(initialContext.category);
    } else if (messages.length > 0) {
      // Use the first user message as the title
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        setIssueTitle(firstUserMessage.content.slice(0, 100));
      }
    }
    setShowSaveDialog(true);
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">T1D Companion Chat</span>
          {initialContext && (
            <Badge variant="secondary">{initialContext.title}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {user && messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={openSaveDialog}
              className="gap-1"
            >
              <Bookmark className="h-4 w-4" />
              Save Issue
            </Button>
          )}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4 text-sm">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Community tips, not medical advice.</strong> All suggestions come from T1D community experiences. Always consult your healthcare team before making changes.
        </p>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">Start a Conversation</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Ask about any diabetes-related challenge and get practical tips from the T1D community.
            </p>
            
            {/* Suggested Prompts */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, i) => (
              <ChatMessage
                key={i}
                role={message.role}
                content={message.content}
                timestamp={new Date(message.timestamp)}
                isStreaming={isLoading && i === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
            
            {/* Suggested Questions */}
            {!isLoading && suggestedQuestions.length > 0 && (
              <div className="mt-4">
                <SuggestedQuestions 
                  questions={suggestedQuestions} 
                  onSelectQuestion={handleSelectQuestion} 
                />
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any T1D challenge..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={!input.trim() || isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Save Issue Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save This Issue</DialogTitle>
            <DialogDescription>
              Save this issue to track solutions and continue the conversation later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issue-title">Title</Label>
              <Input
                id="issue-title"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="e.g., Morning Lows"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-description">Description (optional)</Label>
              <Textarea
                id="issue-description"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe your specific challenge..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-category">Category (optional)</Label>
              <Select value={issueCategory} onValueChange={setIssueCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIssue} disabled={createIssue.isPending}>
              {createIssue.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Bookmark className="h-4 w-4 mr-2" />
              )}
              Save Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
