import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExperienceSubmissions, ExperienceSubmission } from '@/hooks/useExperienceSubmissions';
import { EntryModal } from './EntryModal';

interface JarProps {
  type: 'good' | 'bad';
  submissions: ExperienceSubmission[];
  count: number;
  onDropClick: (submission: ExperienceSubmission) => void;
}

function Jar({ type, submissions, count, onDropClick }: JarProps) {
  const isGood = type === 'good';
  const fillPercentage = Math.min((count / 100) * 100, 100);
  const dropColor = isGood ? 'fill-green-500' : 'fill-brand-red';
  const liquidColor = isGood ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600';

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        {isGood ? (
          <ThumbsUp className="h-6 w-6 text-success" />
        ) : (
          <ThumbsDown className="h-6 w-6 text-brand-red" />
        )}
        <h3 className="text-xl font-bold">
          {isGood ? 'Good Experiences' : 'Bad Experiences'}
        </h3>
      </div>

      {/* Jar SVG */}
      <div className="relative w-48 h-64">
        <svg viewBox="0 0 100 140" className="w-full h-full">
          {/* Jar Outline */}
          <path
            d="M20 30 L20 120 Q20 135 35 135 L65 135 Q80 135 80 120 L80 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground/30"
          />
          {/* Jar Lid */}
          <rect x="15" y="20" width="70" height="10" rx="2" fill="currentColor" className="text-muted-foreground/50" />
          {/* Jar Neck */}
          <path
            d="M25 30 L25 20 L75 20 L75 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground/30"
          />
          
          {/* Liquid Fill */}
          <defs>
            <clipPath id={`jar-clip-${type}`}>
              <path d="M21 30 L21 119 Q21 134 35 134 L65 134 Q79 134 79 119 L79 30 Z" />
            </clipPath>
            <linearGradient id={`liquid-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" className={isGood ? 'stop-color-green-400' : 'stop-color-red-400'} style={{ stopColor: isGood ? '#4ade80' : '#f87171' }} />
              <stop offset="100%" className={isGood ? 'stop-color-green-600' : 'stop-color-red-600'} style={{ stopColor: isGood ? '#16a34a' : '#dc2626' }} />
            </linearGradient>
          </defs>
          
          <motion.rect
            x="21"
            y={135 - (fillPercentage * 1.05)}
            width="58"
            height={fillPercentage * 1.05}
            fill={`url(#liquid-${type})`}
            clipPath={`url(#jar-clip-${type})`}
            initial={{ height: 0, y: 135 }}
            animate={{ height: fillPercentage * 1.05, y: 135 - (fillPercentage * 1.05) }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="opacity-80"
          />
        </svg>

        {/* Floating Blood Drops */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ clipPath: 'inset(22% 20% 5% 20%)' }}>
          <AnimatePresence>
            {submissions.slice(0, 15).map((submission, index) => (
              <motion.div
                key={submission.id}
                className="absolute cursor-pointer pointer-events-auto"
                style={{
                  left: `${20 + (index % 5) * 12}%`,
                  bottom: `${10 + Math.floor(index / 5) * 20}%`,
                }}
                initial={{ y: -50, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                }}
                whileHover={{ scale: 1.2 }}
                onClick={() => onDropClick(submission)}
              >
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ 
                    duration: 2 + Math.random(), 
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                >
                  <path
                    d="M12 2C12 2 6 10 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 10 12 2 12 2Z"
                    className={dropColor}
                  />
                </motion.svg>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold">{count}</p>
      <p className="text-sm text-muted-foreground">submissions</p>
    </div>
  );
}

export function GoodBadJars() {
  const { data: goodSubmissions = [] } = useExperienceSubmissions('good');
  const { data: badSubmissions = [] } = useExperienceSubmissions('bad');
  const [selectedSubmission, setSelectedSubmission] = useState<ExperienceSubmission | null>(null);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-success/10 via-transparent to-brand-red/10">
          <CardTitle className="text-center">Good vs Bad Experiences</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex justify-center gap-16 flex-wrap">
            <Jar
              type="good"
              submissions={goodSubmissions}
              count={goodSubmissions.length}
              onDropClick={setSelectedSubmission}
            />
            <Jar
              type="bad"
              submissions={badSubmissions}
              count={badSubmissions.length}
              onDropClick={setSelectedSubmission}
            />
          </div>
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
