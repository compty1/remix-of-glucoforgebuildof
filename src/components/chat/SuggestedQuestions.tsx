import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  isLoading?: boolean;
}

export function SuggestedQuestions({ 
  questions, 
  onSelectQuestion,
  isLoading = false 
}: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-2 pt-3 border-t border-border/50">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Suggested follow-ups</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelectQuestion(question)}
            disabled={isLoading}
            className="text-xs h-auto py-1.5 px-3 whitespace-normal text-left justify-start"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
