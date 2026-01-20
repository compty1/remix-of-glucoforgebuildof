import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

export type ContextType = 'device' | 'project' | 'general';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{
    title: string;
    url: string | null;
    source: string;
    score: number | null;
  }>;
}

export interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  context_type: ContextType;
  context_id: string | null;
  context_name: string | null;
  summary: string | null;
  suggested_questions: string[];
  created_at: string;
  updated_at: string;
  saved_issue_id: string | null;
}

interface CreateSessionParams {
  context_type: ContextType;
  context_id?: string;
  context_name?: string;
  messages?: ChatMessage[];
}

interface UpdateSessionParams {
  messages: ChatMessage[];
  suggested_questions?: string[];
  summary?: string;
}

export function useChatSessions(contextType?: ContextType, contextId?: string) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all sessions for the user, optionally filtered by context
  const { data: sessions, isLoading, error, refetch } = useQuery({
    queryKey: ['chat-sessions', user?.id, contextType, contextId],
    queryFn: async (): Promise<ChatSession[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (contextType) {
        query = query.eq('context_type', contextType);
      }

      if (contextId) {
        query = query.eq('context_id', contextId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(session => ({
        ...session,
        context_type: (session.context_type || 'general') as ContextType,
        messages: (session.messages as unknown as ChatMessage[]) || [],
        suggested_questions: (session.suggested_questions as unknown as string[]) || [],
      }));
    },
    enabled: !!user?.id,
  });

  // Get a single session by ID
  const getSession = useCallback(async (sessionId: string): Promise<ChatSession | null> => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return {
      ...data,
      context_type: (data.context_type || 'general') as ContextType,
      messages: (data.messages as unknown as ChatMessage[]) || [],
      suggested_questions: (data.suggested_questions as unknown as string[]) || [],
    };
  }, []);

  // Create a new session
  const createSession = useMutation({
    mutationFn: async (params: CreateSessionParams): Promise<ChatSession> => {
      if (!user?.id) throw new Error('User not authenticated');

      const insertData = {
        user_id: user.id,
        context_type: params.context_type,
        context_id: params.context_id || null,
        context_name: params.context_name || null,
        messages: (params.messages || []) as unknown as Record<string, unknown>[],
        suggested_questions: [] as unknown[],
      };

      const { data, error } = await (supabase as any)
        .from('chat_sessions')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return {
        ...(data as any),
        context_type: (data.context_type || 'general') as ContextType,
        messages: (data.messages as unknown as ChatMessage[]) || [],
        suggested_questions: (data.suggested_questions as unknown as string[]) || [],
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create chat session',
        variant: 'destructive',
      });
      console.error('Create session error:', error);
    },
  });

  // Update an existing session
  const updateSession = useMutation({
    mutationFn: async ({ sessionId, params }: { sessionId: string; params: UpdateSessionParams }): Promise<void> => {
      const updateData: Record<string, unknown> = {
        messages: params.messages as unknown as Record<string, unknown>[],
        updated_at: new Date().toISOString(),
      };

      if (params.suggested_questions) {
        updateData.suggested_questions = params.suggested_questions;
      }

      if (params.summary) {
        updateData.summary = params.summary;
      }

      const { error } = await supabase
        .from('chat_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
    onError: (error) => {
      console.error('Update session error:', error);
    },
  });

  // Delete a session
  const deleteSession = useMutation({
    mutationFn: async (sessionId: string): Promise<void> => {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      toast({
        title: 'Deleted',
        description: 'Chat session deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete chat session',
        variant: 'destructive',
      });
      console.error('Delete session error:', error);
    },
  });

  // Search through chat history
  const searchSessions = useCallback(async (query: string): Promise<ChatSession[]> => {
    if (!user?.id || !query.trim()) return sessions || [];

    // Filter sessions that contain the search query in messages or summary
    return (sessions || []).filter(session => {
      const queryLower = query.toLowerCase();
      
      // Check summary
      if (session.summary?.toLowerCase().includes(queryLower)) return true;
      
      // Check context name
      if (session.context_name?.toLowerCase().includes(queryLower)) return true;
      
      // Check messages
      return session.messages.some(msg => 
        msg.content.toLowerCase().includes(queryLower)
      );
    });
  }, [sessions, user?.id]);

  return {
    sessions: sessions || [],
    isLoading,
    error,
    refetch,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    searchSessions,
  };
}

// Hook for managing a single active chat session
export function useActiveChat(
  contextType: ContextType,
  contextId?: string,
  contextName?: string
) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { createSession, updateSession, getSession } = useChatSessions();

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/t1d-companion-chat`;

  // Load an existing session
  const loadSession = useCallback(async (sessionId: string) => {
    const session = await getSession(sessionId);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      setSuggestedQuestions(session.suggested_questions);
    }
  }, [getSession]);

  // Start a new chat
  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
    setSuggestedQuestions([]);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    content: string,
    additionalContext?: {
      deviceContext?: {
        name: string;
        category: string | null;
        manufacturer: string | null;
        issues?: Array<{ issue_title: string; description: string | null }>;
      };
      projectContext?: {
        title: string;
        description: string;
        symptoms?: string[];
        possible_causes?: string[];
      };
    }
  ) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantContent = '';

    try {
      // Create session if this is a new chat
      let sessionId = currentSessionId;
      if (!sessionId && user?.id) {
        const session = await createSession.mutateAsync({
          context_type: contextType,
          context_id: contextId,
          context_name: contextName,
          messages: newMessages,
        });
        sessionId = session.id;
        setCurrentSessionId(sessionId);
      }

      // Prepare API request
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          contextType,
          deviceContext: additionalContext?.deviceContext,
          projectContext: additionalContext?.projectContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      const updateAssistantMessage = (chunk: string) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, content: assistantContent }
                : m
            );
          }
          return [...prev, {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString(),
          }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistantMessage(content);
            
            // Check for suggested questions in the response
            if (parsed.suggested_questions) {
              setSuggestedQuestions(parsed.suggested_questions);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save the updated messages to the session
      const finalMessages: ChatMessage[] = [
        ...newMessages,
        {
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date().toISOString(),
        },
      ];

      setMessages(finalMessages);

      if (sessionId) {
        await updateSession.mutateAsync({
          sessionId,
          params: {
            messages: finalMessages,
            suggested_questions: suggestedQuestions,
          },
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
      // Remove the user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, currentSessionId, user?.id, contextType, contextId, contextName, createSession, updateSession, suggestedQuestions, toast]);

  const getLastAssistantMessage = useCallback(() => {
    return messages.filter(m => m.role === 'assistant').pop()?.content || '';
  }, [messages]);

  return {
    messages,
    isLoading,
    suggestedQuestions,
    currentSessionId,
    sendMessage,
    loadSession,
    startNewChat,
    getLastAssistantMessage,
    setSuggestedQuestions,
  };
}
