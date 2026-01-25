import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityLogo } from "@/components/ui/entity-logo";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Building2,
  ChevronRight,
  ExternalLink
} from "lucide-react";

interface Trial {
  nct_id: string;
  title: string;
  brief_summary?: string;
  status?: string;
  phase?: string;
  start_date?: string;
  completion_date?: string;
  sponsor?: string;
  enrollment?: number;
  locations?: Array<{
    facility?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  }>;
  recruiting_status?: string;
}

interface TrialCardProps {
  trial: Trial;
  onViewDetails: () => void;
}

const statusColors: Record<string, string> = {
  "Recruiting": "bg-success/10 text-success border-success/20",
  "Active, not recruiting": "bg-warning/10 text-warning border-warning/20",
  "Enrolling by invitation": "bg-info/10 text-info border-info/20",
  "Completed": "bg-muted text-muted-foreground",
  "Terminated": "bg-destructive/10 text-destructive border-destructive/20",
};

const phaseColors: Record<string, string> = {
  "Phase 1": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Phase 2": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Phase 3": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "Phase 4": "bg-green-500/10 text-green-600 dark:text-green-400",
};

export function TrialCard({ trial, onViewDetails }: TrialCardProps) {
  const locationCount = trial.locations?.length || 0;
  const firstLocation = trial.locations?.[0];
  const displayStatus = trial.recruiting_status || trial.status || "Unknown";

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={statusColors[displayStatus] || "bg-muted"}
              >
                {displayStatus}
              </Badge>
              {trial.phase && (
                <Badge 
                  variant="secondary" 
                  className={phaseColors[trial.phase] || ""}
                >
                  {trial.phase}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {trial.title}
            </h3>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {trial.nct_id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {trial.brief_summary && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {trial.brief_summary}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {trial.sponsor && (
            <div className="flex items-start gap-2">
              <EntityLogo
                type="company"
                name={trial.sponsor}
                size="sm"
                className="mt-0.5"
              />
              <div>
                <p className="text-xs text-muted-foreground">Sponsor</p>
                <p className="text-sm font-medium line-clamp-1">{trial.sponsor}</p>
              </div>
            </div>
          )}
          
          {trial.enrollment && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Enrollment</p>
                <p className="text-sm font-medium">{trial.enrollment.toLocaleString()}</p>
              </div>
            </div>
          )}

          {firstLocation && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">
                  {firstLocation.city}, {firstLocation.state}
                  {locationCount > 1 && (
                    <span className="text-muted-foreground"> +{locationCount - 1}</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {trial.completion_date && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Est. Completion</p>
                <p className="text-sm font-medium">
                  {new Date(trial.completion_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={onViewDetails}
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            asChild
          >
            <a 
              href={`https://clinicaltrials.gov/study/${trial.nct_id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              title="View on ClinicalTrials.gov"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
