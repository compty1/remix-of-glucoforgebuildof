import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StateForm {
  id: string;
  state_code: string;
  state_name: string;
  form_category: string;
  form_name: string;
  form_description: string | null;
  form_url: string | null;
  issuing_agency: string | null;
  last_verified_at: string | null;
}

export const useStateForms = (stateCode?: string, category?: string) => {
  return useQuery({
    queryKey: ['state-forms', stateCode, category],
    queryFn: async () => {
      let query = supabase
        .from('state_diabetes_forms')
        .select('*')
        .order('form_name');
      
      if (stateCode) {
        query = query.eq('state_code', stateCode);
      }
      
      if (category) {
        query = query.eq('form_category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as StateForm[];
    },
  });
};

export const useStateFormsByState = (stateCode: string) => {
  return useQuery({
    queryKey: ['state-forms-by-state', stateCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('state_diabetes_forms')
        .select('*')
        .eq('state_code', stateCode)
        .order('form_category');
      
      if (error) throw error;
      return data as StateForm[];
    },
    enabled: !!stateCode,
  });
};
