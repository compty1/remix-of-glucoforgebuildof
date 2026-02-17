import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeviceSolutions, DeviceSolution } from '@/hooks/useDeviceSolutions';
import { 
  Search, 
  ThumbsUp, 
  CheckCircle2, 
  ExternalLink, 
  Lightbulb, 
  MessageSquare, 
  AlertTriangle,
  Filter,
  Wrench,
  BookmarkPlus
} from 'lucide-react';
import { useSavedIssues } from '@/hooks/useSavedIssues';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface DeviceSolutionsTabProps {
  deviceId: string;
  deviceName: string;
}

export const DeviceSolutionsTab: React.FC<DeviceSolutionsTabProps> = ({ deviceId, deviceName }) => {
  const { solutions, categories, isLoading, totalCount } = useDeviceSolutions(deviceId, deviceName);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { createIssue } = useSavedIssues();
  const { user } = useAuthStore();

  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = !searchQuery || 
      solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solution.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || solution.category === selectedCategory;
    const matchesType = selectedType === 'all' || solution.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleSaveIssue = async (solution: DeviceSolution) => {
    if (!user) {
      toast.error('Please sign in to save solutions');
      return;
    }
    try {
      await createIssue.mutateAsync({
        title: solution.title,
        description: `${solution.description}${solution.sourceUrl ? `\n\nSource: ${solution.sourceUrl}` : ''}`,
        category: deviceName,
      });
      toast.success('Solution saved to your issues');
    } catch (error) {
      toast.error('Failed to save solution');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fix': return <Wrench className="h-4 w-4" />;
      case 'post': return <MessageSquare className="h-4 w-4" />;
      case 'issue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fix': return 'bg-success/10 text-success border-success/20';
      case 'post': return 'bg-primary/10 text-primary border-primary/20';
      case 'issue': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'hard': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Device Solutions</h3>
          <p className="text-sm text-muted-foreground">
            {totalCount} solutions from user fixes, community posts, and known issues
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search solutions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat || 'uncategorized'}>{cat || 'Uncategorized'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fix">User Fixes</SelectItem>
            <SelectItem value="post">Community Posts</SelectItem>
            <SelectItem value="issue">Known Issues</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Solutions Grid */}
      {filteredSolutions.length === 0 ? (
        <Card className="p-8 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">No Solutions Found</h4>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSolutions.map((solution) => (
            <Card key={`${solution.type}-${solution.id}`} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getTypeColor(solution.type)}>
                        {getTypeIcon(solution.type)}
                        <span className="ml-1 capitalize">{solution.type}</span>
                      </Badge>
                      {solution.category && (
                        <Badge variant="secondary" className="text-xs">
                          {solution.category}
                        </Badge>
                      )}
                      {solution.isVerified && (
                        <Badge className="bg-success/10 text-success border-success/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {solution.difficulty && (
                        <Badge className={getDifficultyColor(solution.difficulty)}>
                          {solution.difficulty}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{solution.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {solution.votes !== undefined && solution.votes > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        {solution.votes}
                      </div>
                    )}
                    {solution.successRate !== undefined && (
                      <Badge variant="outline" className="bg-success/10 text-success">
                        {solution.successRate}% success
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {solution.description}
                </p>
                
                {/* Solution or Workaround for Issues */}
                {solution.solution && (
                  <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-success mb-1">Solution</p>
                    <p className="text-sm">{solution.solution}</p>
                  </div>
                )}
                
                {solution.workaround && !solution.solution && (
                  <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-warning mb-1">Workaround</p>
                    <p className="text-sm">{solution.workaround}</p>
                  </div>
                )}

                {/* Detailed Steps for Fixes */}
                {solution.detailedSteps && solution.detailedSteps.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Steps:</p>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      {solution.detailedSteps.slice(0, 3).map((step, idx) => (
                        <li key={idx} className="text-muted-foreground">{step}</li>
                      ))}
                      {solution.detailedSteps.length > 3 && (
                        <li className="text-muted-foreground">...and {solution.detailedSteps.length - 3} more steps</li>
                      )}
                    </ol>
                  </div>
                )}

                {/* Warnings */}
                {solution.warnings && solution.warnings.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-destructive mb-1">⚠️ Warnings</p>
                    <ul className="text-sm space-y-1">
                      {solution.warnings.map((warning, idx) => (
                        <li key={idx} className="text-muted-foreground">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {solution.source && <span>via {solution.source}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveIssue(solution)}
                    >
                      <BookmarkPlus className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    {solution.sourceUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={solution.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Source
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
