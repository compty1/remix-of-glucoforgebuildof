import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Calendar, BookOpen, TrendingUp } from 'lucide-react';

interface ResearchItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  source: string;
  impact_level: string;
  created_at: string;
  updated_at: string;
}

interface ResearchAnalysisModalProps {
  item: ResearchItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchAnalysisModal: React.FC<ResearchAnalysisModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!item) return null;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-heading leading-tight mb-3">
                {item.title}
              </DialogTitle>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getImpactColor(item.impact_level)}>
                  {item.impact_level} Impact
                </Badge>
                <Badge variant="outline">{item.source}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Detailed Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Detailed Analysis
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-foreground leading-relaxed">
                {item.summary}
              </p>
            </div>
          </div>

          <Separator />

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Research Impact
              </h4>
              <p className="text-sm text-muted-foreground">
                This research has been classified as <strong>{item.impact_level.toLowerCase()} impact</strong> based on its potential significance to the Type 1 diabetes community.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Source Database</h4>
              <p className="text-sm text-muted-foreground">
                Originally published and indexed in <strong>{item.source}</strong>, ensuring peer-reviewed quality and scientific rigor.
              </p>
            </div>
          </div>

          <Separator />

          {/* Clinical Relevance */}
          <div>
            <h4 className="font-semibold mb-3">Clinical Relevance</h4>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <p className="text-sm text-foreground">
                This research contributes to our understanding of Type 1 diabetes management and may influence future treatment protocols. 
                For the most current clinical applications, please consult with your healthcare provider.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              className="flex-1"
              onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Read Full Study
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};