import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SkeletonGridProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  cols?: number;
  /** If true, renders card-shaped skeletons (Issue 255) */
  card?: boolean;
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
  card = false,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  }[cols] ?? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div className={cn(`grid ${gridCols} gap-4`, className)} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) =>
        card ? (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Skeleton key={i} className={cn('h-32 w-full rounded-lg', itemClassName)} />
        )
      )}
    </div>
  );
};

export default SkeletonGrid;
