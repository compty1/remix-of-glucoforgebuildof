import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  FileText, 
  Building2, 
  Pill, 
  Cpu, 
  FlaskConical,
  Users,
  X,
  Command,
  MessageSquare,
  Newspaper
} from 'lucide-react';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  project: <FileText className="h-4 w-4" />,
  research: <FlaskConical className="h-4 w-4" />,
  medication: <Pill className="h-4 w-4" />,
  device: <Cpu className="h-4 w-4" />,
  company: <Building2 className="h-4 w-4" />,
  trial: <Users className="h-4 w-4" />,
  community: <MessageSquare className="h-4 w-4" />,
  article: <Newspaper className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  project: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  research: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  medication: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  device: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  company: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  trial: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  community: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  article: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const categoryLabels: Record<string, string> = {
  project: 'Projects',
  research: 'Research',
  medication: 'Medications',
  device: 'Devices',
  company: 'Companies',
  trial: 'Clinical Trials',
  community: 'Community Posts',
  article: 'Articles',
};

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { results, isLoading, search } = useGlobalSearch();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        search(query);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  }, [results, selectedIndex, onOpenChange]);

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    navigate(result.url);
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search devices, medications, research, community posts..."
            className="border-0 focus-visible:ring-0 text-lg placeholder:text-muted-foreground/70"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-muted rounded"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.length < 2 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Command className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Type at least 2 characters to search</p>
              <p className="text-sm mt-2">
                Searches across devices, medications, research, trials, community posts, and articles
              </p>
              <p className="text-sm mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↓</kbd> to navigate,{' '}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to select
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-sm mt-2">Try different keywords or browse categories</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    {categoryIcons[category]}
                    {categoryLabels[category] || category} ({items.length})
                  </div>
                  {items.map((result) => {
                    const globalIndex = results.indexOf(result);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${categoryColors[result.category]}`}>
                          {categoryIcons[result.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {result.description}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {categoryLabels[result.category] || result.category}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
          <span>
            <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">⌘</kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">K</kbd>
            {' to open search'}
          </span>
          <span>{results.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
