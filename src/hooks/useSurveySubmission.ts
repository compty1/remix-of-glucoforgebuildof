import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseSurveySubmissionResult {
  submitResponse: (surveyId: string, responses: any) => Promise<void>;
  checkExistingResponse: (surveyId: string) => Promise<any | null>;
  loading: boolean;
  error: string | null;
}

export const useSurveySubmission = (): UseSurveySubmissionResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkExistingResponse = async (surveyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      return null;
    }
  };

  const submitResponse = async (surveyId: string, responses: any) => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to submit a survey response');
      }

      // Process form data to clean up checkbox responses
      const processedResponses: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(responses)) {
        if (key.includes('_') && typeof value === 'boolean') {
          // Handle checkbox responses - group them by question
          const questionKey = key.split('_').slice(0, -1).join('_');
          if (!processedResponses[questionKey]) {
            processedResponses[questionKey] = [];
          }
          if (value) {
            const optionIndex = parseInt(key.split('_').pop() || '0');
            processedResponses[questionKey].push(optionIndex);
          }
        } else if (!key.includes('_') || !Array.isArray(processedResponses[key])) {
          // Handle other response types
          processedResponses[key] = value;
        }
      }

      // Submit to Supabase
      const { error: submitError } = await supabase
        .from('survey_responses')
        .upsert({
          survey_id: surveyId,
          user_id: user.id,
          responses: processedResponses
        }, {
          onConflict: 'survey_id,user_id'
        });

      if (submitError) {
        throw new Error(`Failed to submit survey response: ${submitError.message}`);
      }

      // Show success toast
      toast({
        title: "Survey Submitted Successfully!",
        description: "Thank you for your participation. Your responses help improve T1D research and advocacy.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit survey response';
      setError(errorMessage);
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitResponse,
    checkExistingResponse,
    loading,
    error,
  };
};