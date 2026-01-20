import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ChevronDown, ChevronUp, ThumbsUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Source {
  title: string;
  url: string | null;
  source: string;
  score: number | null;
}

interface SourceAttributionProps {
  sources: Source[];
  onSavePost?: (source: Source) => void;
}

export function SourceAttribution({ sources, onSavePost }: SourceAttributionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          📚 {sources.length} {sources.length === 1 ? 'Source' : 'Sources'}
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="space-y-2 pl-2 border-l-2 border-muted">
          {sources.map((source, index) => (
            <div 
              key={index} 
              className="flex items-start justify-between gap-2 text-xs bg-muted/30 rounded-md p-2"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {source.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    {source.source}
                  </Badge>
                  {source.score !== null && source.score > 0 && (
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {source.score}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {source.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    asChild
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View original"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
