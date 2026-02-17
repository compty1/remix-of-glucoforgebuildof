import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Zap, CloudLightning, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExperienceSubmissions, ExperienceSubmission } from '@/hooks/useExperienceSubmissions';
import { EntryModal } from './EntryModal';

export function FearsCloud() {
  const { data: submissions = [] } = useExperienceSubmissions('fears');
  const [selectedSubmission, setSelectedSubmission] = useState<ExperienceSubmission | null>(null);

  const sortedSubmissions = [...submissions].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-700/10 to-purple-800/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CloudLightning className="h-5 w-5 text-purple-500" />
              Fears & Worries
            </CardTitle>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {submissions.length} fears released
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Release your fears into the storm. You're not alone in these worries.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Storm Cloud Animation - Compact */}
          <div className="relative h-48 bg-gradient-to-b from-slate-800 via-purple-900 to-slate-900 rounded-xl overflow-hidden mb-6">
            {/* Cloud Layer */}
            <div className="absolute inset-0">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ left: `${20 + i * 25}%`, top: `${10 + i * 5}%` }}
                  animate={{ x: [0, 10, 0], opacity: [0.6, 0.8, 0.6] }}
                  transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
                >
                  <Cloud className="h-16 w-16 text-slate-500/50 fill-slate-600/30" />
                </motion.div>
              ))}
            </div>

            {/* Lightning Flashes */}
            <AnimatePresence>
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ left: `${30 + i * 40}%`, top: '20%' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0, 0, 0, 1, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: i * 2.5 }}
                >
                  <Zap className="h-8 w-8 text-yellow-300" />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Storm Pulse Effect */}
            <motion.div
              className="absolute inset-0 bg-purple-500/5"
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>

          {/* Story List - Same pattern as EmbarrassingLowsJar */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {sortedSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div
                    onClick={() => setSelectedSubmission(submission)}
                    className="p-4 rounded-lg bg-gradient-to-r from-slate-500/5 to-purple-500/5 dark:from-slate-500/10 dark:to-purple-500/10 border border-purple-500/20 dark:border-purple-500/15 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <CloudLightning className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">{submission.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-muted-foreground hover:text-purple-500"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {submission.upvotes}
                          </Button>
                          {index === 0 && submission.upvotes > 0 && (
                            <Badge className="bg-purple-500/10 text-purple-500 text-xs">
                              🌩️ Most Shared Fear
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {submissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CloudLightning className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No fears released yet</p>
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
