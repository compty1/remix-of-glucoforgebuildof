import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdultSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const quickTopics = [
  { label: 'CGM during sex', keywords: 'cgm sex sensor' },
  { label: 'Lows after drinking', keywords: 'low alcohol drinking hypo' },
  { label: 'ED and T1D', keywords: 'erectile dysfunction ED' },
  { label: 'Partner disclosure', keywords: 'partner tell disclosure dating' },
  { label: 'Cannabis effects', keywords: 'cannabis weed marijuana' },
  { label: 'Pump management', keywords: 'pump disconnect intimacy' },
  { label: 'Hormonal cycles', keywords: 'period cycle hormones menstrual' },
  { label: 'Harm reduction', keywords: 'harm reduction safety' },
];

export const AdultSearchBar: React.FC<AdultSearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Search adult T1D topics... (e.g., "intimacy", "alcohol", "CGM during sex")'
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
            onClick={() => onChange(topic.keywords.split(' ')[0])}
          >
            {topic.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};
