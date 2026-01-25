import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import type { ConfidenceBand, ValidationFlag } from '@/types/glucose-analysis';
import { getConfidenceBandDescription, getConfidenceBandColor } from '@/config/glucose-validation-rules';

interface ConfidenceScoreBadgeProps {
  score: number;
  band: ConfidenceBand;
  validationFlags?: ValidationFlag[];
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ConfidenceScoreBadge: React.FC<ConfidenceScoreBadgeProps> = ({
  score,
  band,
  validationFlags = [],
  showDetails = true,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    switch (band) {
      case 'high':
        return <ShieldCheck className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
      case 'moderate':
        return <Shield className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
      case 'low':
        return <ShieldAlert className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
      case 'unreliable':
        return <ShieldX className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
      default:
        return <Shield className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />;
    }
  };

  const getBandLabel = () => {
    switch (band) {
      case 'high':
        return 'High Confidence';
      case 'moderate':
        return 'Moderate';
      case 'low':
        return 'Low Confidence';
      case 'unreliable':
        return 'Unreliable';
      default:
        return 'Unknown';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ShieldX className="h-3 w-3 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      case 'medium':
        return <Info className="h-3 w-3 text-yellow-500" />;
      default:
        return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const colorClasses = getConfidenceBandColor(band);
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
      ? 'text-base px-4 py-2' 
      : 'text-sm px-3 py-1';

  if (!showDetails || validationFlags.length === 0) {
    return (
      <Badge 
        variant="outline" 
        className={`${colorClasses} ${sizeClasses} flex items-center gap-1.5 border`}
      >
        {getIcon()}
        <span>{score}% — {getBandLabel()}</span>
      </Badge>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${colorClasses} ${sizeClasses} flex items-center gap-1.5 border`}
        >
          {getIcon()}
          <span>{score}% — {getBandLabel()}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Data Quality Score</h4>
            <Badge variant="outline" className={colorClasses}>
              {score}/100
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {getConfidenceBandDescription(band)}
          </p>
          
          {validationFlags.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Issues Detected ({validationFlags.length})
              </h5>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {validationFlags.map((flag, index) => (
                  <div 
                    key={`${flag.id}-${index}`}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs"
                  >
                    {getSeverityIcon(flag.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{flag.id.replace(/_/g, ' ')}</p>
                      <p className="text-muted-foreground truncate">{flag.message}</p>
                      <span className="text-destructive">-{flag.penalty} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-2 border-t">
            <p className="text-[10px] text-muted-foreground">
              💡 Confidence affects how much weight to give to analysis findings.
              Low scores mean some metrics may be inaccurate.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConfidenceScoreBadge;
