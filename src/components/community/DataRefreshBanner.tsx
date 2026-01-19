import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRefreshCommunityData } from '@/hooks/useCommunitySearch';
import { toast } from 'sonner';

interface DataRefreshBannerProps {
  isEmpty: boolean;
  onRefreshComplete?: () => void;
}

export const DataRefreshBanner: React.FC<DataRefreshBannerProps> = ({
  isEmpty,
  onRefreshComplete,
}) => {
  const { triggerRefresh, isRefreshing, refreshError } = useRefreshCommunityData();

  const handleRefresh = async () => {
    try {
      const result = await triggerRefresh();
      toast.success(`Fetched ${result?.inserted || 0} new posts from the community!`);
      onRefreshComplete?.();
    } catch (error) {
      toast.error('Failed to refresh community data. Please try again.');
    }
  };

  if (!isEmpty && !refreshError) {
    return null;
  }

  return (
    <Alert variant={isEmpty ? 'default' : 'destructive'} className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isEmpty
            ? 'No community posts found. Click refresh to fetch the latest discussions from Reddit and other sources.'
            : refreshError || 'There was an issue fetching community data.'}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="ml-4 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Fetching...' : 'Refresh Data'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
