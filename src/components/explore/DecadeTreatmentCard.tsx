import React from 'react';
import { motion } from 'framer-motion';
import { Syringe, Activity, Smartphone, Clock, Droplet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DecadeTreatmentCardProps {
  decade: string;
  summary: string;
  index: number;
}

const decadeIcons: Record<string, React.ReactNode> = {
  '1920s': <Syringe className="h-8 w-8" />,
  '1930s': <Syringe className="h-8 w-8" />,
  '1940s': <Droplet className="h-8 w-8" />,
  '1950s': <Droplet className="h-8 w-8" />,
  '1960s': <Clock className="h-8 w-8" />,
  '1970s': <Clock className="h-8 w-8" />,
  '1980s': <Activity className="h-8 w-8" />,
  '1990s': <Activity className="h-8 w-8" />,
  '2000s': <Smartphone className="h-8 w-8" />,
  '2010s': <Smartphone className="h-8 w-8" />,
  '2020s': <Smartphone className="h-8 w-8" />,
};

const decadeColors: Record<string, string> = {
  '1920s': 'from-amber-500 to-amber-600',
  '1930s': 'from-amber-600 to-orange-500',
  '1940s': 'from-orange-500 to-orange-600',
  '1950s': 'from-orange-600 to-red-500',
  '1960s': 'from-red-500 to-pink-500',
  '1970s': 'from-pink-500 to-purple-500',
  '1980s': 'from-purple-500 to-violet-500',
  '1990s': 'from-violet-500 to-indigo-500',
  '2000s': 'from-indigo-500 to-blue-500',
  '2010s': 'from-blue-500 to-cyan-500',
  '2020s': 'from-cyan-500 to-teal-500',
};

export function DecadeTreatmentCard({ decade, summary, index }: DecadeTreatmentCardProps) {
  const gradient = decadeColors[decade] || 'from-brand-purple-dark to-brand-purple-light';
  const icon = decadeIcons[decade] || <Activity className="h-8 w-8" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{decade}</CardTitle>
            {icon}
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
