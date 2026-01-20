import { Beaker, Smartphone, Pill, Heart, Users, Newspaper, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface NewsCategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
}

const categories = [
  { id: 'all', label: 'All News', icon: LayoutGrid },
  { id: 'research', label: 'Research', icon: Beaker },
  { id: 'technology', label: 'Technology', icon: Smartphone },
  { id: 'treatment', label: 'Treatment', icon: Pill },
  { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
  { id: 'advocacy', label: 'Advocacy', icon: Users },
  { id: 'general', label: 'General', icon: Newspaper },
];

export const NewsCategoryFilter = ({ 
  selectedCategory, 
  onSelectCategory, 
  categoryCounts 
}: NewsCategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const count = categoryCounts[category.id] || 0;
          const isActive = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={`flex items-center gap-2 shrink-0 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => onSelectCategory(category.id)}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
              {count > 0 && (
                <Badge 
                  variant={isActive ? 'secondary' : 'outline'} 
                  className={`ml-1 text-xs px-1.5 py-0 h-5 ${
                    isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
