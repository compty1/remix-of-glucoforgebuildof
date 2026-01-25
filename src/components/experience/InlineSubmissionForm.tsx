import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitExperience } from '@/hooks/useExperienceSubmissions';
import { toast } from 'sonner';

interface InlineSubmissionFormProps {
  category: 'good' | 'bad' | 'daily_tasks' | 'fears' | 'embarrassing_lows';
  onSuccess?: () => void;
  placeholder?: string;
}

export function InlineSubmissionForm({ category, onSuccess, placeholder }: InlineSubmissionFormProps) {
  const [content, setContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const submitMutation = useSubmitExperience();

  const categoryLabels: Record<string, string> = {
    good: 'Share a good experience...',
    bad: 'Share a challenging experience...',
    daily_tasks: 'What autonomous task do you do daily?',
    fears: 'What fear or worry do you have?',
    embarrassing_lows: 'Share an embarrassing low story...',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await submitMutation.mutateAsync({
        content: content.trim(),
        category,
        isAnonymous: true,
      });
      
      setContent('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      toast.success('Experience shared! Thank you 💙');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || categoryLabels[category]}
          className="min-h-[80px] pr-12 resize-none"
          maxLength={500}
        />
        <div className="absolute bottom-2 right-2">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <CheckCircle className="h-6 w-6 text-success" />
              </motion.div>
            ) : (
              <Button
                key="submit"
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!content.trim() || submitMutation.isPending}
                className="h-8 w-8"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-right">
        {content.length}/500 characters
      </p>
    </form>
  );
}
