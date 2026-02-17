import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, Droplet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExperienceSubmissions, ExperienceSubmission } from '@/hooks/useExperienceSubmissions';
import { EntryModal } from './EntryModal';

export function DailyTasksJar() {
  const { data: submissions = [] } = useExperienceSubmissions('daily_tasks');
  const [selectedSubmission, setSelectedSubmission] = useState<ExperienceSubmission | null>(null);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Daily Tasks Others Don't Have
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {submissions.length} tasks shared
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* IV Bag Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-48">
              {/* IV Bag */}
              <svg viewBox="0 0 80 120" className="w-full h-full">
                {/* Bag */}
                <rect x="10" y="10" width="60" height="70" rx="5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/40" />
                <rect x="10" y="10" width="60" height="70" rx="5" fill="url(#ivGradient)" className="opacity-50" />
                
                {/* Tube */}
                <path d="M40 80 L40 100" stroke="currentColor" strokeWidth="3" className="text-primary/50" />
                <circle cx="40" cy="105" r="5" fill="currentColor" className="text-primary" />
                
                {/* Drip Animation Target */}
                <defs>
                  <linearGradient id="ivGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Animated Drips */}
              <AnimatePresence>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: '66%' }}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: 40, opacity: 0 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: 'easeIn'
                    }}
                  >
                    <Droplet className="h-3 w-3 text-primary fill-primary/70" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {submissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedSubmission(submission)}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="mt-0.5">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      <Droplet className="h-4 w-4 text-primary fill-primary/70" />
                    </motion.div>
                  </div>
                  <p className="text-sm flex-1 line-clamp-2">{submission.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {submissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ListChecks className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No daily tasks shared yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EntryModal
        submission={selectedSubmission}
        open={!!selectedSubmission}
        onOpenChange={(open) => !open && setSelectedSubmission(null)}
      />
    </>
  );
}
