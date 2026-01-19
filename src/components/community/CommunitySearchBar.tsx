import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommunitySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onQuickTopic?: (topic: string) => void;
  placeholder?: string;
}

const quickTopics = [
  { label: 'Morning Lows', keywords: 'morning low hypo dawn' },
  { label: 'Post-Meal Spikes', keywords: 'spike after eating meal post-meal' },
  { label: 'Sensor Issues', keywords: 'sensor cgm accuracy error' },
  { label: 'Exercise Tips', keywords: 'exercise workout gym running' },
  { label: 'Travel', keywords: 'travel airport tsa flying vacation' },
  { label: 'Pump Sites', keywords: 'pump site infusion occlusion' },
  { label: 'Carb Counting', keywords: 'carb counting bolus ratio' },
  { label: 'Nighttime', keywords: 'night overnight sleep basal' },
];

export const CommunitySearchBar: React.FC<CommunitySearchBarProps> = ({
  value,
  onChange,
  onQuickTopic,
  placeholder = 'Search for solutions... (e.g., "morning lows", "sensor issues")',
}) => {
  const handleQuickTopicClick = (topic: typeof quickTopics[0]) => {
    if (onQuickTopic) {
      onQuickTopic(topic.keywords);
    } else {
      onChange(topic.keywords.split(' ')[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-lg"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center mr-1">Quick topics:</span>
        {quickTopics.map((topic) => (
          <Badge
            key={topic.label}
            variant="secondary"
            className="cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => handleQuickTopicClick(topic)}
          >
            {topic.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};
