import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonGridProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  cols?: number;
}

/**
 * Reusable skeleton loading grid to replace the repeated
 * `Array.from({ length: N }).map((_, i) => <Skeleton key={i} />)` pattern.
 */
export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 6,
  className,
  itemClassName,
  cols = 3,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  }[cols] ?? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div className={cn(`grid ${gridCols} gap-4`, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn('h-32 w-full rounded-lg', itemClassName)} />
      ))}
    </div>
  );
};

export default SkeletonGrid;
