import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useUserPreferences, UpdatePreferencesInput } from '@/hooks/useUserPreferences';
import { ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SmartOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  {
    id: 'diagnosis',
    title: 'When were you diagnosed?',
    description: 'This helps us personalize your experience',
  },
  {
    id: 'therapy',
    title: 'What\'s your current therapy?',
    description: 'Select all that apply to your management',
  },
  {
    id: 'challenges',
    title: 'What are your primary challenges?',
    description: 'We\'ll surface content most relevant to you',
  },
  {
    id: 'devices',
    title: 'Which device brands do you use?',
    description: 'Get updates and tips for your specific devices',
  },
  {
    id: 'interests',
    title: 'What content interests you most?',
    description: 'Customize your feed and recommendations',
  },
];

const THERAPY_OPTIONS = [
  { id: 'mdi', label: 'Multiple Daily Injections (MDI)', icon: '💉' },
  { id: 'pump', label: 'Insulin Pump', icon: '📟' },
  { id: 'cgm', label: 'Continuous Glucose Monitor', icon: '📊' },
  { id: 'hybrid_closed_loop', label: 'Hybrid Closed Loop', icon: '🔄' },
  { id: 'diy_loop', label: 'DIY Loop System', icon: '🛠️' },
];

const CHALLENGE_OPTIONS = [
  { id: 'hypos', label: 'Low blood sugars', icon: '📉' },
  { id: 'highs', label: 'High blood sugars', icon: '📈' },
  { id: 'variability', label: 'Glucose variability', icon: '📊' },
  { id: 'burnout', label: 'Diabetes burnout', icon: '😔' },
  { id: 'exercise', label: 'Exercise management', icon: '🏃' },
  { id: 'meals', label: 'Meal timing/carbs', icon: '🍽️' },
  { id: 'sleep', label: 'Overnight control', icon: '🌙' },
  { id: 'stress', label: 'Stress & anxiety', icon: '😰' },
];

const DEVICE_BRANDS = [
  { id: 'dexcom', label: 'Dexcom', icon: '📱' },
  { id: 'freestyle', label: 'FreeStyle Libre', icon: '📟' },
  { id: 'medtronic', label: 'Medtronic', icon: '⚙️' },
  { id: 'omnipod', label: 'Omnipod', icon: '🔘' },
  { id: 'tandem', label: 'Tandem', icon: '📲' },
  { id: 'beta_bionics', label: 'Beta Bionics', icon: '🤖' },
  { id: 'other', label: 'Other', icon: '📦' },
];

const INTEREST_OPTIONS = [
  { id: 'research', label: 'Latest research & studies', icon: '🔬' },
  { id: 'community', label: 'Community tips & support', icon: '👥' },
  { id: 'practical_tips', label: 'Practical daily tips', icon: '💡' },
  { id: 'mental_health', label: 'Mental health & wellbeing', icon: '🧠' },
  { id: 'devices', label: 'Device updates & reviews', icon: '📱' },
  { id: 'cure_progress', label: 'Cure progress tracking', icon: '🎯' },
  { id: 'clinical_trials', label: 'Clinical trials', icon: '🧪' },
  { id: 'nutrition', label: 'Nutrition & exercise', icon: '🥗' },
];

export function SmartOnboarding({ open, onOpenChange }: SmartOnboardingProps) {
  const { completeOnboarding, isUpdating } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UpdatePreferencesInput>({
    diagnosis_year: new Date().getFullYear() - 5,
    therapy_type: null,
    primary_challenges: [],
    device_brands: [],
    content_interests: [],
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding(preferences);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const toggleArrayItem = (key: keyof UpdatePreferencesInput, item: string) => {
    const current = (preferences[key] as string[]) || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    setPreferences(prev => ({ ...prev, [key]: updated }));
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'diagnosis':
        const currentYear = new Date().getFullYear();
        const diagnosisYear = preferences.diagnosis_year || currentYear - 5;
        const yearsWithT1D = currentYear - diagnosisYear;

        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{diagnosisYear}</div>
              <div className="text-muted-foreground mt-1">
                {yearsWithT1D === 0 ? 'Newly diagnosed' : 
                 yearsWithT1D === 1 ? '1 year with T1D' : 
                 `${yearsWithT1D} years with T1D`}
              </div>
            </div>
            <Slider
              value={[diagnosisYear]}
              min={1950}
              max={currentYear}
              step={1}
              onValueChange={([year]) => setPreferences(prev => ({ ...prev, diagnosis_year: year }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1950</span>
              <span>{currentYear}</span>
            </div>
          </div>
        );

      case 'therapy':
        return (
          <div className="space-y-3 py-4">
            {THERAPY_OPTIONS.map(option => (
              <label
                key={option.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  preferences.therapy_type === option.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                )}
              >
                <input
                  type="radio"
                  name="therapy"
                  value={option.id}
                  checked={preferences.therapy_type === option.id}
                  onChange={() => setPreferences(prev => ({ ...prev, therapy_type: option.id }))}
                  className="sr-only"
                />
                <span className="text-xl">{option.icon}</span>
                <span className="flex-1">{option.label}</span>
                {preferences.therapy_type === option.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </label>
            ))}
          </div>
        );

      case 'challenges':
        return (
          <div className="grid grid-cols-2 gap-2 py-4">
            {CHALLENGE_OPTIONS.map(option => (
              <label
                key={option.id}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                  (preferences.primary_challenges || []).includes(option.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                )}
              >
                <Checkbox
                  checked={(preferences.primary_challenges || []).includes(option.id)}
                  onCheckedChange={() => toggleArrayItem('primary_challenges', option.id)}
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'devices':
        return (
          <div className="grid grid-cols-2 gap-2 py-4">
            {DEVICE_BRANDS.map(option => (
              <label
                key={option.id}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                  (preferences.device_brands || []).includes(option.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                )}
              >
                <Checkbox
                  checked={(preferences.device_brands || []).includes(option.id)}
                  onCheckedChange={() => toggleArrayItem('device_brands', option.id)}
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'interests':
        return (
          <div className="grid grid-cols-2 gap-2 py-4">
            {INTEREST_OPTIONS.map(option => (
              <label
                key={option.id}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                  (preferences.content_interests || []).includes(option.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                )}
              >
                <Checkbox
                  checked={(preferences.content_interests || []).includes(option.id)}
                  onCheckedChange={() => toggleArrayItem('content_interests', option.id)}
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <DialogTitle>{STEPS[currentStep].title}</DialogTitle>
          <DialogDescription>{STEPS[currentStep].description}</DialogDescription>
        </DialogHeader>

        {renderStep()}

        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
              Skip for now
            </Button>
          </div>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Complete Setup'}
              <Sparkles className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
