import React from 'react';
import { SlidersHorizontal, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdultSearchFilters } from '@/hooks/useAdultContentSearch';

interface AdultFilterBarProps {
  filters: AdultSearchFilters;
  onFilterChange: (filters: Partial<AdultSearchFilters>) => void;
  onReset: () => void;
}

export const AdultFilterBar: React.FC<AdultFilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.sentiment !== 'all' ||
    filters.sourceType !== 'all' ||
    filters.postType !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters:</span>
      </div>

      <Select value={filters.category} onValueChange={(v) => onFilterChange({ category: v })}>
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="intimacy">Intimacy & Sex</SelectItem>
          <SelectItem value="alcohol">Alcohol</SelectItem>
          <SelectItem value="drug_effects">Substances</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.sentiment} onValueChange={(v) => onFilterChange({ sentiment: v })}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Sentiment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sentiments</SelectItem>
          <SelectItem value="positive">Positive</SelectItem>
          <SelectItem value="neutral">Neutral</SelectItem>
          <SelectItem value="negative">Negative</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.sourceType} onValueChange={(v) => onFilterChange({ sourceType: v })}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Source Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="reddit">Reddit</SelectItem>
          <SelectItem value="research">Research</SelectItem>
          <SelectItem value="organization">Organization</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.postType} onValueChange={(v) => onFilterChange({ postType: v })}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Post Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="post">Community Post</SelectItem>
          <SelectItem value="guide">Guide</SelectItem>
          <SelectItem value="research">Research</SelectItem>
          <SelectItem value="article">Article</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.sortBy} onValueChange={(v: 'upvotes' | 'date' | 'relevance') => onFilterChange({ sortBy: v })}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="upvotes">Most Upvoted</SelectItem>
          <SelectItem value="date">Most Recent</SelectItem>
          <SelectItem value="relevance">Relevance</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
          <Filter className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
};
