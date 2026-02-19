import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
    <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
    {actionLabel && onAction && (
      <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
