import React from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { SearchFilters } from '@/hooks/useCommunitySearch';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
  availableSources: string[];
}

const devices = [
  { value: 'dexcom', label: 'Dexcom' },
  { value: 'omnipod', label: 'Omnipod' },
  { value: 'tandem', label: 'Tandem' },
  { value: 'medtronic', label: 'Medtronic' },
  { value: 'freestyle', label: 'Freestyle Libre' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableSources,
}) => {
  const hasActiveFilters = 
    filters.sources.length > 0 ||
    filters.devices.length > 0 ||
    filters.sentiment !== 'all' ||
    filters.timeRange !== 'all' ||
    filters.hasSolutions ||
    filters.minScore !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters:</span>
      </div>

      {/* Source Filter */}
      <Select
        value={filters.sources[0] || 'all'}
        onValueChange={(value) => 
          onFilterChange({ sources: value === 'all' ? [] : [value] })
        }
      >
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          {availableSources.map((source) => (
            <SelectItem key={source} value={source}>
              {source}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Time Range Filter */}
      <Select
        value={filters.timeRange}
        onValueChange={(value: 'all' | 'day' | 'week' | 'month') => 
          onFilterChange({ timeRange: value })
        }
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="day">Past 24h</SelectItem>
          <SelectItem value="week">Past Week</SelectItem>
          <SelectItem value="month">Past Month</SelectItem>
        </SelectContent>
      </Select>

      {/* Device Filter */}
      <Select
        value={filters.devices[0] || 'all'}
        onValueChange={(value) => 
          onFilterChange({ devices: value === 'all' ? [] : [value] })
        }
      >
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="All Devices" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Devices</SelectItem>
          {devices.map((device) => (
            <SelectItem key={device.value} value={device.value}>
              {device.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sentiment Filter */}
      <Select
        value={filters.sentiment}
        onValueChange={(value: 'all' | 'positive' | 'neutral' | 'negative') => 
          onFilterChange({ sentiment: value })
        }
      >
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

      {/* Quality Score Filter */}
      <Select
        value={filters.minScore}
        onValueChange={(value: 'all' | '50' | '100' | '200' | '500') => 
          onFilterChange({ minScore: value })
        }
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Quality" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Quality</SelectItem>
          <SelectItem value="50">50+ Score</SelectItem>
          <SelectItem value="100">100+ Score</SelectItem>
          <SelectItem value="200">200+ Score</SelectItem>
          <SelectItem value="500">500+ Score</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort By */}
      <Select
        value={filters.sortBy}
        onValueChange={(value: 'relevance' | 'score' | 'date') => 
          onFilterChange({ sortBy: value })
        }
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="score">Most Upvoted</SelectItem>
          <SelectItem value="date">Most Recent</SelectItem>
          <SelectItem value="relevance">Relevance</SelectItem>
        </SelectContent>
      </Select>

      {/* Solutions Only Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="solutions-only"
          checked={filters.hasSolutions}
          onCheckedChange={(checked) => 
            onFilterChange({ hasSolutions: checked === true })
          }
        />
        <Label htmlFor="solutions-only" className="text-sm cursor-pointer">
          Solutions Only
        </Label>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
          <Filter className="h-4 w-4 mr-1" />
          Reset Filters
        </Button>
      )}
    </div>
  );
};
