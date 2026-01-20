import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, X, Filter } from 'lucide-react';
import { useSourceCategories } from '@/hooks/useSourceCategories';

interface BrowseBySourceProps {
  selectedSource: string | null;
  onSourceSelect: (source: string | null) => void;
}

export const BrowseBySource: React.FC<BrowseBySourceProps> = ({
  selectedSource,
  onSourceSelect,
}) => {
  const { data, isLoading } = useSourceCategories();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Browse by Source
        </CardTitle>
        {selectedSource && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSourceSelect(null)}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filter
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-3">
          <div className="space-y-2">
            {data?.categorized.map(category => (
              <Collapsible
                key={category.category}
                open={expandedCategories.includes(category.category)}
                onOpenChange={() => toggleCategory(category.category)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        expandedCategories.includes(category.category) ? 'rotate-90' : ''
                      }`}
                    />
                    <Badge variant="outline" className={category.color}>
                      {category.label}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {category.totalCount} posts
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-6 mt-1 space-y-1">
                    {category.sources.map(source => (
                      <button
                        key={source.source}
                        onClick={() => onSourceSelect(source.source)}
                        className={`flex items-center justify-between w-full px-2 py-1.5 rounded text-sm hover:bg-muted/50 transition-colors ${
                          selectedSource === source.source
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <span className="truncate">{source.source}</span>
                        <span className="text-xs">({source.count})</span>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
