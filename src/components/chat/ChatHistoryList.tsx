import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Monitor, 
  FileText,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useChatSessions, ChatSession, ContextType } from '@/hooks/useChatSessions';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ChatHistoryListProps {
  onSelectSession: (session: ChatSession) => void;
  filterType?: ContextType;
  contextId?: string;
}

export function ChatHistoryList({ 
  onSelectSession, 
  filterType,
  contextId 
}: ChatHistoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContextType | 'all'>(filterType || 'all');
  
  const { sessions, isLoading, deleteSession } = useChatSessions(
    filterType,
    contextId
  );

  // Filter and group sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(s => s.context_type === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => {
        if (session.summary?.toLowerCase().includes(query)) return true;
        if (session.context_name?.toLowerCase().includes(query)) return true;
        return session.messages.some(m => 
          m.content.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [sessions, activeFilter, searchQuery]);

  // Group sessions by time period
  const groupedSessions = useMemo(() => {
    const groups: { today: ChatSession[]; thisWeek: ChatSession[]; earlier: ChatSession[] } = {
      today: [],
      thisWeek: [],
      earlier: [],
    };

    filteredSessions.forEach(session => {
      const date = parseISO(session.updated_at);
      if (isToday(date)) {
        groups.today.push(session);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(session);
      } else {
        groups.earlier.push(session);
      }
    });

    return groups;
  }, [filteredSessions]);

  const getContextIcon = (type: ContextType) => {
    switch (type) {
      case 'device':
        return <Monitor className="h-4 w-4" />;
      case 'project':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getContextLabel = (type: ContextType) => {
    switch (type) {
      case 'device':
        return 'Device';
      case 'project':
        return 'Project';
      default:
        return 'General';
    }
  };

  const getSessionPreview = (session: ChatSession): string => {
    const firstUserMessage = session.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 80) + (firstUserMessage.content.length > 80 ? '...' : '');
    }
    return session.summary || 'No messages';
  };

  const renderSessionItem = (session: ChatSession) => (
    <div
      key={session.id}
      className="group flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={() => onSelectSession(session)}
    >
      <div className="flex-shrink-0 p-2 bg-muted rounded-md">
        {getContextIcon(session.context_type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {session.context_name && (
            <span className="font-medium text-sm truncate">
              {session.context_name}
            </span>
          )}
          <Badge variant="secondary" className="text-[10px] h-4">
            {getContextLabel(session.context_type)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {getSessionPreview(session)}
        </p>
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {format(parseISO(session.updated_at), 'MMM d, h:mm a')}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this conversation and all its messages.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteSession.mutate(session.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );

  const renderSessionGroup = (title: string, sessions: ChatSession[]) => {
    if (sessions.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h4>
        <div className="space-y-2">
          {sessions.map(renderSessionItem)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter tabs - only show if no specific type filter */}
      {!filterType && (
        <div className="flex gap-2">
          {(['all', 'device', 'project', 'general'] as const).map((type) => (
            <Button
              key={type}
              variant={activeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(type)}
              className="text-xs"
            >
              {type === 'all' ? 'All' : getContextLabel(type as ContextType)}
            </Button>
          ))}
        </div>
      )}

      {/* Sessions list */}
      <ScrollArea className="h-[400px]">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No Conversations</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? 'No conversations match your search'
                : 'Your chat history will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-6 pr-4">
            {renderSessionGroup('Today', groupedSessions.today)}
            {renderSessionGroup('This Week', groupedSessions.thisWeek)}
            {renderSessionGroup('Earlier', groupedSessions.earlier)}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
