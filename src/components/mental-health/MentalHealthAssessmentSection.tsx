import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  Heart,
  Lightbulb,
  Phone,
  CheckCircle2,
  Brain,
} from 'lucide-react';

interface Question {
  id: string;
  category: string;
  question: string;
  options: { value: number; label: string }[];
}

interface AssessmentResult {
  level: 'low' | 'moderate' | 'high' | 'critical';
  score: number;
  title: string;
  description: string;
  color: string;
  recommendations: string[];
}

const questions: Question[] = [
  {
    id: 'decision-fatigue',
    category: 'Decision Fatigue',
    question: 'How often do you feel exhausted from making diabetes-related decisions?',
    options: [
      { value: 0, label: 'Rarely - I manage decisions well' },
      { value: 1, label: 'Sometimes - Occasional fatigue' },
      { value: 2, label: 'Often - Frequently overwhelmed' },
      { value: 3, label: 'Almost always - Constantly drained' },
    ],
  },
  {
    id: 'glucose-anxiety',
    category: 'Glucose Anxiety',
    question: 'How anxious do you feel when checking your blood glucose levels?',
    options: [
      { value: 0, label: 'Not anxious - Numbers are just data' },
      { value: 1, label: 'Slightly anxious - Mild concern' },
      { value: 2, label: 'Moderately anxious - Often worried' },
      { value: 3, label: 'Very anxious - Dread checking' },
    ],
  },
  {
    id: 'burnout',
    category: 'Diabetes Burnout',
    question: 'How often do you feel burnt out from managing your diabetes?',
    options: [
      { value: 0, label: 'Never - I feel in control' },
      { value: 1, label: 'Occasionally - Some days are hard' },
      { value: 2, label: 'Frequently - Most days are a struggle' },
      { value: 3, label: 'Constantly - I want to give up' },
    ],
  },
  {
    id: 'sleep-quality',
    category: 'Sleep Disruption',
    question: 'How often is your sleep disrupted by diabetes-related concerns or alarms?',
    options: [
      { value: 0, label: 'Rarely - I sleep well' },
      { value: 1, label: '1-2 times per week' },
      { value: 2, label: '3-4 times per week' },
      { value: 3, label: 'Almost every night' },
    ],
  },
  {
    id: 'hypo-fear',
    category: 'Fear of Hypoglycemia',
    question: 'How much does fear of low blood sugar affect your daily activities?',
    options: [
      { value: 0, label: 'Not at all - I manage it well' },
      { value: 1, label: 'Slightly - Minor adjustments' },
      { value: 2, label: 'Moderately - I avoid some activities' },
      { value: 3, label: 'Severely - It controls my life' },
    ],
  },
  {
    id: 'device-frustration',
    category: 'Device Burden',
    question: 'How frustrated are you with your diabetes devices (CGM, pump, etc.)?',
    options: [
      { value: 0, label: 'Not frustrated - Devices work well' },
      { value: 1, label: 'Slightly - Occasional issues' },
      { value: 2, label: 'Moderately - Frequent problems' },
      { value: 3, label: 'Very frustrated - Constant issues' },
    ],
  },
  {
    id: 'social-impact',
    category: 'Social Impact',
    question: 'How much does diabetes management affect your social life?',
    options: [
      { value: 0, label: 'Minimal impact - I live normally' },
      { value: 1, label: 'Some impact - Occasional limitations' },
      { value: 2, label: 'Significant impact - Often affects plans' },
      { value: 3, label: 'Major impact - I avoid social situations' },
    ],
  },
  {
    id: 'support-system',
    category: 'Support System',
    question: 'How supported do you feel in managing your diabetes?',
    options: [
      { value: 3, label: 'Not supported - I feel alone' },
      { value: 2, label: 'Somewhat supported - Could be better' },
      { value: 1, label: 'Mostly supported - Good network' },
      { value: 0, label: 'Very supported - Strong network' },
    ],
  },
  {
    id: 'emotional-wellbeing',
    category: 'Emotional State',
    question: 'How would you describe your overall emotional wellbeing lately?',
    options: [
      { value: 0, label: 'Good - Feeling positive' },
      { value: 1, label: 'Fair - Some difficult days' },
      { value: 2, label: 'Struggling - Often feeling down' },
      { value: 3, label: 'Poor - Feeling hopeless' },
    ],
  },
  {
    id: 'time-burden',
    category: 'Time Investment',
    question: 'How burdensome is the time spent on diabetes management?',
    options: [
      { value: 0, label: 'Manageable - It fits my routine' },
      { value: 1, label: 'Somewhat burdensome - Takes effort' },
      { value: 2, label: 'Very burdensome - Takes too much time' },
      { value: 3, label: 'Overwhelming - Dominates my life' },
    ],
  },
];

const getResult = (score: number): AssessmentResult => {
  const maxScore = questions.length * 3;
  const percentage = (score / maxScore) * 100;

  if (percentage <= 25) {
    return {
      level: 'low',
      score: percentage,
      title: 'Managing Well',
      description: 'You appear to be handling the psychological aspects of T1D management effectively. Keep up your current coping strategies and support systems.',
      color: 'text-success',
      recommendations: [
        'Continue your current self-care routines',
        'Share your successful strategies with others in the community',
        'Stay connected with your support network',
        'Consider periodic check-ins with yourself',
      ],
    };
  } else if (percentage <= 50) {
    return {
      level: 'moderate',
      score: percentage,
      title: 'Some Strain',
      description: 'You\'re experiencing moderate mental health strain from diabetes management. Implementing targeted coping strategies can help reduce this burden.',
      color: 'text-warning',
      recommendations: [
        'Try the Box Breathing technique for glucose anxiety',
        'Use the "Number is Information" reframe for checking BG',
        'Connect with peer support groups',
        'Consider scheduling regular mental health breaks',
        'Explore our coping strategies section',
      ],
    };
  } else if (percentage <= 75) {
    return {
      level: 'high',
      score: percentage,
      title: 'Significant Stress',
      description: 'You\'re experiencing significant mental health challenges related to diabetes. Professional support combined with community resources can help.',
      color: 'text-highlight',
      recommendations: [
        'Consider speaking with a diabetes-specialized therapist',
        'Reach out to the T1D community for support',
        'Practice daily stress-reduction techniques',
        'Discuss your mental health with your endocrinologist',
        'Explore diabetes burnout recovery resources',
        'Join a peer support group',
      ],
    };
  } else {
    return {
      level: 'critical',
      score: percentage,
      title: 'Immediate Support Needed',
      description: 'Your responses indicate you may need immediate mental health support. Please reach out to a mental health professional or crisis line.',
      color: 'text-destructive',
      recommendations: [
        'Contact a mental health crisis line immediately if you\'re in crisis',
        'Speak with your healthcare provider as soon as possible',
        'Reach out to a trusted friend or family member today',
        'Consider the resources on our Crisis Support section above',
        'You are not alone - help is available',
      ],
    };
  }
};

const MentalHealthAssessmentSection: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const result = getResult(totalScore);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: parseInt(value),
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (!isStarted) {
    return (
      <section className="mb-12">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
              <ClipboardCheck className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Mental Health Burden Assessment</CardTitle>
            <CardDescription className="text-base">
              Take this quick assessment to understand your current mental health burden 
              related to T1D management and receive personalized coping recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="p-3 rounded-lg bg-background border">
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <div className="text-2xl font-bold text-primary">3-5</div>
                <div className="text-xs text-muted-foreground">Minutes</div>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <div className="text-2xl font-bold text-primary">Private</div>
                <div className="text-xs text-muted-foreground">& Secure</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This assessment is for informational purposes only and is not a clinical diagnosis. 
              Always consult with a mental health professional for proper evaluation.
            </p>
            <Button size="lg" onClick={() => setIsStarted(true)}>
              Start Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (showResults) {
    return (
      <section className="mb-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${
              result.level === 'low' ? 'bg-success/10' :
              result.level === 'moderate' ? 'bg-warning/10' :
              result.level === 'high' ? 'bg-highlight/10' : 'bg-destructive/10'
            }`}>
              {result.level === 'low' ? <CheckCircle2 className="w-8 h-8 text-success" /> :
               result.level === 'moderate' ? <Brain className="w-8 h-8 text-warning" /> :
               result.level === 'high' ? <AlertTriangle className="w-8 h-8 text-highlight" /> :
               <Phone className="w-8 h-8 text-destructive" />}
            </div>
            <CardTitle className={`text-2xl ${result.color}`}>{result.title}</CardTitle>
            <CardDescription className="text-base">{result.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.level === 'critical' && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-destructive" />
                  <div>
                    <div className="font-semibold text-destructive">Crisis Support Available 24/7</div>
                    <div className="text-sm text-muted-foreground">
                      National Suicide Prevention Lifeline: 988 | Crisis Text Line: Text HOME to 741741
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Burden Level</span>
                <span className={`text-sm font-bold ${result.color}`}>
                  {Math.round(result.score)}%
                </span>
              </div>
              <Progress value={result.score} className="h-3" />
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Personalized Recommendations
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Again
              </Button>
              <Button onClick={() => {
                const section = document.getElementById('coping-strategies');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Explore Coping Strategies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">{currentQ.category}</Badge>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-xl font-semibold">{currentQ.question}</h3>
          
          <RadioGroup
            value={answers[currentQ.id]?.toString()}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQ.options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                  answers[currentQ.id] === option.value ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleAnswer(option.value.toString())}
              >
                <RadioGroupItem value={option.value.toString()} id={`${currentQ.id}-${option.value}`} />
                <Label htmlFor={`${currentQ.id}-${option.value}`} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={answers[currentQ.id] === undefined}
            >
              {currentQuestion === questions.length - 1 ? 'See Results' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default MentalHealthAssessmentSection;
