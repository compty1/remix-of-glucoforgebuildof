import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { User, Calendar, Activity, Pill, Smartphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Demographics {
  age_range: string;
  gender: string;
  diagnosis_year: number | null;
  diabetes_type: string;
  therapy_type: string;
  cgm_usage: string;
  pump_usage: string;
  a1c_range: string;
  years_with_diabetes: number | null;
  country: string;
}

interface DemographicsFormProps {
  onComplete?: () => void;
  showTitle?: boolean;
  compact?: boolean;
}

const ageRanges = [
  'Under 18',
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
  'Prefer not to say',
];

const genderOptions = [
  'Male',
  'Female',
  'Non-binary',
  'Other',
  'Prefer not to say',
];

const diabetesTypes = [
  'Type 1',
  'Type 1.5 (LADA)',
  'Type 2 (insulin-dependent)',
  'Other',
  'Prefer not to say',
];

const therapyTypes = [
  'Multiple Daily Injections (MDI)',
  'Insulin Pump (manual)',
  'Hybrid Closed Loop',
  'Fully Closed Loop (DIY)',
  'Other',
  'Prefer not to say',
];

const cgmUsageOptions = [
  'Yes - continuous use',
  'Yes - intermittent use',
  'No - fingersticks only',
  'Previously used CGM',
  'Prefer not to say',
];

const pumpUsageOptions = [
  'Yes - current user',
  'No - never used',
  'Previously used pump',
  'Planning to start soon',
  'Prefer not to say',
];

const a1cRanges = [
  'Below 5.5%',
  '5.5% - 6.0%',
  '6.0% - 6.5%',
  '6.5% - 7.0%',
  '7.0% - 7.5%',
  '7.5% - 8.0%',
  '8.0% - 8.5%',
  '8.5% - 9.0%',
  'Above 9.0%',
  'Unknown',
  'Prefer not to say',
];

const countries = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Spain',
  'Italy',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'India',
  'Japan',
  'Brazil',
  'Mexico',
  'Other',
  'Prefer not to say',
];

const currentYear = new Date().getFullYear();
const diagnosisYears = Array.from({ length: 80 }, (_, i) => currentYear - i);

export const DemographicsForm = ({ 
  onComplete, 
  showTitle = true,
  compact = false 
}: DemographicsFormProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demographics, setDemographics] = useState<Demographics>({
    age_range: '',
    gender: '',
    diagnosis_year: null,
    diabetes_type: 'Type 1',
    therapy_type: '',
    cgm_usage: '',
    pump_usage: '',
    a1c_range: '',
    years_with_diabetes: null,
    country: '',
  });

  useEffect(() => {
    fetchDemographics();
  }, []);

  const fetchDemographics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('survey_demographics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // silently ignore demographics fetch error; form stays empty
      }

      if (data) {
        setDemographics({
          age_range: data.age_range || '',
          gender: data.gender || '',
          diagnosis_year: data.diagnosis_year,
          diabetes_type: data.diabetes_type || 'Type 1',
          therapy_type: data.therapy_type || '',
          cgm_usage: data.cgm_usage || '',
          pump_usage: data.pump_usage || '',
          a1c_range: data.a1c_range || '',
          years_with_diabetes: data.years_with_diabetes,
          country: data.country || '',
        });
      }
    } catch (err) {
      // silently ignore outer fetch error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to save your demographics.',
          variant: 'destructive',
        });
        return;
      }

      // Calculate years with diabetes if diagnosis year is set
      const yearsWithDiabetes = demographics.diagnosis_year 
        ? currentYear - demographics.diagnosis_year 
        : null;

      const { error } = await supabase
        .from('survey_demographics')
        .upsert({
          user_id: user.id,
          ...demographics,
          years_with_diabetes: yearsWithDiabetes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast({
        title: 'Demographics Saved',
        description: 'Your research profile has been updated.',
      });

      onComplete?.();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save demographics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Demographics, value: string | number | null) => {
    setDemographics(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const gridClass = compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Research Demographics Profile
          </CardTitle>
          <CardDescription>
            This information helps researchers stratify and analyze data more effectively. 
            All fields are optional.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        <div className={`grid ${gridClass} gap-4`}>
          {/* Age Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Age Range
            </Label>
            <Select
              value={demographics.age_range}
              onValueChange={(v) => updateField('age_range', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                {ageRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={demographics.gender}
              onValueChange={(v) => updateField('gender', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={demographics.country}
              onValueChange={(v) => updateField('country', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Diabetes Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Diabetes Type
            </Label>
            <Select
              value={demographics.diabetes_type}
              onValueChange={(v) => updateField('diabetes_type', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {diabetesTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year of Diagnosis */}
          <div className="space-y-2">
            <Label>Year of Diagnosis</Label>
            <Select
              value={demographics.diagnosis_year?.toString() || ''}
              onValueChange={(v) => updateField('diagnosis_year', v ? parseInt(v) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {diagnosisYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Therapy Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Current Therapy
            </Label>
            <Select
              value={demographics.therapy_type}
              onValueChange={(v) => updateField('therapy_type', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select therapy type" />
              </SelectTrigger>
              <SelectContent>
                {therapyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CGM Usage */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              CGM Usage
            </Label>
            <Select
              value={demographics.cgm_usage}
              onValueChange={(v) => updateField('cgm_usage', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select CGM status" />
              </SelectTrigger>
              <SelectContent>
                {cgmUsageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pump Usage */}
          <div className="space-y-2">
            <Label>Insulin Pump Usage</Label>
            <Select
              value={demographics.pump_usage}
              onValueChange={(v) => updateField('pump_usage', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pump status" />
              </SelectTrigger>
              <SelectContent>
                {pumpUsageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* A1C Range */}
          <div className="space-y-2">
            <Label>Most Recent A1C</Label>
            <Select
              value={demographics.a1c_range}
              onValueChange={(v) => updateField('a1c_range', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select A1C range" />
              </SelectTrigger>
              <SelectContent>
                {a1cRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Demographics'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
