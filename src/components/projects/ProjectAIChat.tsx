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
  History,
  FileText,
  Users
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ProjectAIChatProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  projectSymptoms?: string[];
  projectCauses?: string[];
  researchCount: number;
  solutionsCount: number;
}

export function ProjectAIChat({ 
  projectId, 
  projectTitle,
  projectDescription,
  projectSymptoms,
  projectCauses,
  researchCount,
  solutionsCount,
}: ProjectAIChatProps) {
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
  } = useActiveChat('project', projectId, projectTitle);

  const quickPrompts = [
    'What causes this?',
    'How to manage this?',
    'What has worked for others?',
    'Is this related to blood sugar?',
    'When should I see a doctor?',
  ];

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
      projectContext: {
        title: projectTitle,
        description: projectDescription,
        symptoms: projectSymptoms,
        possible_causes: projectCauses,
      },
    });
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleSelectQuestion = (question: string) => {
    sendMessage(question, {
      projectContext: {
        title: projectTitle,
        description: projectDescription,
        symptoms: projectSymptoms,
        possible_causes: projectCauses,
      },
    });
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium">Discuss with AI</span>
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
                    filterType="project"
                    contextId={projectId}
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

      {/* Project context badges */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        <Badge variant="outline">{projectTitle}</Badge>
        {researchCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" />
            {researchCount} research papers
          </Badge>
        )}
        {solutionsCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {solutionsCount} community solutions
          </Badge>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4 text-sm">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Research & community insights.</strong> These answers draw from scientific papers and community experiences. Always consult your healthcare team.
        </p>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">Let's discuss: {projectTitle}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              I can help you understand this condition using research papers and community experiences.
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
          placeholder={`Ask about ${projectTitle}...`}
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
