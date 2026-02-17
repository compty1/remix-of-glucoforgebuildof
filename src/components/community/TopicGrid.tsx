import React from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Dumbbell,
  Plane,
  Utensils,
  Moon,
  Heart,
  Syringe,
  Smartphone
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Topic {
  id: string;
  label: string;
  icon: React.ReactNode;
  keywords: string;
  color: string;
  description: string;
}

const topics: Topic[] = [
  {
    id: 'lows',
    label: 'Glucose Lows',
    icon: <TrendingDown className="h-6 w-6" />,
    keywords: 'low hypo crash dropping',
    color: 'bg-primary/10 text-primary border-primary/20',
    description: 'Managing hypoglycemia',
  },
  {
    id: 'highs',
    label: 'Glucose Highs',
    icon: <TrendingUp className="h-6 w-6" />,
    keywords: 'high spike stubborn correction',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    description: 'Handling hyperglycemia',
  },
  {
    id: 'cgm',
    label: 'CGM & Sensors',
    icon: <Activity className="h-6 w-6" />,
    keywords: 'sensor cgm dexcom libre accuracy',
    color: 'bg-accent text-accent-foreground border-border',
    description: 'Continuous glucose monitoring',
  },
  {
    id: 'pumps',
    label: 'Insulin Pumps',
    icon: <Syringe className="h-6 w-6" />,
    keywords: 'pump omnipod tandem site infusion',
    color: 'bg-success/10 text-success border-success/20',
    description: 'Pump tips & troubleshooting',
  },
  {
    id: 'exercise',
    label: 'Exercise',
    icon: <Dumbbell className="h-6 w-6" />,
    keywords: 'exercise workout gym running sport',
    color: 'bg-warning/10 text-warning border-warning/20',
    description: 'Staying active with T1D',
  },
  {
    id: 'food',
    label: 'Food & Carbs',
    icon: <Utensils className="h-6 w-6" />,
    keywords: 'carb food meal pizza bolus',
    color: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    description: 'Diet and carb counting',
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: <Plane className="h-6 w-6" />,
    keywords: 'travel fly airport tsa supplies',
    color: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    description: 'Traveling with diabetes',
  },
  {
    id: 'overnight',
    label: 'Overnight',
    icon: <Moon className="h-6 w-6" />,
    keywords: 'night overnight sleep basal dawn',
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    description: 'Nighttime management',
  },
  {
    id: 'emotional',
    label: 'Mental Health',
    icon: <Heart className="h-6 w-6" />,
    keywords: 'burnout frustrated tired anxiety mental',
    color: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    description: 'Emotional wellbeing',
  },
  {
    id: 'tech',
    label: 'DIY Tech',
    icon: <Smartphone className="h-6 w-6" />,
    keywords: 'loop openaps nightscout diy',
    color: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    description: 'DIY closed loop systems',
  },
];

interface TopicGridProps {
  onTopicSelect: (keywords: string) => void;
}

export const TopicGrid: React.FC<TopicGridProps> = ({ onTopicSelect }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Browse by Topic</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {topics.map((topic) => (
          <Card
            key={topic.id}
            className={`cursor-pointer hover:shadow-md transition-all border-2 ${topic.color}`}
            onClick={() => onTopicSelect(topic.keywords)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              {topic.icon}
              <span className="font-medium text-sm">{topic.label}</span>
              <span className="text-xs opacity-70">{topic.description}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
