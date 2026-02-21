import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ExploreSection } from '@/components/t1d-companion/ExploreSection';
import { T1DChat } from '@/components/t1d-companion/T1DChat';
import { MySavedIssues } from '@/components/t1d-companion/MySavedIssues';
import { ChatHistoryList } from '@/components/chat/ChatHistoryList';
import { SavedIssue } from '@/hooks/useSavedIssues';
import { useAuthStore } from '@/store/authStore';
import { Sparkles, Compass, MessageSquare, Bookmark, History } from 'lucide-react';

interface ChatContext {
  initialMessage: string;
  context: {
    title: string;
    description: string;
    category: string;
  };
  sessionId?: string;
}

export default function T1DCompanion() {
  const [activeTab, setActiveTab] = useState('explore');
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [chatKey, setChatKey] = useState(0); // Force re-mount when loading sessions
  const { user } = useAuthStore();

  const handleSelectIssue = (issue: any) => {
    setChatContext({
      initialMessage: `I'm dealing with ${issue.title.toLowerCase()}. ${issue.description || ''} What tips do you have?`,
      context: {
        title: issue.title,
        description: issue.description || '',
        category: issue.category,
      },
    });
    setChatKey(prev => prev + 1);
    setActiveTab('chat');
  };

  const handleChatWithSavedIssue = (issue: SavedIssue) => {
    setChatContext({
      initialMessage: `I want to continue discussing my issue: ${issue.title}. ${issue.description || ''}`,
      context: {
        title: issue.title,
        description: issue.description || '',
        category: issue.category || '',
      },
    });
    setChatKey(prev => prev + 1);
    setActiveTab('chat');
  };

  const handleSelectSession = (session: any) => {
    // Load the existing session instead of starting a new one
    setChatContext({
      initialMessage: '', // Don't send a new message
      context: {
        title: session.context_name || 'Chat',
        description: '',
        category: session.context_type || 'general',
      },
      sessionId: session.id, // Pass the session ID to load
    });
    setChatKey(prev => prev + 1);
    setActiveTab('chat');
  };

  const handleStartNewChat = () => {
    setChatContext(null);
    setChatKey(prev => prev + 1);
    setActiveTab('chat');
  };

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">T1D Companion</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Your AI-powered assistant for Type 1 Diabetes challenges. Get practical tips and solutions 
            from the T1D community, track your issues, and find what works for others.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full mb-6 ${user ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="explore" className="gap-2">
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Explore</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="my-issues" className="gap-2">
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">My Issues</span>
            </TabsTrigger>
            {user && (
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            )}
          </TabsList>

          <Card className="p-6">
            <TabsContent value="explore" className="mt-0">
              <ExploreSection onSelectIssue={handleSelectIssue} />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <T1DChat
                key={chatKey}
                initialMessage={chatContext?.sessionId ? undefined : chatContext?.initialMessage}
                initialContext={chatContext?.context}
                sessionId={chatContext?.sessionId}
              />
            </TabsContent>

            <TabsContent value="my-issues" className="mt-0">
              <MySavedIssues onChatWithIssue={handleChatWithSavedIssue} />
            </TabsContent>

            {user && (
              <TabsContent value="history" className="mt-0">
                <ChatHistoryList
                  onSelectSession={handleSelectSession}
                />
              </TabsContent>
            )}
          </Card>
        </Tabs>
      </div>
    </Layout>
  );
}
