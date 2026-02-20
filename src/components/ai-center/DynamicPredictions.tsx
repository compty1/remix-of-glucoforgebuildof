import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Send, Brain, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface DynamicPredictionsProps {
  onClose?: () => void;
}

export function DynamicPredictions({ onClose }: DynamicPredictionsProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const suggestedQuestions = [
    "What are the most promising cure approaches in 2026?",
    "When will we have truly automated insulin delivery?",
    "What's the future of non-invasive glucose monitoring?",
    "How close are we to beta cell regeneration therapies?",
    "What breakthroughs might happen in the next 5 years?",
  ];

  const handleAskQuestion = async (q: string) => {
    if (!q.trim()) return;
    
    setIsLoading(true);
    setResponse(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-center-predictions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ question: q }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                setResponse(fullResponse);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      toast.error('Failed to generate prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAskQuestion(question);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-highlight/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Ask AI About T1D Future
        </CardTitle>
        <CardDescription>
          Get AI-powered predictions and insights about Type 1 diabetes research, 
          technology, and treatment advances.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggested Questions */}
        {!response && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              <Lightbulb className="h-4 w-4 inline mr-1" />
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => {
                    setQuestion(q);
                    handleAskQuestion(q);
                  }}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about the future of T1D research, technology, or treatments..."
            className="min-h-[80px] flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!question.trim() || isLoading} className="self-end">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Response */}
        {response && (
          <div className="mt-4 p-4 bg-background/50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">AI Prediction</span>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground">
          These predictions are based on current research trajectories and should not be 
          taken as medical advice or guaranteed timelines. Actual outcomes may vary.
        </p>
      </CardContent>
    </Card>
  );
}
