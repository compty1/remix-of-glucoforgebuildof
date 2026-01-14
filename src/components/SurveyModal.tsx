import React, { useEffect, useState } from 'react';
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
import { FileText, Clock, Send } from 'lucide-react';
import { useSurveySubmission } from '@/hooks/useSurveySubmission';

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: any;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale' | 'number';
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
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

  if (!survey) return null;

  // Parse questions from the jsonb field
  const questions: Question[] = Array.isArray(survey.questions) 
    ? survey.questions 
    : [];

  const getQuestionCount = () => questions.length;
  const getEstimatedTime = () => Math.max(1, Math.ceil(getQuestionCount() / 2));

  const onSubmit = async (data: any) => {
    try {
      await submitResponse(survey.id, data);
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to submit survey response:', err);
    }
  };

  const handleClose = () => {
    reset();
    setExistingResponse(null);
    setHasCheckedExisting(false);
    onClose();
  };

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

  const renderQuestion = (question: Question, index: number) => {
    const fieldName = `question_${question.id || index}`;

    switch (question.type) {
      case 'text':
        return (
          <div key={index} className="space-y-3">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              {...register(fieldName, { 
                required: question.required ? 'This field is required' : false 
              })}
              placeholder="Enter your answer..."
            />
            {errors[fieldName] && (
              <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={index} className="space-y-3">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldName}
              {...register(fieldName, { 
                required: question.required ? 'This field is required' : false 
              })}
              placeholder="Enter your detailed answer..."
              rows={4}
            />
            {errors[fieldName] && (
              <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={index} className="space-y-3">
            <Label className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              onValueChange={(value) => setValue(fieldName, value)}
              className="space-y-2"
            >
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${fieldName}_${optionIndex}`} />
                  <Label htmlFor={`${fieldName}_${optionIndex}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors[fieldName] && (
              <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={index} className="space-y-3">
            <Label className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => {
                const checkboxFieldName = `${fieldName}_${optionIndex}`;
                return (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <Checkbox
                      id={checkboxFieldName}
                      {...register(checkboxFieldName)}
                    />
                    <Label htmlFor={checkboxFieldName} className="text-sm">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'scale':
        const currentValue = watch(fieldName) || [5];
        return (
          <div key={index} className="space-y-3">
            <Label className="text-sm font-medium">
              {question.question}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-4">
              <Slider
                min={question.min || 1}
                max={question.max || 10}
                step={1}
                value={currentValue}
                onValueChange={(value) => setValue(fieldName, value)}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{question.min || 1}</span>
                <span className="font-medium">Current: {currentValue[0]}</span>
                <span>{question.max || 10}</span>
              </div>
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={index} className="space-y-3">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {question.question}
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
              placeholder="Enter a number..."
            />
            {errors[fieldName] && (
              <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-4">
            <DialogTitle className="text-2xl font-heading leading-tight">
              {survey.title}
            </DialogTitle>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline">{survey.category}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{getQuestionCount()} questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>~{getEstimatedTime()} min</span>
              </div>
            </div>
            
            <p className="text-muted-foreground">
              {survey.description}
            </p>
            
            {existingResponse && (
              <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                <p className="text-sm text-info font-medium mb-2">
                  📝 You've already completed this survey
                </p>
                <p className="text-sm text-muted-foreground">
                  Your previous responses are pre-filled below. You can update and resubmit if needed.
                </p>
              </div>
            )}
          </div>
        </DialogHeader>

        <Separator />

        {questions.length > 0 ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {questions.map((question, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  {renderQuestion(question, index)}
                </CardContent>
              </Card>
            ))}

            <Separator />

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                Your responses will be anonymized and used for research purposes only.
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {existingResponse ? 'Update Response' : 'Submit Survey'}
                    </>
                  )}
                </Button>
              </div>
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
          <div className="text-destructive text-sm text-center">
            Failed to submit survey: {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};