import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  RefreshCw, 
  Sparkles,
  Apple,
  Dna,
  Smartphone,
  FlaskConical,
  TreePine,
  HeartPulse,
  Pill,
  Link2,
  AlertCircle
} from 'lucide-react';
import { ConnectionCard } from './ConnectionCard';
import { useFoundConnections, type ConnectionType } from '@/hooks/useFoundConnections';

const filterOptions: { value: ConnectionType | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Link2 },
  { value: 'food', label: 'Food', icon: Apple },
  { value: 'biology', label: 'Biology', icon: Dna },
  { value: 'device', label: 'Device', icon: Smartphone },
  { value: 'chemical', label: 'Chemical', icon: FlaskConical },
  { value: 'environmental', label: 'Environmental', icon: TreePine },
  { value: 'symptom', label: 'Symptom', icon: HeartPulse },
  { value: 'treatment', label: 'Treatment', icon: Pill },
];

const sortOptions = [
  { value: 'confidence' as const, label: 'Confidence' },
  { value: 'novelty' as const, label: 'Novelty' },
  { value: 'recent' as const, label: 'Recent' },
];

export const FoundConnectionsTab: React.FC = () => {
  const {
    connections,
    loading,
    analyzing,
    error,
    filterByType,
    activeFilter,
    searchConnections,
    searchQuery,
    triggerAnalysis,
    sortBy,
    setSortBy,
  } = useFoundConnections();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Link2 className="h-5 w-5 text-highlight" />
            AI-Discovered Connections
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Novel correlations found by analyzing research, community data, and clinical trials
          </p>
        </div>
        <Button 
          onClick={triggerAnalysis} 
          disabled={analyzing}
          className="gap-2"
        >
          {analyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze New
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(option => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={activeFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => filterByType(option.value)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => searchConnections(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          {sortOptions.map(option => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <Badge variant="outline">{connections.length} connections found</Badge>
        {activeFilter !== 'all' && (
          <Badge variant="secondary">
            Filtered by: {activeFilter}
          </Badge>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Link2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Connections Found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Click "Analyze New" to discover connections from your research data'}
          </p>
          {!searchQuery && (
            <Button onClick={triggerAnalysis} disabled={analyzing}>
              <Sparkles className="h-4 w-4 mr-2" />
              Start Analysis
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {connections.map(connection => (
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </div>
      )}
    </div>
  );
};
