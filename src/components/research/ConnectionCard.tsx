import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Apple, 
  Dna, 
  Smartphone, 
  FlaskConical, 
  TreePine, 
  HeartPulse, 
  Pill,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  TestTube,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import type { FoundConnection, ConnectionType } from '@/hooks/useFoundConnections';

interface ConnectionCardProps {
  connection: FoundConnection;
}

const typeConfig: Record<ConnectionType, { icon: React.ElementType; label: string; color: string }> = {
  food: { icon: Apple, label: 'Food Connection', color: 'text-success bg-success/10 border-success/20' },
  biology: { icon: Dna, label: 'Biology Connection', color: 'text-accent-foreground bg-accent/10 border-accent/20' },
  device: { icon: Smartphone, label: 'Device Connection', color: 'text-primary bg-primary/10 border-primary/20' },
  chemical: { icon: FlaskConical, label: 'Chemical Connection', color: 'text-warning bg-warning/10 border-warning/20' },
  environmental: { icon: TreePine, label: 'Environmental Connection', color: 'text-brand-teal bg-brand-teal/10 border-brand-teal/20' },
  symptom: { icon: HeartPulse, label: 'Symptom Connection', color: 'text-destructive bg-destructive/10 border-destructive/20' },
  treatment: { icon: Pill, label: 'Treatment Connection', color: 'text-info bg-info/10 border-info/20' },
};

const validationConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  confirmed: { label: 'Confirmed', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  emerging: { label: 'Emerging', color: 'bg-warning/10 text-warning border-warning/20', icon: AlertCircle },
  hypothesis: { label: 'Hypothesis', color: 'bg-muted text-muted-foreground border-border', icon: Lightbulb },
};

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection }) => {
  const [mechanismOpen, setMechanismOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  const typeInfo = typeConfig[connection.connection_type];
  const validationInfo = validationConfig[connection.validation_status];
  const TypeIcon = typeInfo.icon;
  const ValidationIcon = validationInfo.icon;

  const totalSources = 
    connection.source_papers.length + 
    connection.source_posts.length + 
    connection.source_trials.length;

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={typeInfo.color}>
              <TypeIcon className="h-3 w-3 mr-1" />
              {typeInfo.label.replace(' Connection', '')}
            </Badge>
            <Badge variant="outline" className={validationInfo.color}>
              <ValidationIcon className="h-3 w-3 mr-1" />
              {validationInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">{connection.confidence_score}%</div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-highlight">{connection.novelty_score}%</div>
              <div className="text-xs text-muted-foreground">Novelty</div>
            </div>
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{connection.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {connection.description}
        </p>

        {/* Sources summary */}
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
          {connection.source_papers.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">{connection.source_papers.length}</span>
              <span className="text-muted-foreground">Papers</span>
            </div>
          )}
          {connection.source_posts.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <MessageSquare className="h-4 w-4 text-success" />
              <span className="font-medium">{connection.source_posts.length}</span>
              <span className="text-muted-foreground">Community</span>
            </div>
          )}
          {connection.source_trials.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <TestTube className="h-4 w-4 text-accent-foreground" />
              <span className="font-medium">{connection.source_trials.length}</span>
              <span className="text-muted-foreground">Trials</span>
            </div>
          )}
          {connection.cross_validation_count > 0 && (
            <div className="flex items-center gap-1.5 text-sm ml-auto">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Cross-validated</span>
            </div>
          )}
        </div>

        {/* Biological Mechanism */}
        {connection.biological_mechanism && (
          <Collapsible open={mechanismOpen} onOpenChange={setMechanismOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Dna className="h-4 w-4" />
                  Biological Mechanism
                </span>
                {mechanismOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                {connection.biological_mechanism}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Practical Tips */}
        {connection.practical_implications.length > 0 && (
          <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Practical Tips ({connection.practical_implications.length})
                </span>
                {tipsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <ul className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {connection.practical_implications.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-highlight font-medium">{idx + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Keywords */}
        {connection.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {connection.keywords.slice(0, 6).map((keyword, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {connection.keywords.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{connection.keywords.length - 6} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
