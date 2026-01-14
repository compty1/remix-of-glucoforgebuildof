import React from 'react';
import { Card } from '@/components/ui/card';
import { Settings, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommandCenterWidgetProps {
  title: string;
  children: React.ReactNode;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onSettings?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CommandCenterWidget: React.FC<CommandCenterWidgetProps> = ({
  title,
  children,
  isMinimized = false,
  onToggleMinimize,
  onSettings,
  className = "",
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-2 row-span-2',
    lg: 'col-span-3 row-span-3',
  };

  return (
    <Card className={`command-center-widget ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-1">
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
          )}
          {onSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettings}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {!isMinimized && (
        <div className="h-full">
          {children}
        </div>
      )}
    </Card>
  );
};