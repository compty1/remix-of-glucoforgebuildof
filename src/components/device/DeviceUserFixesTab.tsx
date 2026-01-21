import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeviceFixes, DeviceFix } from '@/hooks/useDeviceFixes';
import { 
  Lightbulb, 
  ThumbsUp, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Wrench,
  Zap,
  Target,
  Gauge
} from 'lucide-react';

interface DeviceUserFixesTabProps {
  deviceId: string | undefined;
  deviceName: string;
}

const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  sensor_extension: { label: 'Sensor Extension', icon: <Zap className="h-4 w-4" /> },
  adhesive: { label: 'Adhesive', icon: <Target className="h-4 w-4" /> },
  accuracy: { label: 'Accuracy', icon: <Gauge className="h-4 w-4" /> },
  app: { label: 'App/Software', icon: <Wrench className="h-4 w-4" /> },
  hardware: { label: 'Hardware', icon: <Wrench className="h-4 w-4" /> },
  calibration: { label: 'Calibration', icon: <Gauge className="h-4 w-4" /> },
  connectivity: { label: 'Connectivity', icon: <Zap className="h-4 w-4" /> },
  other: { label: 'Other', icon: <Lightbulb className="h-4 w-4" /> },
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

const sourceLabels: Record<string, string> = {
  reddit: 'Reddit',
  facebook: 'Facebook',
  tudiabetes: 'TuDiabetes',
  community: 'Community',
  glucoforge: 'GlucoForge',
};

const FixCard: React.FC<{ fix: DeviceFix }> = ({ fix }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {fix.category && categoryLabels[fix.category] && (
                <Badge variant="outline" className="gap-1">
                  {categoryLabels[fix.category].icon}
                  {categoryLabels[fix.category].label}
                </Badge>
              )}
              {fix.difficulty && (
                <Badge variant="outline" className={difficultyColors[fix.difficulty]}>
                  {fix.difficulty.charAt(0).toUpperCase() + fix.difficulty.slice(1)}
                </Badge>
              )}
              {fix.is_verified && (
                <Badge className="bg-success/10 text-success gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{fix.title}</CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span className="font-medium">{fix.votes}</span>
            </div>
            {fix.success_rate && (
              <Badge variant="secondary" className="text-xs">
                {fix.success_rate}% success
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{fix.description}</p>
        
        {fix.warnings && fix.warnings.length > 0 && (
          <Alert className="mb-4 bg-warning/5 border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-sm">
              <strong>Warnings:</strong>
              <ul className="list-disc list-inside mt-1">
                {fix.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {fix.detailed_steps && fix.detailed_steps.length > 0 && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="gap-2 text-primary p-0 h-auto"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expanded ? 'Hide Steps' : 'Show Steps'} ({fix.detailed_steps.length})
            </Button>
            
            {expanded && (
              <ol className="mt-3 space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                {fix.detailed_steps.map((step, idx) => (
                  <li key={idx} className="pl-2">{step}</li>
                ))}
              </ol>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            Source: {fix.source ? sourceLabels[fix.source] || fix.source : 'Community'}
          </span>
          {fix.source_url && (
            <Button variant="ghost" size="sm" className="gap-1 h-8" asChild>
              <a href={fix.source_url} target="_blank" rel="noopener noreferrer">
                Original Post
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DeviceUserFixesTab: React.FC<DeviceUserFixesTabProps> = ({ 
  deviceId, 
  deviceName 
}) => {
  const { data: fixes, isLoading, error } = useDeviceFixes(deviceId);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load user fixes. Please try again.</AlertDescription>
      </Alert>
    );
  }

  const categories = [...new Set(fixes?.map(f => f.category).filter(Boolean))];
  
  const filteredFixes = fixes?.filter(fix => {
    if (categoryFilter !== 'all' && fix.category !== categoryFilter) return false;
    if (difficultyFilter !== 'all' && fix.difficulty !== difficultyFilter) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-highlight" />
            User-Found Fixes
          </h2>
          <p className="text-muted-foreground">
            Community hacks and workarounds for {deviceName}
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {fixes?.length || 0} fixes shared
        </Badge>
      </div>

      {/* Disclaimer */}
      <Alert className="bg-muted/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Disclaimer:</strong> These fixes are community-contributed and not officially endorsed by manufacturers. 
          Use at your own risk. Some fixes may void warranties or affect device accuracy.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      {fixes && fixes.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => cat && (
                <SelectItem key={cat} value={cat}>
                  {categoryLabels[cat]?.label || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Fixes List */}
      {filteredFixes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Fixes Found</h3>
            <p className="text-muted-foreground">
              {fixes?.length === 0 
                ? `No community fixes have been shared for ${deviceName} yet.`
                : 'No fixes match your current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFixes.map((fix) => (
            <FixCard key={fix.id} fix={fix} />
          ))}
        </div>
      )}
    </div>
  );
};
