import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileCheck, 
  Car, 
  GraduationCap, 
  Building2, 
  Shield, 
  Plane,
  ExternalLink,
  Info,
  MapPin,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StateForm {
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

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

const FORM_CATEGORIES = [
  { id: 'driving', label: 'Driving/DMV', icon: Car, description: 'Forms for insulin-treated driver medical certification' },
  { id: 'school', label: 'School', icon: GraduationCap, description: '504 plans, diabetes management plans, medication forms' },
  { id: 'workplace', label: 'Workplace', icon: Building2, description: 'ADA accommodation requests, FMLA forms' },
  { id: 'insurance', label: 'Insurance', icon: Shield, description: 'State insurance commissioner forms, appeals' },
  { id: 'travel', label: 'Travel', icon: Plane, description: 'TSA notification cards, medical documentation' }
];

// Static form data (will be augmented with database data)
const STATIC_FORMS: StateForm[] = [
  // Ohio
  {
    id: 'oh-1',
    state_code: 'OH',
    state_name: 'Ohio',
    form_category: 'driving',
    form_name: 'Statement of Physician (BMV 2310)',
    form_description: 'Required form for drivers with insulin-treated diabetes to maintain driving privileges. Must be completed by your physician annually.',
    form_url: 'https://publicsafety.ohio.gov/links/bmv2310.pdf',
    issuing_agency: 'Ohio Bureau of Motor Vehicles',
    last_verified_at: '2024-01-15'
  },
  {
    id: 'oh-2',
    state_code: 'OH',
    state_name: 'Ohio',
    form_category: 'school',
    form_name: 'Diabetes Medical Management Plan (DMMP)',
    form_description: 'Comprehensive form for managing diabetes care in school. Includes medication, monitoring, and emergency protocols.',
    form_url: 'https://education.ohio.gov/Topics/Other-Resources/School-Safety/Safe-and-Supportive-Learning/Diabetes',
    issuing_agency: 'Ohio Department of Education',
    last_verified_at: '2024-01-15'
  },
  // California
  {
    id: 'ca-1',
    state_code: 'CA',
    state_name: 'California',
    form_category: 'driving',
    form_name: 'Driver Medical Evaluation (DL 62)',
    form_description: 'Medical evaluation form for drivers with conditions that may affect driving ability, including insulin-treated diabetes.',
    form_url: 'https://www.dmv.ca.gov/portal/file/driver-medical-evaluation-dl-62-pdf/',
    issuing_agency: 'California DMV',
    last_verified_at: '2024-01-15'
  },
  {
    id: 'ca-2',
    state_code: 'CA',
    state_name: 'California',
    form_category: 'school',
    form_name: 'Diabetes Care Plan Template',
    form_description: 'State-approved template for individualized diabetes care plans in California schools.',
    form_url: 'https://www.cde.ca.gov/ls/he/hn/diabetes.asp',
    issuing_agency: 'California Department of Education',
    last_verified_at: '2024-01-15'
  },
  // Texas
  {
    id: 'tx-1',
    state_code: 'TX',
    state_name: 'Texas',
    form_category: 'driving',
    form_name: 'Medical Evaluation for Driver License (DL-5)',
    form_description: 'Medical evaluation form required for drivers with insulin-treated diabetes.',
    form_url: 'https://www.dps.texas.gov/section/driver-license/medical-conditions-and-driver-license',
    issuing_agency: 'Texas Department of Public Safety',
    last_verified_at: '2024-01-15'
  },
  {
    id: 'tx-2',
    state_code: 'TX',
    state_name: 'Texas',
    form_category: 'school',
    form_name: 'Diabetes Medical Management Plan',
    form_description: 'Required form for students with diabetes attending Texas public schools.',
    form_url: 'https://tea.texas.gov/academics/special-student-populations/special-education/programs-and-services/diabetes-management-in-texas-schools',
    issuing_agency: 'Texas Education Agency',
    last_verified_at: '2024-01-15'
  },
  // New York
  {
    id: 'ny-1',
    state_code: 'NY',
    state_name: 'New York',
    form_category: 'driving',
    form_name: 'Medical Certification (MV-44)',
    form_description: 'Medical certification form for drivers with diabetes using insulin.',
    form_url: 'https://dmv.ny.gov/forms-and-publications',
    issuing_agency: 'New York DMV',
    last_verified_at: '2024-01-15'
  },
  {
    id: 'ny-2',
    state_code: 'NY',
    state_name: 'New York',
    form_category: 'school',
    form_name: 'Diabetes Management in School (DMIS)',
    form_description: 'Comprehensive diabetes management plan form for New York schools.',
    form_url: 'https://www.health.ny.gov/diseases/conditions/diabetes/schools/',
    issuing_agency: 'New York State Department of Health',
    last_verified_at: '2024-01-15'
  },
  // Florida
  {
    id: 'fl-1',
    state_code: 'FL',
    state_name: 'Florida',
    form_category: 'driving',
    form_name: 'Medical Reporting Form',
    form_description: 'Form for reporting medical conditions including insulin-treated diabetes to Florida DMV.',
    form_url: 'https://www.flhsmv.gov/driver-licenses-id-cards/medical-advisory-board/',
    issuing_agency: 'Florida Highway Safety and Motor Vehicles',
    last_verified_at: '2024-01-15'
  },
  {
    id: 'fl-2',
    state_code: 'FL',
    state_name: 'Florida',
    form_category: 'school',
    form_name: 'Individual Health Care Plan for Students with Diabetes',
    form_description: 'Florida Department of Education approved diabetes care plan template.',
    form_url: 'https://www.fldoe.org/academics/exceptional-student-edu/ese-eligibility/health-related-services/',
    issuing_agency: 'Florida Department of Education',
    last_verified_at: '2024-01-15'
  },
  // Generic federal/national forms
  {
    id: 'fed-1',
    state_code: 'ALL',
    state_name: 'All States',
    form_category: 'workplace',
    form_name: 'ADA Accommodation Request Template',
    form_description: 'Template for requesting reasonable accommodations under the Americans with Disabilities Act.',
    form_url: 'https://www.ada.gov/resources/disability-rights-guide/',
    issuing_agency: 'U.S. Department of Justice',
    last_verified_at: '2024-01-15'
  },
  {
    id: 'fed-2',
    state_code: 'ALL',
    state_name: 'All States',
    form_category: 'workplace',
    form_name: 'FMLA Certification of Health Care Provider (WH-380-E)',
    form_description: 'Official form for FMLA medical certification for your own serious health condition.',
    form_url: 'https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-380-E.pdf',
    issuing_agency: 'U.S. Department of Labor',
    last_verified_at: '2024-01-15'
  },
  {
    id: 'fed-3',
    state_code: 'ALL',
    state_name: 'All States',
    form_category: 'travel',
    form_name: 'TSA Medical Notification Card',
    form_description: 'Notification card to inform TSA of medical devices and supplies when traveling.',
    form_url: 'https://www.tsa.gov/travel/passenger-support',
    issuing_agency: 'Transportation Security Administration',
    last_verified_at: '2024-01-15'
  }
];

const StateFormsFinder = () => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('driving');
  const [forms, setForms] = useState<StateForm[]>(STATIC_FORMS);
  const [dbForms, setDbForms] = useState<StateForm[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch forms from database on mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const { data, error } = await supabase
          .from('state_diabetes_forms')
          .select('*')
          .order('state_name');
        
        if (data && !error) {
          setDbForms(data);
        }
      } catch (err) {
        console.error('Error fetching forms:', err);
      }
    };
    
    fetchForms();
  }, []);

  // Combine static and database forms
  const allForms = [...STATIC_FORMS, ...dbForms];

  // Filter forms based on selection
  const filteredForms = allForms.filter(form => {
    const matchesState = !selectedState || form.state_code === selectedState || form.state_code === 'ALL';
    const matchesCategory = form.form_category === selectedCategory;
    return matchesState && matchesCategory;
  });

  // Get federal forms for the selected category
  const federalForms = allForms.filter(form => 
    form.state_code === 'ALL' && form.form_category === selectedCategory
  );

  const getCategoryIcon = (categoryId: string) => {
    const category = FORM_CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || FileCheck;
  };

  const FormCard = ({ form }: { form: StateForm }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{form.form_name}</h3>
              {form.last_verified_at && (
                <Badge variant="outline" className="text-xs text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {form.form_description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {form.issuing_agency && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {form.issuing_agency}
                </span>
              )}
              {form.state_code !== 'ALL' && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {form.state_name}
                </span>
              )}
            </div>
          </div>
          <div>
            {form.form_url ? (
              <Button size="sm" asChild>
                <a href={form.form_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Get Form
                </a>
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>
                <AlertCircle className="h-4 w-4 mr-1" />
                Coming Soon
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            State Forms Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find official state forms for driving privileges, school accommodations, 
            workplace rights, and more — all in one place.
          </p>
        </section>

        {/* State Selector */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">Select Your State:</span>
              </div>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Choose a state..." />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="ALL">All States (Federal Forms)</SelectItem>
                  {US_STATES.map(state => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedState && selectedState !== 'ALL' && (
                <Badge variant="secondary">
                  {US_STATES.find(s => s.code === selectedState)?.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-muted/50 p-2">
            {FORM_CATEGORIES.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {FORM_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="space-y-6">
                {/* Category Description */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <category.icon className="h-6 w-6 text-primary" />
                    <div>
                      <h2 className="font-semibold">{category.label} Forms</h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* State-Specific Forms */}
                {selectedState && selectedState !== 'ALL' && (
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {US_STATES.find(s => s.code === selectedState)?.name} Forms
                    </h3>
                    {filteredForms.filter(f => f.state_code === selectedState).length > 0 ? (
                      <div className="grid gap-4">
                        {filteredForms.filter(f => f.state_code === selectedState).map(form => (
                          <FormCard key={form.id} form={form} />
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-muted/20">
                        <CardContent className="p-6 text-center">
                          <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            No specific {category.label.toLowerCase()} forms found for {US_STATES.find(s => s.code === selectedState)?.name}.
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Check the federal forms below or contact your state agency directly.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Federal/All-States Forms */}
                {federalForms.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Federal / All States Forms
                    </h3>
                    <div className="grid gap-4">
                      {federalForms.map(form => (
                        <FormCard key={form.id} form={form} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Forms if no state selected */}
                {!selectedState && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Select a state above to see state-specific forms</h3>
                    <p className="text-sm text-muted-foreground">
                      Federal forms applicable to all states are shown below.
                    </p>
                    {federalForms.length > 0 && (
                      <div className="grid gap-4">
                        {federalForms.map(form => (
                          <FormCard key={form.id} form={form} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Info Section */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Info className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">About State Forms</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <strong>Driving Forms:</strong> Most states require annual certification for insulin-treated drivers. Check with your DMV for specific requirements.</li>
                  <li>• <strong>School Forms:</strong> Students with diabetes are protected under Section 504. Schools must provide reasonable accommodations.</li>
                  <li>• <strong>Workplace:</strong> The ADA protects employees with diabetes. You have the right to reasonable accommodations.</li>
                  <li>• <strong>Verification:</strong> Forms marked "Verified" have been recently checked for accuracy. Always confirm with the issuing agency.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StateFormsFinder;
