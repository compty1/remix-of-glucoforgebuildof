import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Clock, Send, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';
import { useSurveySubmission } from '@/hooks/useSurveySubmission';

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: any;
  created_at: string;
  updated_at: string;
  research_category?: string;
  estimated_time_minutes?: number;
  requires_demographics?: boolean;
  consent_text?: string;
}

interface Question {
  id: string;
  text?: string;
  question?: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale' | 'number';
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
}

interface SurveyModalProps {
  survey: Survey | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({
  survey,
  isOpen,
  onClose,
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm();
  const { submitResponse, checkExistingResponse, loading, error } = useSurveySubmission();
  const [existingResponse, setExistingResponse] = useState<any>(null);
  const [hasCheckedExisting, setHasCheckedExisting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Watch all form values at top level to avoid hooks inside render functions
  const watchedValues = watch();

  // Timer effect - must be before any conditional returns
  useEffect(() => {
    if (isOpen) {
      startTimeRef.current = Date.now();
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Check for existing response when survey changes
  useEffect(() => {
    if (survey && isOpen && !hasCheckedExisting) {
      checkExistingResponse(survey.id).then((existing) => {
        setExistingResponse(existing);
        setHasCheckedExisting(true);
        
        // Pre-fill form with existing responses
        if (existing?.responses) {
          Object.entries(existing.responses).forEach(([key, value]) => {
            setValue(key, value);
          });
        }
      });
    }
  }, [survey, isOpen, hasCheckedExisting, checkExistingResponse, setValue]);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setShowCompletion(false);
    }
  }, [isOpen]);

  // Early return after all hooks
  if (!survey) return null;

  // Parse questions from the jsonb field
  const questions: Question[] = Array.isArray(survey.questions) 
    ? survey.questions 
    : [];

  const getQuestionCount = () => questions.length;
  const getEstimatedTime = () => survey.estimated_time_minutes || Math.max(1, Math.ceil(getQuestionCount() / 2));

  // Calculate progress
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: any) => {
    try {
      const timeSpentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      // Add metadata to submission
      const submissionData = {
        ...data,
        _metadata: {
          time_spent_seconds: timeSpentSeconds,
          device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          completed_at: new Date().toISOString(),
        }
      };

      await submitResponse(survey.id, submissionData);
      
      // Show completion animation
      setShowCompletion(true);

      // Auto close after celebration
      setTimeout(() => {
        reset();
        setShowCompletion(false);
        setCurrentStep(0);
        onClose();
      }, 3000);
    } catch {
      // Survey submission error — non-critical
    }
  };

  const handleClose = () => {
    reset();
    setExistingResponse(null);
    setHasCheckedExisting(false);
    setCurrentStep(0);
    setShowCompletion(false);
    onClose();
  };

  const renderQuestion = (question: Question, index: number) => {
    const fieldName = `question_${question.id || index}`;
    const questionText = question.text || question.question || '';

    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <Label htmlFor={fieldName} className="text-base font-medium">
              {questionText}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              {...register(fieldName, { 
                required: question.required ? 'This field is required' : false 
              })}
              placeholder={question.placeholder || "Enter your answer..."}
            />
            {errors[fieldName] && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-3">
            <Label htmlFor={fieldName} className="text-base font-medium">
              {questionText}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldName}
              {...register(fieldName, { 
                required: question.required ? 'This field is required' : false 
              })}
              placeholder={question.placeholder || "Enter your detailed answer..."}
              rows={4}
            />
            {errors[fieldName] && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              {questionText}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              onValueChange={(value) => setValue(fieldName, value)}
              className="space-y-2"
            >
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={option} id={`${fieldName}_${optionIndex}`} />
                  <Label htmlFor={`${fieldName}_${optionIndex}`} className="text-sm cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors[fieldName] && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              {questionText}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => {
                const checkboxFieldName = `${fieldName}_${optionIndex}`;
                return (
                  <div key={optionIndex} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <Checkbox
                      id={checkboxFieldName}
                      {...register(checkboxFieldName)}
                    />
                    <Label htmlFor={checkboxFieldName} className="text-sm cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'scale':
        const currentValue = watchedValues[fieldName] || [5];
        const minVal = question.min || 1;
        const maxVal = question.max || 10;
        return (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              {questionText}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-6 pt-4">
              <Slider
                min={minVal}
                max={maxVal}
                step={1}
                value={currentValue}
                onValueChange={(value) => setValue(fieldName, value)}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="text-xs">{question.minLabel || minVal}</span>
                <span className="font-semibold text-lg text-foreground bg-primary/10 px-4 py-1 rounded-full">
                  {currentValue[0]}
                </span>
                <span className="text-xs">{question.maxLabel || maxVal}</span>
              </div>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-3">
            <Label htmlFor={fieldName} className="text-base font-medium">
              {questionText}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="number"
              min={question.min}
              max={question.max}
              {...register(fieldName, { 
                required: question.required ? 'This field is required' : false,
                valueAsNumber: true
              })}
              placeholder={question.placeholder || "Enter a number..."}
            />
            {errors[fieldName] && (
              <p className="text-destructive text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Completion screen
  if (showCompletion) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md text-center">
          <div className="py-8">
            <PartyPopper className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your contribution has been recorded and will help advance T1D research.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Completed in {formatTime(elapsedTime)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-heading leading-tight pr-8">
                {survey.title}
              </DialogTitle>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{survey.research_category || survey.category}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{getQuestionCount()} questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {existingResponse && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm">
                  You've completed this survey before. Your responses are pre-filled.
                </p>
              </div>
            )}
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {questions.length > 0 ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="py-4">
                {/* Show current question */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="text-xs text-muted-foreground mb-4">
                      Question {currentStep + 1}
                    </div>
                    {renderQuestion(questions[currentStep], currentStep)}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="flex justify-between items-center pt-2 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                {currentStep + 1} / {questions.length}
              </div>

              {currentStep < questions.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(questions.length - 1, currentStep + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {existingResponse ? 'Update' : 'Submit'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Questions Available</h3>
            <p className="text-muted-foreground">
              This survey doesn't have any questions configured yet.
            </p>
          </div>
        )}

        {error && (
          <div className="text-destructive text-sm text-center flex items-center justify-center gap-2 pt-4">
            <AlertCircle className="h-4 w-4" />
            Failed to submit survey: {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
