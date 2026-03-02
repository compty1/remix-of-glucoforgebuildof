import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TreePine, Smile, Frown, Meh } from 'lucide-react';

interface DigitalCompanionProps {
  tir: number; // 0-100
  className?: string;
}

export default function DigitalCompanion({ tir, className }: DigitalCompanionProps) {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = useMemo(() => {
    if (tir >= 70) return { mood: 'thriving', color: 'text-primary', bgColor: 'bg-primary/10', label: 'Thriving!', icon: Smile, treeScale: 1.0 };
    if (tir >= 50) return { mood: 'neutral', color: 'text-warning', bgColor: 'bg-warning/10', label: 'Growing...', icon: Meh, treeScale: 0.8 };
    return { mood: 'needs-care', color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Needs care', icon: Frown, treeScale: 0.6 };
  }, [tir]);

  const Icon = state.icon;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TreePine className="h-5 w-5" />
          My Health Tree
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`rounded-lg p-6 flex flex-col items-center ${state.bgColor}`}>
          <motion.div
            initial={false}
            animate={prefersReducedMotion ? {} : { scale: [state.treeScale, state.treeScale + 0.05, state.treeScale] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-3"
          >
            <div className="relative">
              {/* Tree trunk */}
              <div className="w-4 h-8 bg-amber-800 dark:bg-amber-700 mx-auto rounded-b" />
              {/* Tree canopy layers */}
              <motion.div
                animate={prefersReducedMotion ? {} : { y: [0, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="flex flex-col items-center -mt-2"
              >
                <div
                  className="rounded-full"
                  style={{
                    width: `${40 * state.treeScale}px`,
                    height: `${40 * state.treeScale}px`,
                    backgroundColor: tir >= 70 ? 'hsl(var(--primary))' : tir >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))',
                    opacity: 0.8,
                  }}
                />
                <div
                  className="rounded-full -mt-4"
                  style={{
                    width: `${56 * state.treeScale}px`,
                    height: `${48 * state.treeScale}px`,
                    backgroundColor: tir >= 70 ? 'hsl(var(--primary))' : tir >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))',
                    opacity: 0.6,
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
          <div className="flex items-center gap-2 mt-2">
            <Icon className={`h-5 w-5 ${state.color}`} />
            <span className={`font-medium ${state.color}`}>{state.label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            TIR: {tir.toFixed(0)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
