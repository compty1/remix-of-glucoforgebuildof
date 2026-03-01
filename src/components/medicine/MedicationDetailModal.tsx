import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Star, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  ThumbsUp,
  Pill,
  TrendingUp,
  MessageSquare,
  Edit2,
  Send,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useMedicationDetails } from '@/hooks/useMedicationDetails';
import { useMedicationReviews } from '@/hooks/useMedicationReviews';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getSourceDisplayName, getSourceBadgeColor, getSourceLogo, isOfficialSource } from '@/utils/sourceConfig';
import { sanitizeContent } from '@/utils/reviewSanitizer';

interface MedicationDetailModalProps {
  medicationId: string | null;
  onClose: () => void;
}

export function MedicationDetailModal({ medicationId, onClose }: MedicationDetailModalProps) {
  // All hooks must be at top level before any conditional returns
  const { data: medicationData, isLoading } = useMedicationDetails(medicationId || undefined);
  const { user } = useAuthStore();
  const { submitReview, toggleHelpful, isSubmitting } = useMedicationReviews();

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
    wouldRecommend: true,
  });
  const [reviewSort, setReviewSort] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [externalVisible, setExternalVisible] = useState(5);

  // useMemo hooks must be before any conditional return
  const reviews = useMemo(() => {
    const base = medicationData?.userReviews || [];
    return [...base].sort((a, b) => {
      if (reviewSort === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
      if (reviewSort === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [medicationData?.userReviews, reviewSort]);

  // Derive Real Usage stats from actual reviews
  const realUsageStats = useMemo(() => {
    const allReviews = medicationData?.userReviews || [];
    if (allReviews.length === 0) return null;
    const positiveCount = allReviews.filter(r => r.would_recommend === true).length;
    const positivePercent = Math.round((positiveCount / allReviews.length) * 100);
    const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length;
    const allCons = allReviews.flatMap(r => r.cons || []).filter(Boolean);
    const consCounts: Record<string, number> = {};
    allCons.forEach(c => { consCounts[c] = (consCounts[c] || 0) + 1; });
    const topCons = Object.entries(consCounts).sort(([,a],[,b]) => b - a).slice(0, 3).map(([c]) => c);
    const allPros = allReviews.flatMap(r => r.pros || []).filter(Boolean);
    const prosCounts: Record<string, number> = {};
    allPros.forEach(p => { prosCounts[p] = (prosCounts[p] || 0) + 1; });
    const topPros = Object.entries(prosCounts).sort(([,a],[,b]) => b - a).slice(0, 3).map(([p]) => p);
    return { positivePercent, avgRating, topCons, topPros, totalReviews: allReviews.length };
  }, [medicationData?.userReviews]);

  const userExistingReview = useMemo(() =>
    user ? reviews.find(r => r.user_id === user.id) : null,
  [reviews, user]);

  const externalReviews = useMemo(() => medicationData?.externalReviews || [], [medicationData?.externalReviews]);

  if (!medicationId) return null;

  const medication = medicationData;

  const handleSubmitReview = () => {
    if (!reviewForm.content.trim()) {
      toast.error('Please write a review before submitting.');
      return;
    }
    if (reviewForm.content.length > 2000) {
      toast.error('Review must be under 2000 characters.');
      return;
    }
    submitReview.mutate({
      medication_id: medicationId,
      rating: reviewForm.rating,
      title: reviewForm.title || undefined,
      content: reviewForm.content,
      would_recommend: reviewForm.wouldRecommend,
    });
    setShowReviewForm(false);
    setReviewForm({ rating: 5, title: '', content: '', wouldRecommend: true });
  };

  return (
    <Dialog open={!!medicationId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            {medication?.name || 'Loading...'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{medication?.generic_name ? `Generic: ${medication.generic_name}` : medication?.category || 'Medication details'}</p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : medication ? (
          <Tabs defaultValue="overview" className="w-full">
            {/* Responsive tabs: scrollable on mobile */}
            <div className="overflow-x-auto -mx-1 px-1">
              <TabsList className="flex w-max min-w-full sm:grid sm:grid-cols-6 gap-0">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reviews</TabsTrigger>
                <TabsTrigger value="buzz" className="text-xs sm:text-sm">Community Buzz</TabsTrigger>
                <TabsTrigger value="usage" className="text-xs sm:text-sm">Real Usage</TabsTrigger>
                <TabsTrigger value="clinical" className="text-xs sm:text-sm">Clinical</TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs sm:text-sm">Pricing</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[60vh] mt-4">
              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-2">
                  {medication.generic_name && (
                    <p className="text-muted-foreground">Generic: {medication.generic_name}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge>{medication.category}</Badge>
                    {medication.subcategory && <Badge variant="outline">{medication.subcategory}</Badge>}
                    {medication.fda_status && <Badge variant="secondary">{medication.fda_status}</Badge>}
                  </div>
                </div>
                <Separator />
                {medication.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{medication.description}</p>
                  </div>
                )}
                {medication.mechanism_of_action && (
                  <div>
                    <h4 className="font-medium mb-2">How It Works</h4>
                    <p className="text-sm text-muted-foreground">{medication.mechanism_of_action}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medication.pros && medication.pros.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" /> Pros
                      </h4>
                      <ul className="space-y-1">
                        {medication.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" /> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {medication.cons && medication.cons.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" /> Cons
                      </h4>
                      <ul className="space-y-1">
                        {medication.cons.map((con, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <XCircle className="h-3 w-3 text-destructive mt-0.5 shrink-0" /> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {medication.manufacturer && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Manufacturer: {medication.manufacturer}</span>
                    {medication.manufacturer_website && (
                      <Button variant="link" size="sm" asChild>
                        <a href={medication.manufacturer_website} target="_blank" rel="noopener noreferrer">
                          Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* REVIEWS TAB — moved to position 2, wired to real data */}
              <TabsContent value="reviews" className="space-y-4">
                {/* Rating Summary */}
                {medication.avg_rating && medication.review_count != null && medication.review_count >= 5 ? (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-6 w-6 fill-warning text-warning" />
                        <span className="text-3xl font-bold">{medication.avg_rating?.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground" aria-label={`${medication.review_count} reviews`}>
                        {medication.review_count} reviews
                      </p>
                    </div>
                  </div>
                ) : medication.review_count != null && medication.review_count > 0 && medication.review_count < 5 ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground italic">Not enough reviews to display a rating</p>
                  </div>
                ) : null}

                {/* Sort controls */}
                {reviews.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort:</span>
                    {(['recent', 'helpful', 'rating'] as const).map(s => (
                      <Button key={s} size="sm" variant={reviewSort === s ? 'default' : 'outline'}
                        onClick={() => setReviewSort(s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Write Review form */}
                {user && !userExistingReview && (
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    {!showReviewForm ? (
                      <Button variant="outline" className="w-full" onClick={() => setShowReviewForm(true)}>
                        <Edit2 className="h-4 w-4 mr-2" /> Write a Review
                      </Button>
                    ) : (
                      <>
                        <h4 className="font-medium">Write Your Review</h4>
                        <div className="space-y-1">
                          <Label>Rating</Label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(n => (
                              <button key={n} aria-label={`Rate ${n} stars`}
                                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                                onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                                <Star className={`h-6 w-6 ${n <= reviewForm.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="rev-title">Title (optional)</Label>
                          <Input id="rev-title" maxLength={100} value={reviewForm.title}
                            onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Summary of your experience" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="rev-content">Your Review <span className="text-muted-foreground text-xs">({reviewForm.content.length}/2000)</span></Label>
                          <Textarea id="rev-content" maxLength={2000} rows={4}
                            value={reviewForm.content}
                            onChange={e => setReviewForm(f => ({ ...f, content: e.target.value }))}
                            placeholder="Share your experience with this medication..." />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="recommend" checked={reviewForm.wouldRecommend}
                            onCheckedChange={(checked) => setReviewForm(f => ({ ...f, wouldRecommend: !!checked }))} />
                          <Label htmlFor="recommend">I would recommend this medication</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                            <Send className="h-4 w-4 mr-2" /> {isSubmitting ? 'Submitting...' : 'Submit Review'}
                          </Button>
                          <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* User Reviews */}
                {reviews.length > 0 ? (
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">User Reviews ({reviews.length})</h4>
                      </div>
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 border rounded-lg space-y-2"
                          role="article" aria-label="User review">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              {/* Issue 61: if rating is null/0, show "No rating" instead of empty stars */}
                              {review.rating != null && review.rating > 0 ? (
                                <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < review.rating! ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No rating</span>
                              )}
                              {review.verified && (
                                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                                  <Shield className="h-3 w-3 mr-1" /> Verified
                                </Badge>
                              )}
                              {review.would_recommend === false && (
                                <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                                  Would not recommend
                                </Badge>
                              )}
                            </div>
                            {review.duration_of_use && (
                              <span className="text-xs text-muted-foreground">Used for {review.duration_of_use}</span>
                            )}
                          </div>
                          {review.title && <h5 className="font-medium">{review.title}</h5>}
                          <p className="text-sm text-muted-foreground">{review.content}</p>
                          {/* Pros */}
                          {review.pros && review.pros.filter(Boolean).length > 0 && (
                            <div className="space-y-1">
                              {review.pros.filter(Boolean).map((p, i) => (
                                <p key={i} className="text-xs text-success flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> {p}
                                </p>
                              ))}
                            </div>
                          )}
                          {/* Cons */}
                          {review.cons && review.cons.filter(Boolean).length > 0 && (
                            <div className="space-y-1">
                              {review.cons.filter(Boolean).map((c, i) => (
                                <p key={i} className="text-xs text-destructive flex items-center gap-1">
                                  <XCircle className="h-3 w-3" /> {c}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <button
                              aria-label="Mark review as helpful"
                              className="flex items-center gap-1 hover:text-foreground transition-colors"
                              onClick={() => user && toggleHelpful.mutate({ reviewId: review.id, medicationId: medicationId! })}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              {review.helpful_count || 0} helpful
                            </button>
                            <span>{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No user reviews yet.</p>
                    {user && <p className="text-sm text-muted-foreground mt-1">Be the first to share your experience!</p>}
                  </div>
                )}

                {/* External Reviews — show only official platform reviews in Reviews tab */}
                {(() => {
                   const officialReviews = externalReviews.filter(r => isOfficialSource(r.source?.toLowerCase() || ''));
                   if (officialReviews.length === 0) return (
                     <div className="mt-4 p-4 border rounded-lg text-center">
                       <p className="text-sm text-muted-foreground mb-2">No consumer reviews yet.</p>
                       <Button variant="outline" size="sm" asChild>
                         <a href={`https://www.google.com/search?q=${encodeURIComponent((medication?.name || '') + ' medication reviews')}`}
                           target="_blank" rel="noopener noreferrer">
                           Search Google Reviews <ExternalLink className="h-3 w-3 ml-1" />
                         </a>
                       </Button>
                     </div>
                   );
                   return (
                     <div className="space-y-4 mt-4">
                       <h4 className="font-medium flex items-center gap-2">Consumer Reviews ({officialReviews.length})</h4>
                      {officialReviews.slice(0, externalVisible).map((review) => (
                        <div key={review.id} className="p-4 border rounded-lg space-y-2"
                          role="article" aria-label="Consumer review">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={getSourceBadgeColor(review.source || '')}>
                              <span className="flex items-center gap-1.5">
                                {getSourceLogo(review.source || '', review.source_url) && (
                                  <img src={getSourceLogo(review.source || '', review.source_url)!} alt="" className="h-3.5 w-3.5 rounded-sm object-contain" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                )}
                                {getSourceDisplayName(review.source || '', review.source_url)}
                              </span>
                            </Badge>
                            {(review as any).rating && (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < ((review as any).rating || 0) ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                                ))}
                              </div>
                            )}
                            {review.sentiment && (
                              <Badge variant={review.sentiment === 'positive' ? 'default' : review.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                                {review.sentiment}
                              </Badge>
                            )}
                            {review.published_at && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {format(new Date(review.published_at), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                          {review.title && <h5 className="font-medium text-sm">{review.title}</h5>}
                          <p className="text-sm text-muted-foreground line-clamp-3">{sanitizeContent(review.content)}</p>
                          <div className="flex items-center gap-3">
                            {review.source_url && (
                              <Button variant="link" size="sm" className="p-0 h-auto text-xs" asChild>
                                <a href={review.source_url} target="_blank" rel="noopener noreferrer">
                                  View source <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {externalVisible < officialReviews.length && (
                        <Button variant="outline" className="w-full" onClick={() => setExternalVisible(v => v + 5)}>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Load More ({officialReviews.length - externalVisible} remaining)
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </TabsContent>

              {/* COMMUNITY BUZZ TAB */}
              <TabsContent value="buzz" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Real Experiences from the Community
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Authentic discussions shared by people with diabetes across forums and social media.
                  </p>
                   {/* Show only Reddit / community posts in Community tab (not official sources) */}
                  {(() => {
                    const communityPosts = externalReviews.filter(r => !isOfficialSource(r.source?.toLowerCase() || ''));
                    return communityPosts.length > 0 ? (
                      <div className="space-y-3">
                        {communityPosts.map((review) => (
                          <div key={review.id} className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                            role="article" aria-label="Community post">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getSourceBadgeColor(review.source || '')}>
                                  <span className="flex items-center gap-1.5">
                                    {getSourceLogo(review.source || '', review.source_url) && (
                                      <img src={getSourceLogo(review.source || '', review.source_url)!} alt="" className="h-3.5 w-3.5 rounded-sm object-contain" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    )}
                                    {getSourceDisplayName(review.source || '', review.source_url)}
                                  </span>
                                </Badge>
                                {review.sentiment && (
                                  <Badge variant={review.sentiment === 'positive' ? 'default' : review.sentiment === 'negative' ? 'destructive' : 'secondary'} className="text-xs">
                                    {review.sentiment}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {review.title && <h5 className="font-medium text-sm">{review.title}</h5>}
                            <p className="text-sm line-clamp-4">{sanitizeContent(review.content)}</p>
                             {review.source_url ? (
                               <Button variant="link" size="sm" className="p-0 h-auto text-xs" asChild>
                                 <a href={review.source_url} target="_blank" rel="noopener noreferrer"
                                   aria-label={`View original post on ${review.source}`}>
                                   View original post <ExternalLink className="h-3 w-3 ml-1" />
                                 </a>
                               </Button>
                             ) : review.source?.toLowerCase() === 'reddit' ? (
                               <Button variant="link" size="sm" className="p-0 h-auto text-xs" asChild>
                                 <a href={`https://www.reddit.com/search/?q=${encodeURIComponent(review.title || review.content?.slice(0, 50) || '')}&type=link`}
                                   target="_blank" rel="noopener noreferrer"
                                   aria-label="Search Reddit for this discussion">
                                   Search Reddit <ExternalLink className="h-3 w-3 ml-1" />
                                 </a>
                               </Button>
                             ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No community discussions found yet.</p>
                        <p className="text-xs mt-1">Check back soon as we aggregate more content.</p>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>

              {/* REAL USAGE TAB — derived from actual reviews */}
              <TabsContent value="usage" className="space-y-4">
                {realUsageStats ? (
                  <>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Real-World Usage Patterns
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Reviews</p>
                          <p className="font-medium">{realUsageStats.totalReviews} user reviews</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">User Satisfaction</p>
                          <p className={`font-medium ${realUsageStats.positivePercent >= 70 ? 'text-success' : realUsageStats.positivePercent >= 50 ? 'text-warning' : 'text-destructive'}`}>
                            {realUsageStats.positivePercent}% would recommend
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Average Rating</p>
                          <p className="font-medium flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {realUsageStats.avgRating.toFixed(1)} / 5
                          </p>
                        </div>
                      </div>
                    </div>

                    {realUsageStats.topCons.length > 0 && (
                      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          Most Reported Concerns
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {realUsageStats.topCons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {realUsageStats.topPros.length > 0 && (
                      <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          Most Praised Benefits
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {realUsageStats.topPros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground italic">
                      Data derived from {realUsageStats.totalReviews} verified user reviews on this platform.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No real usage data available yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Data will appear here once users submit reviews.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* CLINICAL TAB */}
              <TabsContent value="clinical" className="space-y-4">
                {(medication.onset_time || medication.peak_time || medication.duration) && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Action Profile
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {medication.onset_time && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Onset</p>
                          <p className="font-medium">{medication.onset_time}</p>
                        </div>
                      )}
                      {medication.peak_time && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Peak</p>
                          <p className="font-medium">{medication.peak_time}</p>
                        </div>
                      )}
                      {medication.duration && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-medium">{medication.duration}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <Separator />
                {medication.typical_dosing && (
                  <div>
                    <h4 className="font-medium mb-2">Typical Dosing</h4>
                    <p className="text-sm text-muted-foreground">{medication.typical_dosing}</p>
                  </div>
                )}
                {medication.administration_route && (
                  <div>
                    <h4 className="font-medium mb-2">Administration</h4>
                    <p className="text-sm text-muted-foreground">{medication.administration_route}</p>
                  </div>
                )}
                {medication.common_side_effects && medication.common_side_effects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" /> Common Side Effects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {medication.common_side_effects.map((effect, i) => (
                        <Badge key={i} variant="outline">{effect}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {medication.serious_warnings && medication.serious_warnings.length > 0 && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Important Warnings
                    </h4>
                    <ul className="space-y-1">
                      {medication.serious_warnings.map((warning, i) => (
                        <li key={i} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {medication.storage_requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Storage Requirements</h4>
                    <p className="text-sm text-muted-foreground">{medication.storage_requirements}</p>
                  </div>
                )}
              </TabsContent>

              {/* PRICING TAB */}
              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medication.avg_price && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-medium">Retail Price</h4>
                      </div>
                      <p className="text-2xl font-bold">${medication.avg_price}</p>
                      <p className="text-xs text-muted-foreground">Average cash price</p>
                    </div>
                  )}
                  {medication.medicare_price && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Medicare Price</h4>
                      </div>
                      <p className="text-2xl font-bold text-primary">${medication.medicare_price}</p>
                      <p className="text-xs text-muted-foreground">Part D coverage</p>
                    </div>
                  )}
                </div>
                {medication.insurance_coverage_notes && (
                  <div>
                    <h4 className="font-medium mb-2">Insurance Notes</h4>
                    <p className="text-sm text-muted-foreground">{medication.insurance_coverage_notes}</p>
                  </div>
                )}
                {medication.fda_approval_date && (
                  <div>
                    <h4 className="font-medium mb-2">FDA Approval</h4>
                    <p className="text-sm text-muted-foreground">
                      Approved: {new Date(medication.fda_approval_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Medication not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
