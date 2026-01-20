import React from 'react';
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
import { 
  Star, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  ThumbsUp,
  Pill
} from 'lucide-react';
import { useMedicationDetails } from '@/hooks/useMedicationDetails';

interface MedicationDetailModalProps {
  medicationId: string | null;
  onClose: () => void;
}

export function MedicationDetailModal({ medicationId, onClose }: MedicationDetailModalProps) {
  const { data: medicationData, isLoading } = useMedicationDetails(medicationId || undefined);

  if (!medicationId) return null;

  const medication = medicationData;
  const reviews = medicationData?.userReviews || [];
  const externalReviews = medicationData?.externalReviews || [];

  return (
    <Dialog open={!!medicationId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            {medication?.name || 'Loading...'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : medication ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] mt-4">
              <TabsContent value="overview" className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-2">
                  {medication.generic_name && (
                    <p className="text-muted-foreground">
                      Generic: {medication.generic_name}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge>{medication.category}</Badge>
                    {medication.subcategory && (
                      <Badge variant="outline">{medication.subcategory}</Badge>
                    )}
                    {medication.fda_status && (
                      <Badge variant="secondary">{medication.fda_status}</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {medication.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{medication.description}</p>
                  </div>
                )}

                {/* Mechanism */}
                {medication.mechanism_of_action && (
                  <div>
                    <h4 className="font-medium mb-2">How It Works</h4>
                    <p className="text-sm text-muted-foreground">{medication.mechanism_of_action}</p>
                  </div>
                )}

                {/* Pros & Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medication.pros && medication.pros.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Pros
                      </h4>
                      <ul className="space-y-1">
                        {medication.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-emerald-500">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {medication.cons && medication.cons.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        Cons
                      </h4>
                      <ul className="space-y-1">
                        {medication.cons.map((con, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Manufacturer */}
                {medication.manufacturer && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Manufacturer: {medication.manufacturer}
                    </span>
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

              <TabsContent value="clinical" className="space-y-4">
                {/* Timing for Insulins */}
                {(medication.onset_time || medication.peak_time || medication.duration) && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Action Profile
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

                {/* Dosing */}
                {medication.typical_dosing && (
                  <div>
                    <h4 className="font-medium mb-2">Typical Dosing</h4>
                    <p className="text-sm text-muted-foreground">{medication.typical_dosing}</p>
                  </div>
                )}

                {/* Administration */}
                {medication.administration_route && (
                  <div>
                    <h4 className="font-medium mb-2">Administration</h4>
                    <p className="text-sm text-muted-foreground">{medication.administration_route}</p>
                  </div>
                )}

                {/* Side Effects */}
                {medication.common_side_effects && medication.common_side_effects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Common Side Effects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {medication.common_side_effects.map((effect, i) => (
                        <Badge key={i} variant="outline">{effect}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {medication.serious_warnings && medication.serious_warnings.length > 0 && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Important Warnings
                    </h4>
                    <ul className="space-y-1">
                      {medication.serious_warnings.map((warning, i) => (
                        <li key={i} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Storage */}
                {medication.storage_requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Storage Requirements</h4>
                    <p className="text-sm text-muted-foreground">{medication.storage_requirements}</p>
                  </div>
                )}
              </TabsContent>

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

              <TabsContent value="reviews" className="space-y-4">
                {/* Rating Summary */}
                {medication.rating_avg && (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-6 w-6 fill-warning text-warning" />
                        <span className="text-3xl font-bold">{medication.rating_avg.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medication.review_count || 0} reviews
                      </p>
                    </div>
                  </div>
                )}

                {/* User Reviews */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">User Reviews</h4>
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i}
                                className={`h-4 w-4 ${i < (review.rating || 0) ? 'fill-warning text-warning' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                          {review.duration_of_use && (
                            <span className="text-xs text-muted-foreground">
                              Used for {review.duration_of_use}
                            </span>
                          )}
                        </div>
                        {review.title && <h5 className="font-medium">{review.title}</h5>}
                        <p className="text-sm text-muted-foreground">{review.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          {review.helpful_count || 0} found helpful
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No user reviews yet
                  </p>
                )}

                {/* External Reviews */}
                {externalReviews.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Community Feedback</h4>
                    {externalReviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{review.source}</Badge>
                          {review.sentiment && (
                            <Badge 
                              variant={review.sentiment === 'positive' ? 'default' : review.sentiment === 'negative' ? 'destructive' : 'secondary'}
                            >
                              {review.sentiment}
                            </Badge>
                          )}
                        </div>
                        {review.title && <h5 className="font-medium">{review.title}</h5>}
                        <p className="text-sm text-muted-foreground line-clamp-3">{review.content}</p>
                        {review.source_url && (
                          <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                            <a href={review.source_url} target="_blank" rel="noopener noreferrer">
                              View source <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Medication not found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}