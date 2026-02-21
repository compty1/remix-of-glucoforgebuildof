import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from './StarRating';
import { UserReviewCard } from './UserReviewCard';
import { UserReviewForm } from './UserReviewForm';
import { DeviceReview, ReviewStats } from '@/hooks/useDeviceReviews';
import { Star, Users, Filter } from 'lucide-react';

interface UserReviewsListProps {
  reviews: DeviceReview[];
  stats: ReviewStats;
  loading: boolean;
  userReview: DeviceReview | null;
  onSubmitReview: (review: {
    rating: number;
    title: string;
    content: string;
    pros: string[];
    cons: string[];
    ownership_duration: string | null;
  }) => Promise<boolean>;
  onUpdateReview: (reviewId: string, review: Partial<DeviceReview>) => Promise<boolean>;
  onDeleteReview: (reviewId: string) => Promise<boolean>;
  onToggleHelpful: (reviewId: string) => Promise<boolean>;
}

export const UserReviewsList: React.FC<UserReviewsListProps> = ({
  reviews,
  stats,
  loading,
  userReview,
  onSubmitReview,
  onUpdateReview,
  onDeleteReview,
  onToggleHelpful
}) => {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(5);
  const [editingReview, setEditingReview] = useState<DeviceReview | null>(null);

  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return b.helpful_count - a.helpful_count;
      case 'rating_high':
        return b.rating - a.rating;
      case 'rating_low':
        return a.rating - b.rating;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const visibleReviews = sortedReviews.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Data Notice */}
      {reviews.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            📋 <strong>Demo Reviews</strong> — These are seeded sample reviews. Be the first to write a real review!
          </p>
        </div>
      )}

      {/* Stats Card */}
      <Card className="command-center-widget">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" />
            Ratings Summary
            <Badge variant="outline" className="text-xs text-muted-foreground ml-2">Demo Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.averageRating)} size="md" />
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalReviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 w-full">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 
                  ? (count / stats.totalReviews) * 100 
                  : 0;

                return (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-sm w-3">{rating}</span>
                    <Star className="h-3 w-3 text-warning fill-warning" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-warning h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write/Edit Review Form */}
      {editingReview ? (
        <UserReviewForm
          initialData={{
            rating: editingReview.rating,
            title: editingReview.title,
            content: editingReview.content,
            pros: editingReview.pros,
            cons: editingReview.cons,
            ownership_duration: editingReview.ownership_duration
          }}
          isEditing
          onSubmit={async (data) => {
            const success = await onUpdateReview(editingReview.id, data);
            if (success) setEditingReview(null);
            return success;
          }}
          onCancel={() => setEditingReview(null)}
        />
      ) : !userReview ? (
        <UserReviewForm onSubmit={onSubmitReview} />
      ) : null}

      {/* Filters */}
      {reviews.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
                <SelectItem value="rating_high">Highest Rated</SelectItem>
                <SelectItem value="rating_low">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {visibleReviews.length > 0 ? (
        <div className="space-y-4">
          {visibleReviews.map(review => (
            <UserReviewCard
              key={review.id}
              review={review}
              onToggleHelpful={onToggleHelpful}
              onEdit={setEditingReview}
              onDelete={onDeleteReview}
            />
          ))}

          {sortedReviews.length > visibleCount && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setVisibleCount(prev => prev + 5)}
              >
                Load More Reviews ({sortedReviews.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="command-center-widget">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your experience with this device!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};