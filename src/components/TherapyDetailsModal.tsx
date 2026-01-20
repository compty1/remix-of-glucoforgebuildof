import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerifiedLink } from '@/components/ui/verified-link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Star,
  Building,
  Target,
  Building2,
  Beaker,
  AlertTriangle,
  Heart,
  ClipboardList,
  Sparkles
} from 'lucide-react';
import { CureTherapy } from '@/hooks/useCureMonitoring';

interface TherapyDetailsModalProps {
  therapy: CureTherapy | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TherapyDetailsModal: React.FC<TherapyDetailsModalProps> = ({
  therapy,
  isOpen,
  onClose,
}) => {
  if (!therapy) return null;

  const getPhaseColor = (phase: string) => {
    if (phase.includes('III') || phase === 'Approved') return 'bg-success text-success-foreground';
    if (phase.includes('II')) return 'bg-warning text-warning-foreground';
    if (phase.includes('I')) return 'bg-info text-info-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getMilestoneStatusIcon = (status: string) => {
    if (status === 'Completed') return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === 'In Progress') return <Clock className="h-4 w-4 text-warning" />;
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const milestones = therapy.milestones || [];
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const totalMilestones = milestones.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {therapy.is_featured && (
                      <Badge className="bg-amber-500 text-white gap-1">
                        <Sparkles className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                    <Badge className={getPhaseColor(therapy.phase)}>{therapy.phase}</Badge>
                    <Badge variant="outline">{therapy.category}</Badge>
                    <Badge variant="secondary">{therapy.status}</Badge>
                  </div>
                  <DialogTitle className="text-2xl font-heading mb-1">{therapy.name}</DialogTitle>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {therapy.sponsor}
                  </p>
                  {therapy.approach_type && (
                    <Badge variant="outline" className="mt-2">
                      {therapy.approach_type}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 fill-current text-warning" />
                    <span className="font-semibold text-lg">{therapy.confidence_score}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Confidence Score</p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Description and Mechanism */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{therapy.description}</p>
                  </div>
                  
                  {therapy.mechanism && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Beaker className="h-4 w-4 text-primary" />
                        Mechanism of Action
                      </h4>
                      <p className="text-sm text-muted-foreground">{therapy.mechanism}</p>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Clinical Progress</span>
                      <span className="font-semibold">{therapy.progress_percentage}%</span>
                    </div>
                    <Progress value={therapy.progress_percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Advantages and Risks */}
              {(therapy.advantages?.length || therapy.risks?.length) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {therapy.advantages && therapy.advantages.length > 0 && (
                    <Card className="border-success/30 bg-success/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-success">
                          <CheckCircle className="h-5 w-5" />
                          Advantages
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {therapy.advantages.map((advantage, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                              <span>{advantage}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {therapy.risks && therapy.risks.length > 0 && (
                    <Card className="border-warning/30 bg-warning/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-warning">
                          <AlertTriangle className="h-5 w-5" />
                          Risks & Considerations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {therapy.risks.map((risk, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Timeline & Status */}
              {(therapy.current_status_text || therapy.estimated_availability_text) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5" />
                      Timeline & Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {therapy.current_status_text && (
                      <div>
                        <h4 className="font-medium mb-1">Current Status</h4>
                        <p className="text-sm text-muted-foreground">{therapy.current_status_text}</p>
                      </div>
                    )}
                    {therapy.estimated_availability_text && (
                      <div>
                        <h4 className="font-medium mb-1">Estimated Availability</h4>
                        <p className="text-sm text-muted-foreground">{therapy.estimated_availability_text}</p>
                      </div>
                    )}
                    {therapy.estimated_completion && (
                      <div>
                        <h4 className="font-medium mb-1">Est. Trial Completion</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(therapy.estimated_completion).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Life After Treatment */}
              {(therapy.life_after_treatment || therapy.requirements?.length) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="h-5 w-5 text-primary" />
                      Life After Treatment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {therapy.life_after_treatment && (
                      <p className="text-sm text-muted-foreground">{therapy.life_after_treatment}</p>
                    )}
                    {therapy.requirements && therapy.requirements.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Ongoing Requirements</h4>
                        <div className="flex flex-wrap gap-2">
                          {therapy.requirements.map((req, index) => (
                            <Badge key={index} variant="secondary">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Clinical Trial IDs */}
              {therapy.clinical_trial_ids && therapy.clinical_trial_ids.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ClipboardList className="h-5 w-5" />
                      Clinical Trial Identifiers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {therapy.clinical_trial_ids.map((trialId, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`https://clinicaltrials.gov/study/${trialId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {trialId}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Milestones */}
              {milestones.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5" />
                      Clinical Milestones
                      <Badge variant="outline" className="ml-auto">
                        {completedMilestones}/{totalMilestones} Complete
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {milestones
                        .sort((a, b) => new Date(a.target_date || '').getTime() - new Date(b.target_date || '').getTime())
                        .map((milestone) => (
                        <div key={milestone.id} className="border-l-2 border-muted pl-4 relative">
                          <div className="absolute -left-2 top-0 bg-background p-1 rounded-full border">
                            {getMilestoneStatusIcon(milestone.status)}
                          </div>
                          <div className="pb-3">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">{milestone.title}</h4>
                              <Badge 
                                variant={
                                  milestone.status === 'Completed' ? 'default' :
                                  milestone.status === 'In Progress' ? 'secondary' : 'outline'
                                }
                                className="text-xs"
                              >
                                {milestone.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{milestone.description}</p>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Target: {milestone.target_date ? new Date(milestone.target_date).toLocaleDateString() : 'TBD'}
                              </span>
                              {milestone.completed_date && (
                                <span className="text-success">
                                  Completed: {new Date(milestone.completed_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {therapy.website_url && (
                  <VerifiedLink 
                    href={therapy.website_url}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Official Website
                  </VerifiedLink>
                )}

                <Link to={`/companies?search=${encodeURIComponent(therapy.sponsor)}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Building2 className="h-4 w-4 mr-2" />
                    View Sponsor Company
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};