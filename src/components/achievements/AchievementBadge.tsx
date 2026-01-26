import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  isCompleted: boolean;
  progress?: number;
  target?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  earnedAt?: string;
  className?: string;
}

export function AchievementBadge({
  icon,
  name,
  description,
  isCompleted,
  progress = 0,
  target = 1,
  size = 'md',
  showProgress = false,
  earnedAt,
  className,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const progressPercent = Math.min((progress / target) * 100, 100);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex flex-col items-center gap-2', className)}>
            <div
              className={cn(
                'relative rounded-full flex items-center justify-center transition-all duration-300',
                sizeClasses[size],
                isCompleted
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
                  : 'bg-muted/50 grayscale opacity-60'
              )}
            >
              {isCompleted ? (
                <span className="drop-shadow-md">{icon}</span>
              ) : (
                <div className="relative">
                  <span className="opacity-50">{icon}</span>
                  <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              {/* Progress ring for incomplete achievements */}
              {!isCompleted && progress > 0 && (
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-primary/30"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercent * 2.89} 289`}
                    className="text-primary"
                  />
                </svg>
              )}
            </div>

            {size !== 'sm' && (
              <span
                className={cn(
                  'text-xs font-medium text-center max-w-20 line-clamp-2',
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {name}
              </span>
            )}

            {showProgress && !isCompleted && (
              <div className="w-full max-w-20">
                <Progress value={progressPercent} className="h-1" />
                <span className="text-[10px] text-muted-foreground">
                  {progress}/{target}
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-48">
          <div className="space-y-1">
            <p className="font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {isCompleted && earnedAt && (
              <p className="text-xs text-primary">
                Earned {new Date(earnedAt).toLocaleDateString()}
              </p>
            )}
            {!isCompleted && progress > 0 && (
              <p className="text-xs text-primary">
                Progress: {progress}/{target}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
