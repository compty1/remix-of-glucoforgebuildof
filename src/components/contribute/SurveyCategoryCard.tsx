import { cn } from '@/lib/utils';
import { 
  Smartphone, 
  Pill, 
  Heart, 
  Shield, 
  Cpu, 
  ArrowRightLeft, 
  Stethoscope, 
  Activity,
  FileText 
} from 'lucide-react';

interface SurveyCategoryCardProps {
  id: string;
  title: string;
  description: string;
  icon?: React.ElementType;
  count: number;
  selected: boolean;
  onClick: () => void;
}

export const SurveyCategoryCard = ({
  title,
  description,
  icon: Icon = FileText,
  count,
  selected,
  onClick,
}: SurveyCategoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border text-left transition-all hover:shadow-md',
        'flex flex-col gap-2',
        selected
          ? 'border-primary bg-primary/10 shadow-sm'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn(
          'p-2 rounded-lg',
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-1 rounded-full',
          selected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          {count} {count === 1 ? 'survey' : 'surveys'}
        </span>
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </button>
  );
};
