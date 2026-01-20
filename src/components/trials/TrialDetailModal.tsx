import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Building2,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  FileText
} from "lucide-react";

interface TrialLocation {
  facility?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

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
  locations?: TrialLocation[];
  recruiting_status?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  eligibility_criteria?: string;
  accepts_healthy_volunteers?: boolean;
  age_requirement_min?: number;
  age_requirement_max?: number;
  interventions?: string[];
  conditions?: string[];
}

interface TrialDetailModalProps {
  trial: Trial | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrialDetailModal({ trial, isOpen, onClose }: TrialDetailModalProps) {
  if (!trial) return null;

  const displayStatus = trial.recruiting_status || trial.status || "Unknown";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{trial.nct_id}</Badge>
            <Badge variant="secondary">{displayStatus}</Badge>
            {trial.phase && <Badge>{trial.phase}</Badge>}
          </div>
          <DialogTitle className="text-xl leading-tight">{trial.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Summary */}
            {trial.brief_summary && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Study Summary
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {trial.brief_summary}
                </p>
              </div>
            )}

            <Separator />

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trial.sponsor && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Building2 className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Sponsor</p>
                  <p className="text-sm font-medium">{trial.sponsor}</p>
                </div>
              )}
              
              {trial.enrollment && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Users className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Target Enrollment</p>
                  <p className="text-sm font-medium">{trial.enrollment.toLocaleString()}</p>
                </div>
              )}

              {trial.start_date && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">
                    {new Date(trial.start_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {trial.completion_date && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Est. Completion</p>
                  <p className="text-sm font-medium">
                    {new Date(trial.completion_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Eligibility */}
            <div>
              <h3 className="font-semibold mb-3">Eligibility</h3>
              <div className="space-y-2">
                {(trial.age_requirement_min || trial.age_requirement_max) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Ages {trial.age_requirement_min || 0} - {trial.age_requirement_max || 99} years
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  {trial.accepts_healthy_volunteers ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Accepts healthy volunteers</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Does not accept healthy volunteers</span>
                    </>
                  )}
                </div>
              </div>

              {trial.eligibility_criteria && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Eligibility Criteria
                  </p>
                  <p className="text-sm whitespace-pre-line line-clamp-6">
                    {trial.eligibility_criteria}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Locations */}
            {trial.locations && trial.locations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Study Locations ({trial.locations.length})
                </h3>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {trial.locations.map((location, index) => (
                    <div 
                      key={index} 
                      className="p-3 border rounded-lg text-sm"
                    >
                      {location.facility && (
                        <p className="font-medium">{location.facility}</p>
                      )}
                      <p className="text-muted-foreground">
                        {[location.city, location.state, location.zip]
                          .filter(Boolean)
                          .join(", ")}
                        {location.country && location.country !== "United States" && (
                          <>, {location.country}</>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(trial.contact_name || trial.contact_phone || trial.contact_email) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {trial.contact_name && (
                      <p className="text-sm">
                        <span className="font-medium">Contact:</span> {trial.contact_name}
                      </p>
                    )}
                    {trial.contact_phone && (
                      <a 
                        href={`tel:${trial.contact_phone}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {trial.contact_phone}
                      </a>
                    )}
                    {trial.contact_email && (
                      <a 
                        href={`mailto:${trial.contact_email}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {trial.contact_email}
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button className="flex-1" asChild>
                <a 
                  href={`https://clinicaltrials.gov/study/${trial.nct_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  View Full Details on ClinicalTrials.gov
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
