import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from './StarRating';
import { DeviceReview } from '@/hooks/useDeviceReviews';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { 
  ThumbsUp, 
  Clock, 
  CheckCircle, 
  Edit, 
  Trash2,
  ThumbsDown
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserReviewCardProps {
  review: DeviceReview;
  onToggleHelpful: (reviewId: string) => Promise<boolean>;
  onEdit?: (review: DeviceReview) => void;
  onDelete?: (reviewId: string) => Promise<boolean>;
}

const ownershipDurationLabels: Record<string, string> = {
  'less_than_month': 'Less than 1 month',
  '1_to_6_months': '1-6 months',
  '6_to_12_months': '6-12 months',
  '1_to_2_years': '1-2 years',
  'more_than_2_years': 'More than 2 years'
};

export const UserReviewCard: React.FC<UserReviewCardProps> = ({
  review,
  onToggleHelpful,
  onEdit,
  onDelete
}) => {
  const { user } = useAuthStore();
  const [isVoting, setIsVoting] = useState(false);
  const isOwnReview = user?.id === review.user_id;

  const handleToggleHelpful = async () => {
    if (isVoting || isOwnReview) return;
    setIsVoting(true);
    await onToggleHelpful(review.id);
    setIsVoting(false);
  };

  const displayName = review.profile?.display_name || 'Anonymous User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="command-center-widget">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.profile?.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{displayName}</span>
                {review.verified_owner && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Owner
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(new Date(review.created_at), 'MMM d, yyyy')}
                {review.ownership_duration && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span>Used for {ownershipDurationLabels[review.ownership_duration] || review.ownership_duration}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>

        {/* Title & Content */}
        <h3 className="font-semibold mb-2">{review.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
          {review.content}
        </p>

        {/* Pros & Cons */}
        {(review.pros.length > 0 || review.cons.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {review.pros.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-success mb-2">Pros</p>
                <ul className="space-y-1">
                  {review.pros.map((pro, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-success">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {review.cons.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-destructive mb-2">Cons</p>
                <ul className="space-y-1">
                  {review.cons.map((con, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-destructive">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleHelpful}
            disabled={isVoting || isOwnReview || !user}
            className={review.user_has_voted ? 'text-primary' : ''}
          >
            {review.user_has_voted ? (
              <ThumbsDown className="h-4 w-4 mr-1" />
            ) : (
              <ThumbsUp className="h-4 w-4 mr-1" />
            )}
            {review.user_has_voted ? 'Undo Helpful' : 'Helpful'}
            {review.helpful_count > 0 && (
              <span className="ml-1">({review.helpful_count})</span>
            )}
          </Button>

          {isOwnReview && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(review)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Review</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your review? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete?.(review.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};