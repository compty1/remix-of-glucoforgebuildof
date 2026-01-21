import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Calendar,
  Target,
  Award,
  Beaker,
  DollarSign
} from 'lucide-react';

interface CureProgressStatsProps {
  totalTrials: number;
  activeTrials: number;
  phase3Trials: number;
  totalParticipants: number;
  countries: number;
  totalFunding?: number;
  approvedTherapies?: number;
}

export function CureProgressStats({
  totalTrials,
  activeTrials,
  phase3Trials,
  totalParticipants,
  countries,
  totalFunding,
  approvedTherapies = 1
}: CureProgressStatsProps) {
  const progressTowardsCure = Math.min(100, Math.round((phase3Trials * 10 + approvedTherapies * 30) / 1.3));
  
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Overall Cure Research Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Progress toward functional cure</span>
              <span className="font-bold text-lg text-primary">{progressTowardsCure}%</span>
            </div>
            <Progress value={progressTowardsCure} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Based on Phase 3 trials ({phase3Trials}), approved therapies ({approvedTherapies}), and global research activity
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Beaker className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalTrials}</p>
            <p className="text-xs text-muted-foreground">Total Trials</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{activeTrials}</p>
            <p className="text-xs text-muted-foreground">Active Now</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{(totalParticipants / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground">Participants</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">{countries}+</p>
            <p className="text-xs text-muted-foreground">Countries</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Research Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Cure Research by Approach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Badge className="bg-blue-500">Beta Cell</Badge>
                Stem Cell & Islet Transplant
              </span>
              <span className="font-medium">45%</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Badge className="bg-purple-500">Immune</Badge>
                Immunotherapy
              </span>
              <span className="font-medium">30%</span>
            </div>
            <Progress value={30} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Badge className="bg-green-500">Gene</Badge>
                Gene Therapy
              </span>
              <span className="font-medium">15%</span>
            </div>
            <Progress value={15} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Badge className="bg-amber-500">Other</Badge>
                Novel Approaches
              </span>
              <span className="font-medium">10%</span>
            </div>
            <Progress value={10} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      {/* Key Milestones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-warning" />
            Recent Cure Research Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-success mt-2" />
              <div>
                <p className="font-medium text-sm">Tzield (Teplizumab) FDA Approved</p>
                <p className="text-xs text-muted-foreground">Nov 2022 - First disease-modifying therapy to delay T1D onset</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium text-sm">Vertex VX-880 Phase 1/2 Success</p>
                <p className="text-xs text-muted-foreground">2024 - Stem cell-derived islets showing insulin independence</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium text-sm">Sernova Cell Pouch Technology</p>
                <p className="text-xs text-muted-foreground">2024 - Phase 1/2 trials showing promising results for islet protection</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-warning mt-2" />
              <div>
                <p className="font-medium text-sm">Multiple Phase 3 Trials Active</p>
                <p className="text-xs text-muted-foreground">2025 - Several immunotherapy and cell therapy trials in late stages</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CureProgressStats;