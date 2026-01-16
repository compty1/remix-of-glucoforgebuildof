import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, timestamp, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  // Format the content with markdown-like styling
  const formatContent = (text: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((para, i) => {
      // Handle numbered lists
      if (/^\d+\./.test(para)) {
        const lines = para.split('\n');
        return (
          <div key={i} className="space-y-1">
            {lines.map((line, j) => (
              <p key={j} className="text-sm">{formatInlineStyles(line)}</p>
            ))}
          </div>
        );
      }
      
      // Handle bullet points
      if (para.startsWith('- ') || para.startsWith('• ')) {
        const lines = para.split('\n');
        return (
          <ul key={i} className="list-disc list-inside space-y-1">
            {lines.map((line, j) => (
              <li key={j} className="text-sm">{formatInlineStyles(line.replace(/^[-•]\s*/, ''))}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={i} className="text-sm">
          {formatInlineStyles(para)}
        </p>
      );
    });
  };

  const formatInlineStyles = (text: string) => {
    // Handle bold text with **
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div
      className={cn(
        'flex gap-3 py-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex-1 max-w-[80%]',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <div
          className={cn(
            'inline-block rounded-lg px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          <div className="space-y-2 text-left">
            {formatContent(content)}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
            )}
          </div>
        </div>
        <p className={cn(
          'text-xs text-muted-foreground mt-1',
          isUser ? 'text-right' : 'text-left'
        )}>
          {format(timestamp, 'h:mm a')}
        </p>
      </div>
    </div>
  );
}
