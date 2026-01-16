import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from './StarRating';
import { useAuthStore } from '@/store/authStore';
import { PenLine, Plus, X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserReviewFormProps {
  onSubmit: (review: {
    rating: number;
    title: string;
    content: string;
    pros: string[];
    cons: string[];
    ownership_duration: string | null;
  }) => Promise<boolean>;
  initialData?: {
    rating: number;
    title: string;
    content: string;
    pros: string[];
    cons: string[];
    ownership_duration: string | null;
  };
  isEditing?: boolean;
  onCancel?: () => void;
}

export const UserReviewForm: React.FC<UserReviewFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
  onCancel
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [pros, setPros] = useState<string[]>(initialData?.pros || []);
  const [cons, setCons] = useState<string[]>(initialData?.cons || []);
  const [ownershipDuration, setOwnershipDuration] = useState(initialData?.ownership_duration || '');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isEditing);

  const handleAddPro = () => {
    if (newPro.trim() && pros.length < 5) {
      setPros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const handleAddCon = () => {
    if (newCon.trim() && cons.length < 5) {
      setCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }

    if (content.length < 50) {
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      rating,
      title,
      content,
      pros,
      cons,
      ownership_duration: ownershipDuration || null
    });

    if (success) {
      if (!isEditing) {
        setRating(0);
        setTitle('');
        setContent('');
        setPros([]);
        setCons([]);
        setOwnershipDuration('');
        setIsExpanded(false);
      }
    }
    setIsSubmitting(false);
  };

  if (!user) {
    return (
      <Card className="command-center-widget">
        <CardContent className="p-6 text-center">
          <PenLine className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Share Your Experience</h3>
          <p className="text-muted-foreground mb-4">
            Log in to write a review and help other users make informed decisions.
          </p>
          <Button onClick={() => navigate('/auth')}>
            <LogIn className="h-4 w-4 mr-2" />
            Log In to Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isExpanded && !isEditing) {
    return (
      <Card className="command-center-widget">
        <CardContent className="p-6">
          <Button onClick={() => setIsExpanded(true)} className="w-full">
            <PenLine className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="command-center-widget">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PenLine className="h-5 w-5" />
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <StarRating
              rating={rating}
              size="lg"
              interactive
              onRatingChange={setRating}
            />
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">Please select a rating</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title *</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="review-content">Your Review *</Label>
            <Textarea
              id="review-content"
              placeholder="Share details about your experience with this device... (minimum 50 characters)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={50}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/50 characters minimum
            </p>
          </div>

          {/* Ownership Duration */}
          <div className="space-y-2">
            <Label>How long have you used this device?</Label>
            <Select value={ownershipDuration} onValueChange={setOwnershipDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="less_than_month">Less than 1 month</SelectItem>
                <SelectItem value="1_to_6_months">1-6 months</SelectItem>
                <SelectItem value="6_to_12_months">6-12 months</SelectItem>
                <SelectItem value="1_to_2_years">1-2 years</SelectItem>
                <SelectItem value="more_than_2_years">More than 2 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pros */}
          <div className="space-y-2">
            <Label>Pros (up to 5)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a pro..."
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())}
                disabled={pros.length >= 5}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={handleAddPro}
                disabled={pros.length >= 5 || !newPro.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {pros.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {pros.map((pro, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 bg-success/10 text-success px-3 py-1 rounded-full text-sm"
                  >
                    <span>{pro}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemovePro(index)}
                      className="hover:bg-success/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cons */}
          <div className="space-y-2">
            <Label>Cons (up to 5)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a con..."
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())}
                disabled={cons.length >= 5}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={handleAddCon}
                disabled={cons.length >= 5 || !newCon.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {cons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {cons.map((con, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm"
                  >
                    <span>{con}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCon(index)}
                      className="hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0 || !title.trim() || content.length < 50}
            >
              {isSubmitting ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
            </Button>
            {(isExpanded || onCancel) && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  } else {
                    setIsExpanded(false);
                  }
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};