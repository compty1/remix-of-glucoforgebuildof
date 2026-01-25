import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laugh, Candy, Cookie, Coffee, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExperienceSubmissions, ExperienceSubmission } from '@/hooks/useExperienceSubmissions';
import { EntryModal } from './EntryModal';

const funItems = [
  { icon: Candy, color: 'text-pink-500' },
  { icon: Cookie, color: 'text-amber-500' },
  { icon: Coffee, color: 'text-orange-500' },
];

export function EmbarrassingLowsJar() {
  const { data: submissions = [] } = useExperienceSubmissions('embarrassing_lows');
  const [selectedSubmission, setSelectedSubmission] = useState<ExperienceSubmission | null>(null);

  // Sort by upvotes for "most popular" at top
  const sortedSubmissions = [...submissions].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-500/10 via-orange-500/10 to-yellow-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Laugh className="h-5 w-5 text-orange-500" />
              Embarrassing Low Stories
            </CardTitle>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {submissions.length} stories shared
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            We've all been there. Share your most embarrassing low blood sugar moments!
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Fun Container Animation */}
          <div className="relative h-48 bg-gradient-to-b from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 rounded-xl overflow-hidden mb-6 border-2 border-dashed border-orange-200 dark:border-orange-800">
            {/* Falling Items Animation */}
            <AnimatePresence>
              {submissions.slice(0, 20).map((_, index) => {
                const ItemIcon = funItems[index % funItems.length].icon;
                const color = funItems[index % funItems.length].color;
                return (
                  <motion.div
                    key={index}
                    className={`absolute ${color}`}
                    style={{
                      left: `${10 + (index % 8) * 11}%`,
                    }}
                    initial={{ y: -20, rotate: 0, opacity: 0 }}
                    animate={{
                      y: [0, 120 + (index % 3) * 20],
                      rotate: [0, 360],
                      opacity: [0, 1, 1],
                    }}
                    transition={{
                      duration: 2,
                      delay: index * 0.1,
                      repeat: Infinity,
                      repeatDelay: 5,
                    }}
                  >
                    <ItemIcon className="h-6 w-6" />
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Pile at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-orange-200/50 to-transparent dark:from-orange-800/30">
              <div className="flex justify-center gap-1 pt-4">
                {funItems.map((item, i) => (
                  <item.icon key={i} className={`h-5 w-5 ${item.color} opacity-60`} />
                ))}
              </div>
            </div>
          </div>

          {/* Story List */}
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
                    className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20 border border-orange-100 dark:border-orange-900/30 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Laugh className="h-5 w-5 text-orange-400 shrink-0" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">{submission.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-muted-foreground hover:text-orange-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle upvote
                            }}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {submission.upvotes}
                          </Button>
                          {index === 0 && submission.upvotes > 0 && (
                            <Badge className="bg-orange-100 text-orange-700 text-xs">
                              🏆 Top Story
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
              <Laugh className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No embarrassing stories yet... but we know you have one!</p>
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
