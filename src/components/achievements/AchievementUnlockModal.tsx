import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AchievementDefinition } from '@/data/achievementDefinitions';
import confetti from 'canvas-confetti';
import { Star, Sparkles } from 'lucide-react';

interface AchievementUnlockModalProps {
  achievement: AchievementDefinition | null;
  onClose: () => void;
}

export function AchievementUnlockModal({ achievement, onClose }: AchievementUnlockModalProps) {
  useEffect(() => {
    if (achievement) {
      // Trigger confetti celebration
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#9333EA'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#9333EA'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [achievement]);

  if (!achievement) return null;

  return (
    <Dialog open={!!achievement} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md text-center border-2 border-amber-500/50">
        <div className="relative">
          {/* Sparkle decorations */}
          <Sparkles className="absolute -top-2 -left-2 h-6 w-6 text-amber-400 animate-pulse" />
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-pulse delay-150" />
          
          <div className="py-6 space-y-6">
            {/* Badge */}
            <div className="relative mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-bounce">
              <span className="text-6xl drop-shadow-lg">{achievement.icon}</span>
              <div className="absolute inset-0 rounded-full border-4 border-amber-300/50 animate-ping" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-sm font-semibold uppercase tracking-wider">Achievement Unlocked!</span>
                <Star className="h-5 w-5 fill-current" />
              </div>
              <h2 className="text-2xl font-bold">{achievement.name}</h2>
              <p className="text-muted-foreground">{achievement.description}</p>
            </div>

            {/* Points */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Star className="h-4 w-4 text-primary fill-current" />
              <span className="font-semibold text-primary">+{achievement.points} points</span>
            </div>

            {/* Close button */}
            <Button onClick={onClose} className="w-full" size="lg">
              Awesome! 🎉
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
