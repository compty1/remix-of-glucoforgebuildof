import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Droplet, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubmitExperience, ExperienceCategory } from '@/hooks/useExperienceSubmissions';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const categories = [
  { value: 'good' as ExperienceCategory, label: '😊 Good Experience', description: 'Something positive about having T1D' },
  { value: 'bad' as ExperienceCategory, label: '😔 Bad Experience', description: 'A challenging or negative experience' },
  { value: 'daily_tasks' as ExperienceCategory, label: '📋 Daily Task', description: 'Something you do daily that others don\'t' },
  { value: 'fears' as ExperienceCategory, label: '😰 Fear or Worry', description: 'Release a fear into the storm' },
  { value: 'embarrassing_lows' as ExperienceCategory, label: '😅 Embarrassing Low Story', description: 'A funny or embarrassing low moment' },
];

export function SubmissionForm() {
  const { user } = useAuthStore();
  const submitMutation = useSubmitExperience();
  
  const [category, setCategory] = useState<ExperienceCategory | ''>('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to submit your experience');
      return;
    }

    if (!category || !content.trim()) {
      toast.error('Please select a category and enter your experience');
      return;
    }

    if (content.length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        category,
        content: content.trim(),
        isAnonymous,
      });
      
      setShowSuccess(true);
      setContent('');
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const selectedCategory = categories.find(c => c.value === category);
  const maxLength = 500;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-brand-teal" />
          Share Your Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as ExperienceCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex flex-col">
                      <span>{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{cat.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Experience</Label>
            <Textarea
              id="content"
              placeholder={selectedCategory?.description || 'Share your experience...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={maxLength}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{content.length} / {maxLength} characters</span>
              {content.length < 10 && content.length > 0 && (
                <span className="text-destructive">Minimum 10 characters</span>
              )}
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous">Submit Anonymously</Label>
              <p className="text-xs text-muted-foreground">
                Your identity will not be shown publicly
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          {/* Submit Button */}
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center gap-2 py-2 text-green-600"
              >
                <Check className="h-5 w-5" />
                <span className="font-medium">Added to the jar!</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!user || submitMutation.isPending || !category || content.length < 10}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Dropping into jar...
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Droplet className="h-4 w-4 mr-2" />
                      </motion.div>
                      Drop into Jar
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!user && (
            <p className="text-sm text-center text-muted-foreground">
              Please <a href="/auth" className="text-brand-teal hover:underline">sign in</a> to share your experience
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
