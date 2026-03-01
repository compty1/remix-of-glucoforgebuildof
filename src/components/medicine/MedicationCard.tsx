import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Clock, DollarSign, Info, ChevronRight } from 'lucide-react';
import { EntityLogo } from '@/components/ui/entity-logo';

// C48: Import from useMedications instead of duplicating
import type { Medication } from '@/hooks/useMedications';

interface MedicationCardProps {
  medication: Medication;
  isSelected: boolean;
  onToggleCompare: (id: string) => void;
  onViewDetails: (medication: Medication) => void;
  compareDisabled?: boolean;
}

export function MedicationCard({ 
  medication, 
  isSelected, 
  onToggleCompare, 
  onViewDetails,
  compareDisabled = false
}: MedicationCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'insulin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'oral':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'injectable':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const hasTimingData = medication.onset_time || medication.peak_time || medication.duration;

  // Get manufacturer logo based on manufacturer name
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          {/* Manufacturer Logo */}
          <EntityLogo 
            type="medication"
            name={medication.manufacturer || medication.name}
            size="sm"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{medication.name}</h3>
            {medication.generic_name && (
              <p className="text-sm text-muted-foreground truncate">
                {medication.generic_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleCompare(medication.id)}
              disabled={compareDisabled && !isSelected}
              aria-label={`Compare ${medication.name}`}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge className={getCategoryColor(medication.category)}>
            {medication.category}
          </Badge>
          {medication.subcategory && (
            <Badge variant="outline" className="text-xs">
              {medication.subcategory}
            </Badge>
          )}
          {medication.fda_status && (
            <Badge variant="secondary" className="text-xs">
              {medication.fda_status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {medication.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {medication.description}
          </p>
        )}

        {/* Rating */}
        {/* C5/C9: Use computed avg_rating with fallback to seed rating_avg */}
        {((medication as any).avg_rating || medication.rating_avg) && (
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium">{((medication as any).avg_rating ?? medication.rating_avg)?.toFixed(1)}</span>
            {medication.review_count != null && medication.review_count > 0 && (
              <span className="text-sm text-muted-foreground">
                ({medication.review_count} reviews)
              </span>
            )}
          </div>
        )}

        {/* Timing Data for Insulins */}
        {hasTimingData && (
          <div className="flex items-center gap-4 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {medication.onset_time && (
                <span><span className="text-muted-foreground">Onset:</span> {medication.onset_time}</span>
              )}
              {medication.peak_time && (
                <span><span className="text-muted-foreground">Peak:</span> {medication.peak_time}</span>
              )}
              {medication.duration && (
                <span><span className="text-muted-foreground">Duration:</span> {medication.duration}</span>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center gap-4 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {medication.avg_price && (
              <span><span className="text-muted-foreground">Retail:</span> ${medication.avg_price}</span>
            )}
            {medication.medicare_price && (
              <span><span className="text-muted-foreground">Medicare:</span> ${medication.medicare_price}</span>
            )}
          </div>
        </div>

        {/* Key Features */}
        {medication.key_features && medication.key_features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {medication.key_features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-2">
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-primary/10 group-hover:border-primary/30"
            onClick={() => onViewDetails(medication)}
          >
            Learn More
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
