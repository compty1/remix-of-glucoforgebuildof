import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeviceIssue } from '@/hooks/useDeviceDetails';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  Users,
  Lightbulb,
  Wrench,
  ExternalLink,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';

interface DeviceIssuesTabProps {
  issues: DeviceIssue[];
  onReportIssue: () => void;
  deviceName?: string;
}

interface RelatedPost {
  id: string;
  post_id: string;
  title: string;
  content: string | null;
  source: string;
  score: number | null;
  num_comments: number | null;
  published_at: string | null;
  url: string | null;
}

function IssueRelatedPosts({ issueTitle, deviceName }: { issueTitle: string; deviceName?: string }) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  // Search for related community posts based on issue keywords
  const { data: relatedPosts = [], isLoading } = useQuery({
    queryKey: ['issue-related-posts', issueTitle, deviceName],
    queryFn: async () => {
      // Extract keywords from issue title
      const keywords = issueTitle.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 3);

      if (keywords.length === 0) return [];

      // Build search query
      const searchPattern = keywords.map(k => `%${k}%`);
      
      let query = supabase
        .from('community_posts')
        .select('id, post_id, title, content, source, score, num_comments, published_at, url')
        .order('score', { ascending: false })
        .limit(10);

      // Search for posts containing keywords in title or content
      const orConditions = searchPattern.map(pattern => 
        `title.ilike.${pattern},content.ilike.${pattern}`
      ).join(',');
      
      query = query.or(orConditions);

      // Optionally filter by device
      if (deviceName) {
        query = query.or(`device_mentioned.ilike.%${deviceName}%,title.ilike.%${deviceName}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        return [];
      }
      
      return data as RelatedPost[];
    },
    enabled: !!issueTitle,
  });

  const displayedPosts = showAll ? relatedPosts : relatedPosts.slice(0, 3);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Loading related discussions...
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2 bg-muted/30 rounded-lg p-3">
        <MessageSquare className="h-4 w-4 inline mr-2" />
        No community discussions found for this issue yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        Related Community Discussions ({relatedPosts.length})
      </h5>
      <div className="space-y-2">
        {displayedPosts.map((post) => (
          <Card 
            key={post.id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors border-l-2 border-primary/30"
            onClick={() => navigate(`/community/${post.post_id}`)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h6 className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
                    {post.title}
                  </h6>
                  {post.content && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {post.content}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {post.source}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {post.score !== null && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {post.score}
                  </span>
                )}
                {post.num_comments !== null && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {post.num_comments}
                  </span>
                )}
                {post.published_at && (
                  <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {relatedPosts.length > 3 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setShowAll(!showAll);
          }}
        >
          {showAll ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show {relatedPosts.length - 3} More
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export const DeviceIssuesTab: React.FC<DeviceIssuesTabProps> = ({ 
  issues,
  onReportIssue,
  deviceName
}) => {
  const getSeverityBadge = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>;
      case 'medium':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Medium</Badge>;
      case 'low':
        return <Badge className="bg-success/10 text-success border-success/20">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with report button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Known Issues</h2>
          <p className="text-muted-foreground text-sm">
            Community-reported problems and solutions
          </p>
        </div>
        <Button onClick={onReportIssue} variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Report New Issue
        </Button>
      </div>

      {issues.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-4">
          {issues.map((issue) => (
            <AccordionItem 
              key={issue.id} 
              value={issue.id}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-start gap-4 text-left w-full pr-4">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    issue.severity === 'high' || issue.severity === 'critical' 
                      ? 'text-destructive' 
                      : issue.severity === 'medium' 
                        ? 'text-warning' 
                        : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold">{issue.issue_title}</h3>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {issue.community_reports || 0} reports
                      </span>
                      {issue.frequency_percentage && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {issue.frequency_percentage}% frequency
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 pt-2">
                  {/* Description */}
                  {issue.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    </div>
                  )}

                  {/* FDA MAUDE Stats */}
                  {(issue.fda_maude_count && issue.fda_maude_count > 0) && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-medium text-primary">FDA MAUDE Reports</h4>
                        </div>
                        <span className="text-lg font-bold text-primary">{issue.fda_maude_count?.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Adverse events reported to FDA Manufacturer and User Facility Device Experience database
                      </p>
                      <a 
                        href="https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Search FDA MAUDE <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Official Solution */}
                  {issue.solution && (
                    <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-success" />
                        <h4 className="text-sm font-medium text-success">Official Solution</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.solution}</p>
                    </div>
                  )}

                  {/* Community Workaround */}
                  {issue.workaround && (
                    <div className="bg-highlight/5 border border-highlight/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4 text-highlight" />
                        <h4 className="text-sm font-medium text-highlight">Community Workaround</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.workaround}</p>
                    </div>
                  )}

                  {/* Related Community Posts */}
                  <IssueRelatedPosts issueTitle={issue.issue_title} deviceName={deviceName} />

                  {/* No solution available */}
                  {!issue.solution && !issue.workaround && (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        No solution or workaround available yet. Check back later or contact manufacturer support.
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="command-center-widget">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Issues Reported</h3>
            <p className="text-muted-foreground mb-4">
              No known issues have been reported for this device yet.
            </p>
            <Button onClick={onReportIssue} variant="outline">
              Be the first to report an issue
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
