import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star } from 'lucide-react';
import { useMedicationReviews } from '@/hooks/useMedicationReviews';
import { useToast } from '@/hooks/use-toast';

interface MedicationReviewFormProps {
  medicationId: string;
  onSuccess?: () => void;
}

const DURATION_OPTIONS = [
  'Less than 1 month',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '1-2 years',
  '2+ years',
];

export function MedicationReviewForm({ medicationId, onSuccess }: MedicationReviewFormProps) {
  const { submitReview, isSubmitting } = useMedicationReviews();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 0,
    effectiveness_rating: 0,
    side_effects_rating: 0,
    ease_of_use_rating: 0,
    duration_of_use: '',
    would_recommend: true,
    pros: [''],
    cons: [''],
  });

  const handleRatingClick = (field: 'rating' | 'effectiveness_rating' | 'side_effects_rating' | 'ease_of_use_rating', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProConChange = (type: 'pros' | 'cons', index: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev[type]];
      updated[index] = value;
      return { ...prev, [type]: updated };
    });
  };

  const addProCon = (type: 'pros' | 'cons') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ''],
    }));
  };

  const removeProCon = (type: 'pros' | 'cons', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please provide an overall rating',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: 'Review required',
        description: 'Please write your review',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitReview.mutateAsync({
        medication_id: medicationId,
        title: formData.title || undefined,
        content: formData.content,
        rating: formData.rating,
        effectiveness_rating: formData.effectiveness_rating || undefined,
        side_effects_rating: formData.side_effects_rating || undefined,
        ease_of_use_rating: formData.ease_of_use_rating || undefined,
        duration_of_use: formData.duration_of_use || undefined,
        would_recommend: formData.would_recommend,
        pros: formData.pros.filter(p => p.trim()),
        cons: formData.cons.filter(c => c.trim()),
      });
      
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (v: number) => void;
    label: string;
  }) => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="focus:outline-none"
          >
            <Star 
              className={`h-6 w-6 cursor-pointer transition-colors ${
                i < value 
                  ? 'fill-warning text-warning' 
                  : 'text-muted hover:text-warning/50'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall Rating */}
      <StarRating 
        value={formData.rating} 
        onChange={(v) => handleRatingClick('rating', v)}
        label="Overall Rating *"
      />

      {/* Sub-ratings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StarRating 
          value={formData.effectiveness_rating} 
          onChange={(v) => handleRatingClick('effectiveness_rating', v)}
          label="Effectiveness"
        />
        <StarRating 
          value={formData.side_effects_rating} 
          onChange={(v) => handleRatingClick('side_effects_rating', v)}
          label="Side Effects"
        />
        <StarRating 
          value={formData.ease_of_use_rating} 
          onChange={(v) => handleRatingClick('ease_of_use_rating', v)}
          label="Ease of Use"
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Review Title</Label>
        <Input
          id="title"
          placeholder="Summarize your experience"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Your Review *</Label>
        <Textarea
          id="content"
          placeholder="Share your experience with this medication..."
          rows={4}
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
        />
      </div>

      {/* Duration of Use */}
      <div className="space-y-2">
        <Label>How long have you used this medication?</Label>
        <Select 
          value={formData.duration_of_use} 
          onValueChange={(v) => setFormData(prev => ({ ...prev, duration_of_use: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pros */}
      <div className="space-y-2">
        <Label>Pros</Label>
        {formData.pros.map((pro, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="What did you like?"
              value={pro}
              onChange={(e) => handleProConChange('pros', index, e.target.value)}
            />
            {formData.pros.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => removeProCon('pros', index)}
              >
                ×
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addProCon('pros')}>
          + Add Pro
        </Button>
      </div>

      {/* Cons */}
      <div className="space-y-2">
        <Label>Cons</Label>
        {formData.cons.map((con, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="What didn't you like?"
              value={con}
              onChange={(e) => handleProConChange('cons', index, e.target.value)}
            />
            {formData.cons.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => removeProCon('cons', index)}
              >
                ×
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addProCon('cons')}>
          + Add Con
        </Button>
      </div>

      {/* Would Recommend */}
      <div className="flex items-center gap-2">
        <Switch
          checked={formData.would_recommend}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, would_recommend: checked }))}
        />
        <Label>I would recommend this medication</Label>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}