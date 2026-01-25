import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Zap, CloudLightning } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExperienceSubmissions, ExperienceSubmission } from '@/hooks/useExperienceSubmissions';
import { EntryModal } from './EntryModal';

export function FearsCloud() {
  const { data: submissions = [] } = useExperienceSubmissions('fears');
  const [selectedSubmission, setSelectedSubmission] = useState<ExperienceSubmission | null>(null);

  // Extract keywords from submissions for the word cloud effect
  const extractKeywords = (content: string) => {
    return content.split(' ').slice(0, 3).join(' ');
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-700/10 to-purple-800/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CloudLightning className="h-5 w-5 text-purple-500" />
              Fears & Worries
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {submissions.length} fears released
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Release your fears into the storm. You're not alone in these worries.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Storm Cloud Animation */}
          <div className="relative h-72 bg-gradient-to-b from-slate-800 via-purple-900 to-slate-900 rounded-xl overflow-hidden">
            {/* Cloud Layer */}
            <div className="absolute inset-0">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + i * 25}%`,
                    top: `${10 + i * 5}%`,
                  }}
                  animate={{
                    x: [0, 10, 0],
                    opacity: [0.6, 0.8, 0.6],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
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
                  style={{
                    left: `${30 + i * 40}%`,
                    top: '20%',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0, 0, 0, 1, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: i * 2.5,
                  }}
                >
                  <Zap className="h-8 w-8 text-yellow-300" />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Floating Fear Words */}
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 p-4">
              <AnimatePresence>
                {submissions.slice(0, 12).map((submission, index) => (
                  <motion.button
                    key={submission.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: 1,
                      y: [0, -5, 0],
                    }}
                    transition={{
                      opacity: { duration: 3, repeat: Infinity, delay: index * 0.2 },
                      y: { duration: 2 + Math.random() * 2, repeat: Infinity, delay: index * 0.1 },
                      scale: { duration: 0.3 },
                    }}
                    whileHover={{ scale: 1.1, opacity: 1 }}
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
                  >
                    {extractKeywords(submission.content)}...
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Storm Pulse Effect */}
            <motion.div
              className="absolute inset-0 bg-purple-500/5"
              animate={{
                opacity: [0, 0.1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />
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
