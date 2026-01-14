import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Stethoscope, Lightbulb } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (role: string) => void;
  onDismiss: () => void;
}

const roleOptions = [
  {
    id: 'newly_diagnosed',
    title: 'Newly Diagnosed',
    description: 'Recently diagnosed with diabetes and learning the basics',
    icon: Heart,
    features: ['First 100 Days program', 'Daily tips & guidance', 'Essential resources'],
    badge: 'First 100 Days'
  },
  {
    id: 'experienced',
    title: 'Experienced Patient',
    description: 'Managing diabetes for a while and looking for optimization',
    icon: Users,
    features: ['Advanced analytics', 'Community insights', 'Trend analysis'],
    badge: 'Community Expert'
  },
  {
    id: 'caregiver',
    title: 'Caregiver',
    description: 'Supporting someone with diabetes in their journey',
    icon: Stethoscope,
    features: ['Care coordination tools', 'Educational resources', 'Support networks'],
    badge: 'Care Partner'
  },
  {
    id: 'researcher',
    title: 'Researcher/HCP',
    description: 'Healthcare professional or researcher studying diabetes',
    icon: Lightbulb,
    features: ['Research insights', 'Data analytics', 'Professional tools'],
    badge: 'Professional'
  }
];

export const OnboardingModal = ({ open, onComplete, onDismiss }: OnboardingModalProps) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onComplete(selectedRole);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onDismiss}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to GlucoForge!</DialogTitle>
          <DialogDescription className="text-lg">
            Let's personalize your experience. Which best describes your role?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{role.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {role.badge}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">What you'll get:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onDismiss}>
            Skip for now
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={!selectedRole}
            className="min-w-[120px]"
          >
            Continue
          </Button>
        </div>

        {selectedRole === 'newly_diagnosed' && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              🎉 You'll get access to our First 100 Days program!
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Daily personalized tips, essential resources, and guided support for your first 100 days with diabetes.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};