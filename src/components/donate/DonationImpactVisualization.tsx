import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Beaker, 
  Server, 
  Users, 
  Rocket, 
  Heart, 
  Star,
  Sparkles,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DonationImpactVisualizationProps {
  amount: number;
}

interface ImpactTier {
  minAmount: number;
  maxAmount: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
}

const impactTiers: ImpactTier[] = [
  {
    minAmount: 5,
    maxAmount: 24,
    icon: <Heart className="h-8 w-8" />,
    title: "Community Supporter",
    description: "Supports one research survey",
    details: [
      "Fund survey distribution to 10 participants",
      "Help maintain platform uptime for 1 day",
      "Support community moderation"
    ],
    color: "from-pink-500 to-rose-500"
  },
  {
    minAmount: 25,
    maxAmount: 49,
    icon: <Users className="h-8 w-8" />,
    title: "Research Contributor",
    description: "Funds data analysis for 100 participants",
    details: [
      "Process glucose data from 100 users",
      "Generate AI-powered insights report",
      "Support anonymous data collection"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    minAmount: 50,
    maxAmount: 99,
    icon: <Beaker className="h-8 w-8" />,
    title: "Science Champion",
    description: "Sponsors one week of platform hosting",
    details: [
      "Keep all research tools running",
      "Enable 1,000+ glucose analyses",
      "Support clinical trial matching"
    ],
    color: "from-purple-500 to-violet-500"
  },
  {
    minAmount: 100,
    maxAmount: 249,
    icon: <Server className="h-8 w-8" />,
    title: "Innovation Enabler",
    description: "Enables advanced research features",
    details: [
      "Fund AI model improvements",
      "Enable new visualization tools",
      "Support device integration development"
    ],
    color: "from-emerald-500 to-teal-500"
  },
  {
    minAmount: 250,
    maxAmount: 499,
    icon: <Rocket className="h-8 w-8" />,
    title: "Research Accelerator",
    description: "Supports one month of operations",
    details: [
      "Fund full-time research coordination",
      "Enable clinical trial partnerships",
      "Support medical advisory board"
    ],
    color: "from-amber-500 to-orange-500"
  },
  {
    minAmount: 500,
    maxAmount: 999,
    icon: <Star className="h-8 w-8" />,
    title: "Cure Catalyst",
    description: "Major research initiative support",
    details: [
      "Sponsor a complete research study",
      "Fund breakthrough analysis tools",
      "Enable international collaboration"
    ],
    color: "from-red-500 to-pink-500"
  },
  {
    minAmount: 1000,
    maxAmount: 4999,
    icon: <Sparkles className="h-8 w-8" />,
    title: "Visionary Patron",
    description: "Transform diabetes research",
    details: [
      "Fund dedicated research team time",
      "Enable multi-site clinical trials",
      "Support regulatory submissions",
      "Name recognition on research papers"
    ],
    color: "from-indigo-500 to-purple-500"
  },
  {
    minAmount: 5000,
    maxAmount: Infinity,
    icon: <Building className="h-8 w-8" />,
    title: "Founding Partner",
    description: "Shape the future of diabetes care",
    details: [
      "Direct impact on research priorities",
      "Quarterly progress briefings",
      "Invitation to research symposiums",
      "Permanent recognition on platform",
      "Advisory board consideration"
    ],
    color: "from-yellow-500 to-amber-500"
  }
];

export const DonationImpactVisualization: React.FC<DonationImpactVisualizationProps> = ({ amount }) => {
  const currentTier = impactTiers.find(
    tier => amount >= tier.minAmount && amount <= tier.maxAmount
  ) || impactTiers[0];

  const nextTier = impactTiers.find(tier => tier.minAmount > amount);

  return (
    <div className="space-y-4">
      <Card className={cn(
        "p-6 bg-gradient-to-br text-white transition-all duration-300",
        currentTier.color
      )}>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            {currentTier.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{currentTier.title}</h3>
            <p className="text-white/90 mb-3">{currentTier.description}</p>
            <div className="space-y-2">
              {currentTier.details.map((detail, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-white/80">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  {detail}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {nextTier && (
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-medium text-primary">
            ${nextTier.minAmount - amount} more
          </span>{' '}
          to unlock <span className="font-medium">{nextTier.title}</span> tier
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {impactTiers.slice(0, 4).map((tier, index) => (
          <div
            key={index}
            className={cn(
              "p-2 rounded-lg text-center transition-all",
              amount >= tier.minAmount && amount <= tier.maxAmount
                ? "bg-primary/10 ring-2 ring-primary"
                : amount >= tier.minAmount
                ? "bg-muted"
                : "bg-muted/50 opacity-50"
            )}
          >
            <div className="text-xs font-medium truncate">${tier.minAmount}+</div>
          </div>
        ))}
      </div>
    </div>
  );
};
