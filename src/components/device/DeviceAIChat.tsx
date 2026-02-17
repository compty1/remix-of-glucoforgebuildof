import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useActiveChat } from '@/hooks/useChatSessions';
import { ChatMessage } from '@/components/t1d-companion/ChatMessage';
import { SuggestedQuestions } from '@/components/chat/SuggestedQuestions';
import { ChatHistoryList } from '@/components/chat/ChatHistoryList';
import { 
  Send, 
  Loader2, 
  RefreshCw, 
  AlertTriangle,
  MessageSquare,
  Bot,
  History
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface DeviceIssue {
  issue_title: string;
  description: string | null;
}

interface DeviceAIChatProps {
  deviceId: string;
  deviceName: string;
  deviceCategory: string | null;
  deviceManufacturer: string | null;
  deviceIssues: DeviceIssue[];
}

const getQuickPrompts = (category: string | null): string[] => {
  const commonPrompts = [
    'How do I improve accuracy?',
    'Troubleshoot connection issues',
  ];
  
  switch (category?.toLowerCase()) {
    case 'cgm':
      return [
        'Sensor accuracy on day 1',
        'Best adhesive solutions',
        'Calibration tips',
        'Compression lows',
        ...commonPrompts,
      ];
    case 'pump':
      return [
        'Occlusion alert solutions',
        'Best infusion sites',
        'Site rotation tips',
        'Absorption issues',
        ...commonPrompts,
      ];
    case 'closed loop':
      return [
        'Sleep mode settings',
        'Exercise mode tips',
        'Override strategies',
        'Target adjustments',
        ...commonPrompts,
      ];
    default:
      return [
        'Setup and configuration',
        'Common issues',
        'Battery life tips',
        ...commonPrompts,
      ];
  }
};

export function DeviceAIChat({ 
  deviceId, 
  deviceName, 
  deviceCategory,
  deviceManufacturer,
  deviceIssues 
}: DeviceAIChatProps) {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuthStore();
  
  const {
    messages,
    isLoading,
    suggestedQuestions,
    sendMessage,
    loadSession,
    startNewChat,
  } = useActiveChat('device', deviceId, deviceName);

  const quickPrompts = getQuickPrompts(deviceCategory);

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
    await sendMessage(message, {
      deviceContext: {
        name: deviceName,
        category: deviceCategory,
        manufacturer: deviceManufacturer,
        issues: deviceIssues.slice(0, 5),
      },
    });
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleSelectQuestion = (question: string) => {
    sendMessage(question, {
      deviceContext: {
        name: deviceName,
        category: deviceCategory,
        manufacturer: deviceManufacturer,
        issues: deviceIssues.slice(0, 5),
      },
    });
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium">AI Assistant</span>
          <Badge variant="secondary">{deviceName}</Badge>
        </div>
        <div className="flex gap-2">
          {user && (
            <Sheet open={showHistory} onOpenChange={setShowHistory}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <History className="h-4 w-4" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Past Conversations</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ChatHistoryList
                    filterType="device"
                    contextId={deviceId}
                    onSelectSession={(session) => {
                      loadSession(session.id);
                      setShowHistory(false);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewChat}
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg mb-4 text-sm">
        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Community tips for your {deviceName}.</strong> These suggestions come from real users. Always consult your healthcare team.
        </p>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">Ask me about your {deviceName}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Get troubleshooting tips, best practices, and solutions from the T1D community.
            </p>
            
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {quickPrompts.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(prompt)}
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
            
            {/* Suggested follow-up questions */}
            {!isLoading && suggestedQuestions.length > 0 && (
              <SuggestedQuestions
                questions={suggestedQuestions}
                onSelectQuestion={handleSelectQuestion}
              />
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
          placeholder={`Ask about your ${deviceName}...`}
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
    </div>
  );
}
