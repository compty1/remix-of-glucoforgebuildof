import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerifiedLink } from '@/components/ui/verified-link';
import { 
  ExternalLink, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Star,
  Building,
  Target,
  Building2
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-heading mb-2">{therapy.name}</DialogTitle>
              <div className="flex gap-2 mb-3">
                <Badge className={getPhaseColor(therapy.phase)}>{therapy.phase}</Badge>
                <Badge variant="outline">{therapy.category}</Badge>
                <Badge variant="secondary">{therapy.status}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 fill-current text-warning" />
                <span className="font-semibold">{therapy.confidence_score}% Confidence</span>
              </div>
              <p className="text-sm text-muted-foreground">Clinical Assessment</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{therapy.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Sponsor
                  </h4>
                  <p className="text-sm text-muted-foreground">{therapy.sponsor}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Est. Completion
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {therapy.estimated_completion ? new Date(therapy.estimated_completion).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Clinical Progress</span>
                  <span className="font-semibold">{therapy.progress_percentage}%</span>
                </div>
                <Progress value={therapy.progress_percentage} className="h-2" />
              </div>

              {therapy.website_url && (
                <VerifiedLink 
                  href={therapy.website_url}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Official Website
                </VerifiedLink>
              )}

              {/* Link to company if sponsor matches */}
              <Link to={`/companies?search=${encodeURIComponent(therapy.sponsor)}`}>
                <Button variant="outline" className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  View Sponsor Company
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Clinical Milestones
                <Badge variant="outline" className="ml-auto">
                  {completedMilestones}/{totalMilestones} Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {milestones.length > 0 ? (
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
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No milestone data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};