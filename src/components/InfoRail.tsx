import React from 'react';
import { Info } from 'lucide-react';

interface InfoRailProps {
  whatThisShows?: string;
  whyItMatters?: string;
  nextSteps?: string;
  className?: string;
}

export const InfoRail: React.FC<InfoRailProps> = ({
  whatThisShows,
  whyItMatters,
  nextSteps,
  className = "",
}) => {
  return (
    <div className={`info-rail ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-5 w-5 text-highlight" />
        <h4 className="font-heading text-sm font-semibold text-highlight">
          Understanding This Data
        </h4>
      </div>
      
      {whatThisShows && (
        <div className="mb-3">
          <h5 className="font-medium text-sm text-foreground mb-1">What This Shows</h5>
          <p className="text-sm text-muted-foreground leading-relaxed">{whatThisShows}</p>
        </div>
      )}
      
      {whyItMatters && (
        <div className="mb-3">
          <h5 className="font-medium text-sm text-foreground mb-1">Why It Matters</h5>
          <p className="text-sm text-muted-foreground leading-relaxed">{whyItMatters}</p>
        </div>
      )}
      
      {nextSteps && (
        <div>
          <h5 className="font-medium text-sm text-foreground mb-1">Next Steps</h5>
          <p className="text-sm text-muted-foreground leading-relaxed">{nextSteps}</p>
        </div>
      )}
    </div>
  );
};