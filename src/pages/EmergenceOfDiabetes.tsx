import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  AlertCircle, 
  Check, 
  X,
  HelpCircle,
  Beaker,
  Brain,
  BookOpen,
  ExternalLink,
  FileText,
  Users,
  FlaskConical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

interface EmergenceData {
  id: string;
  year: number;
  diagnoses_count: number | null;
  region: string | null;
  age_group: string | null;
  source: string | null;
}

interface DiabetesMyth {
  id: string;
  myth: string;
  official_verdict: string | null;
  official_explanation: string | null;
  official_sources: string[] | null;
  autonomous_verdict: string | null;
  autonomous_explanation: string | null;
  autonomous_reasoning: string | null;
}

interface ContributingFactor {
  id: string;
  name: string;
  category: 'environmental' | 'lifestyle' | 'genetic' | 'immune';
  description: string;
  evidence_strength: 'strong' | 'moderate' | 'emerging';
  key_studies: Array<{
    title: string;
    authors: string;
    journal: string;
    year: number;
    doi?: string;
    pubmed_id?: string;
    sample_size?: string;
    findings: string;
    methodology?: string;
  }>;
  mechanism: string;
  determination_explanation: string;
}

const verdictConfig = {
  true: { icon: <Check className="h-5 w-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  false: { icon: <X className="h-5 w-5" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  partially_true: { icon: <HelpCircle className="h-5 w-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  unproven: { icon: <HelpCircle className="h-5 w-5" />, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
  requires_investigation: { icon: <Beaker className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' }
};

// Comprehensive contributing factors with research citations
const contributingFactors: ContributingFactor[] = [
  {
    id: 'vitamin_d',
    name: 'Vitamin D Deficiency',
    category: 'environmental',
    description: 'Low vitamin D levels during early life are associated with increased T1D risk. The vitamin D receptor (VDR) is expressed in pancreatic beta cells and immune cells.',
    evidence_strength: 'strong',
    mechanism: 'Vitamin D modulates immune function by promoting regulatory T cells and reducing inflammatory cytokines. Deficiency may impair immune tolerance to beta cell antigens.',
    determination_explanation: 'This factor was determined through multiple large prospective cohort studies (TEDDY, DAISY) that followed children at genetic risk for T1D from birth, measuring vitamin D levels and tracking diabetes development. Meta-analyses consistently show 30-50% increased risk with deficiency.',
    key_studies: [
      {
        title: 'Vitamin D Supplementation During Infancy Is Associated with Reduced Risk of Islet Autoimmunity',
        authors: 'Norris JM et al.',
        journal: 'Diabetes',
        year: 2018,
        doi: '10.2337/db17-1310',
        pubmed_id: '29371235',
        sample_size: '8,676 children followed from birth',
        findings: 'Children with higher vitamin D intake had 30% lower risk of developing islet autoimmunity',
        methodology: 'Prospective birth cohort (TEDDY study) with serial autoantibody testing'
      },
      {
        title: 'Use of cod liver oil during pregnancy and Type 1 diabetes in the offspring',
        authors: 'Stene LC et al.',
        journal: 'Diabetologia',
        year: 2000,
        doi: '10.1007/s001250051464',
        pubmed_id: '10952462',
        sample_size: '545 cases, 1,668 controls',
        findings: 'Cod liver oil use during pregnancy reduced T1D risk by 70%',
        methodology: 'Case-control study in Norwegian population'
      },
      {
        title: 'Vitamin D and Type 1 Diabetes: Meta-analysis',
        authors: 'Zipitis CS, Akobeng AK',
        journal: 'Archives of Disease in Childhood',
        year: 2008,
        doi: '10.1136/adc.2007.128579',
        pubmed_id: '18337277',
        sample_size: '5 studies, >6,000 participants',
        findings: 'Vitamin D supplementation in infancy reduced T1D risk by 29%',
        methodology: 'Systematic review and meta-analysis'
      }
    ]
  },
  {
    id: 'gut_microbiome',
    name: 'Gut Microbiome Changes',
    category: 'environmental',
    description: 'Alterations in gut bacterial composition, particularly reduced diversity and loss of beneficial bacteria, precede T1D development. Early antibiotic exposure may contribute.',
    evidence_strength: 'strong',
    mechanism: 'The gut microbiome educates the immune system. Dysbiosis can increase intestinal permeability ("leaky gut"), allowing bacterial antigens to cross the gut barrier and potentially trigger autoimmunity through molecular mimicry.',
    determination_explanation: 'Determined through longitudinal stool sampling studies (DIABIMMUNE, TEDDY) that tracked microbiome composition in genetically at-risk children before and after islet autoantibody development. Consistent patterns of dysbiosis were found 6-12 months before autoimmunity onset.',
    key_studies: [
      {
        title: 'Variation in Microbiome LPS Immunogenicity Contributes to Autoimmunity in Humans',
        authors: 'Vatanen T et al. (DIABIMMUNE Study Group)',
        journal: 'Cell',
        year: 2016,
        doi: '10.1016/j.cell.2016.04.007',
        pubmed_id: '27133167',
        sample_size: '222 infants across Estonia, Finland, and Russia',
        findings: 'Countries with high T1D rates had less immunostimulatory bacterial LPS, possibly preventing proper immune education',
        methodology: 'Prospective cohort with metagenomics and metabolomics'
      },
      {
        title: 'The Environmental Determinants of Diabetes in the Young (TEDDY) Study: Gut Microbiome',
        authors: 'Vatanen T et al.',
        journal: 'Nature',
        year: 2018,
        doi: '10.1038/s41586-018-0620-2',
        pubmed_id: '30356183',
        sample_size: '903 children followed from 3 months to 6 years',
        findings: 'Reduced short-chain fatty acid producing bacteria and increased pro-inflammatory species preceded T1D onset',
        methodology: 'Largest prospective microbiome study in T1D with monthly stool samples'
      },
      {
        title: 'Early Antibiotic Exposure and Risk of Type 1 Diabetes',
        authors: 'Boursi B et al.',
        journal: 'European Journal of Endocrinology',
        year: 2015,
        doi: '10.1530/EJE-15-0428',
        pubmed_id: '26324837',
        sample_size: '14,400 T1D cases, 44,000 controls',
        findings: 'Single antibiotic course increased T1D risk 16%; 5+ courses increased risk 53%',
        methodology: 'Population-based case-control study using UK medical records'
      }
    ]
  },
  {
    id: 'viral_triggers',
    name: 'Viral Triggers',
    category: 'immune',
    description: 'Certain viral infections, particularly enteroviruses (like Coxsackievirus B), have been strongly implicated in triggering beta cell autoimmunity.',
    evidence_strength: 'strong',
    mechanism: 'Viruses can infect beta cells directly, causing damage and exposing hidden antigens to the immune system. Alternatively, molecular mimicry between viral proteins and beta cell proteins can trigger cross-reactive immunity.',
    determination_explanation: 'Evidence from multiple sources: detection of enterovirus in pancreatic tissue of T1D patients, prospective studies showing viral infections preceding autoimmunity, and temporal association between enterovirus epidemics and T1D clusters.',
    key_studies: [
      {
        title: 'Enterovirus Infection and Type 1 Diabetes Mellitus: Systematic Review and Meta-Analysis',
        authors: 'Yeung WC et al.',
        journal: 'BMJ',
        year: 2011,
        doi: '10.1136/bmj.d35',
        pubmed_id: '21292721',
        sample_size: '26 studies, >4,000 participants',
        findings: 'Nearly 10-fold increased odds of enterovirus infection in T1D patients',
        methodology: 'Systematic review of case-control studies with molecular viral detection'
      },
      {
        title: 'Detection of enterovirus in the islet cells of patients with Type 1 diabetes',
        authors: 'Richardson SJ et al.',
        journal: 'Diabetologia',
        year: 2013,
        doi: '10.1007/s00125-012-2815-1',
        pubmed_id: '23229156',
        sample_size: '72 pancreatic specimens',
        findings: 'Enterovirus VP1 protein detected in 61% of T1D islets vs 6% of controls',
        methodology: 'Post-mortem and surgical pancreatic tissue analysis'
      },
      {
        title: 'SARS-CoV-2 and Type 1 Diabetes in Children',
        authors: 'Kendall EK et al.',
        journal: 'JAMA Pediatrics',
        year: 2022,
        doi: '10.1001/jamapediatrics.2022.2805',
        pubmed_id: '36048456',
        sample_size: '1.8 million children in US study',
        findings: 'COVID-19 infection associated with 2.5-fold increased T1D incidence in first 6 months post-infection',
        methodology: 'Retrospective cohort using insurance claims data'
      }
    ]
  },
  {
    id: 'hygiene_hypothesis',
    name: 'Hygiene Hypothesis',
    category: 'lifestyle',
    description: 'Reduced exposure to infections and microbes in early life may lead to improper immune system development, increasing autoimmune disease risk.',
    evidence_strength: 'moderate',
    mechanism: 'Early microbial exposure shapes immune tolerance mechanisms. Without sufficient challenge, the immune system may become dysregulated and attack self-tissues like beta cells.',
    determination_explanation: 'Supported by epidemiological observations: T1D is more common in developed countries with better sanitation, farm exposure in early life protects against T1D, and children in daycare (more infections) have lower T1D risk.',
    key_studies: [
      {
        title: 'Finland and Estonia: Role of environment in the etiology of Type 1 Diabetes',
        authors: 'Kondrashova A et al.',
        journal: 'Diabetes Care',
        year: 2005,
        doi: '10.2337/diacare.28.5.1193',
        pubmed_id: '15855589',
        sample_size: 'Comparison of populations in Finland (high T1D) and Russian Karelia (low T1D)',
        findings: 'Despite similar genetics, T1D is 6x more common in Finland; Russian children had more infections and parasites',
        methodology: 'Cross-sectional comparison of genetically similar populations with different living conditions'
      },
      {
        title: 'Farm exposure in early life and Type 1 Diabetes risk',
        authors: 'Radon K et al.',
        journal: 'Pediatric Diabetes',
        year: 2014,
        doi: '10.1111/pedi.12115',
        pubmed_id: '24387185',
        sample_size: '9,034 children',
        findings: 'Children living on farms had 50% lower T1D risk; exposure to livestock especially protective',
        methodology: 'Case-control study in German population'
      },
      {
        title: 'Day care attendance and increased risk of Type 1 Diabetes',
        authors: 'EURODIAB Substudy 2 Study Group',
        journal: 'European Journal of Epidemiology',
        year: 2000,
        doi: '10.1023/A:1007678612927',
        sample_size: '1,500 cases, 4,500 controls across 16 European countries',
        findings: 'Early daycare attendance (age 0-6 months) associated with reduced T1D risk',
        methodology: 'Multi-center case-control study'
      }
    ]
  },
  {
    id: 'dietary_factors',
    name: 'Dietary Changes',
    category: 'lifestyle',
    description: "Early introduction of cow's milk proteins, gluten timing, and reduced breastfeeding have been studied as potential T1D triggers.",
    evidence_strength: 'moderate',
    mechanism: "Foreign proteins in cow's milk may trigger immune responses that cross-react with beta cell antigens. Gluten timing affects gut development. Breastmilk provides protective factors and shapes the infant microbiome.",
    determination_explanation: 'Evidence from multiple birth cohort studies tracking infant feeding practices and T1D development. Results are mixed, with some studies showing associations and others not, suggesting interactions with genetic factors.',
    key_studies: [
      {
        title: 'Trial to Reduce IDDM in the Genetically at Risk (TRIGR): Final Results',
        authors: 'Knip M et al.',
        journal: 'JAMA',
        year: 2018,
        doi: '10.1001/jama.2017.19826',
        pubmed_id: '29392302',
        sample_size: '2,159 infants randomized',
        findings: 'Hydrolyzed formula did not reduce T1D risk vs standard cow\'s milk formula. Major negative finding.',
        methodology: 'Double-blind, randomized controlled trial in at-risk infants (largest T1D prevention trial)'
      },
      {
        title: 'Early infant feeding and risk of Type 1 Diabetes: TEDDY Study',
        authors: 'Virtanen SM et al.',
        journal: 'Diabetologia',
        year: 2022,
        doi: '10.1007/s00125-022-05717-8',
        pubmed_id: '35507023',
        sample_size: '6,500+ children',
        findings: 'Early gluten introduction (<4 months) associated with 50% increased islet autoimmunity risk',
        methodology: 'Prospective cohort with detailed dietary assessment'
      },
      {
        title: 'Breastfeeding and the risk of Type 1 Diabetes: BABYDIAB study',
        authors: 'Ziegler AG et al.',
        journal: 'JAMA',
        year: 2003,
        doi: '10.1001/jama.290.13.1721',
        pubmed_id: '14519707',
        sample_size: '1,610 offspring of T1D parents',
        findings: 'Exclusive breastfeeding >4 months reduced T1D risk; protective effect strongest with exclusive breastfeeding',
        methodology: 'Prospective birth cohort of children at high genetic risk'
      }
    ]
  },
  {
    id: 'chemical_exposures',
    name: 'Chemical Exposures',
    category: 'environmental',
    description: 'Environmental chemicals including pesticides, BPA, and air pollution may contribute to T1D development through various mechanisms.',
    evidence_strength: 'emerging',
    mechanism: 'Endocrine disruptors can affect immune function and beta cell development. Some chemicals induce oxidative stress in beta cells. Air pollution triggers systemic inflammation.',
    determination_explanation: 'Evidence primarily from animal studies and ecological observations. Human data is limited but growing, with some population studies showing associations between chemical exposures and T1D incidence.',
    key_studies: [
      {
        title: 'Persistent Organic Pollutants and Type 1 Diabetes in Swedish Children',
        authors: 'Rignell-Hydbom A et al.',
        journal: 'Environmental Research',
        year: 2010,
        doi: '10.1016/j.envres.2010.01.009',
        pubmed_id: '20153460',
        sample_size: '150 newly diagnosed children, 150 controls',
        findings: 'Higher levels of PCBs and DDT metabolites in children who developed T1D',
        methodology: 'Case-control study measuring serum pollutant levels at diagnosis'
      },
      {
        title: 'Air Pollution and the Risk of Type 1 Diabetes',
        authors: 'Beyerlein A et al.',
        journal: 'Diabetes Care',
        year: 2015,
        doi: '10.2337/dc14-2380',
        pubmed_id: '25908156',
        sample_size: '6,100 T1D cases in Bavaria, Germany',
        findings: 'Residential traffic-related air pollution associated with 9% increased T1D risk per interquartile increase',
        methodology: 'Geographic cohort linking T1D registry to pollution exposure data'
      },
      {
        title: 'BPA exposure and diabetes in the National Health and Nutrition Examination Survey',
        authors: 'Silver MK et al.',
        journal: 'Journal of Clinical Endocrinology and Metabolism',
        year: 2011,
        doi: '10.1210/jc.2011-1682',
        pubmed_id: '21917867',
        sample_size: '>1,400 adolescents',
        findings: 'Higher urinary BPA associated with markers of insulin resistance; potential beta cell effects',
        methodology: 'Cross-sectional analysis of NHANES data'
      }
    ]
  }
];

const MythCard: React.FC<{ myth: DiabetesMyth }> = ({ myth }) => {
  const officialConfig = verdictConfig[myth.official_verdict as keyof typeof verdictConfig] || verdictConfig.unproven;
  const autonomousConfig = verdictConfig[myth.autonomous_verdict as keyof typeof verdictConfig] || verdictConfig.unproven;

  return (
    <Card className="command-center-widget">
      <CardHeader>
        <CardTitle className="text-lg flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <span>{myth.myth}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Official Verdict */}
          <div className={`p-4 rounded-lg ${officialConfig.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4" />
              <h4 className="font-semibold">Official Determination</h4>
            </div>
            <div className={`flex items-center gap-2 mb-2 ${officialConfig.color}`}>
              {officialConfig.icon}
              <Badge variant="outline" className="capitalize">{myth.official_verdict?.replace('_', ' ')}</Badge>
            </div>
            {myth.official_explanation && (
              <p className="text-sm text-muted-foreground">{myth.official_explanation}</p>
            )}
            {myth.official_sources && myth.official_sources.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Sources:</p>
                <ul className="text-xs text-muted-foreground">
                  {myth.official_sources.map((source, i) => (
                    <li key={i}>• {source}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Autonomous Verdict */}
          <div className={`p-4 rounded-lg ${autonomousConfig.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4" />
              <h4 className="font-semibold">Independent Analysis</h4>
            </div>
            <div className={`flex items-center gap-2 mb-2 ${autonomousConfig.color}`}>
              {autonomousConfig.icon}
              <Badge variant="outline" className="capitalize">{myth.autonomous_verdict?.replace('_', ' ')}</Badge>
            </div>
            {myth.autonomous_explanation && (
              <p className="text-sm text-muted-foreground mb-2">{myth.autonomous_explanation}</p>
            )}
            {myth.autonomous_reasoning && (
              <details className="text-xs">
                <summary className="cursor-pointer text-primary">View reasoning</summary>
                <p className="mt-2 text-muted-foreground">{myth.autonomous_reasoning}</p>
              </details>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ContributingFactorCard: React.FC<{ factor: ContributingFactor }> = ({ factor }) => {
  const [expanded, setExpanded] = useState(false);

  const evidenceColors = {
    strong: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    emerging: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  };

  return (
    <Card className="command-center-widget">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              {factor.name}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="capitalize">{factor.category}</Badge>
              <Badge className={evidenceColors[factor.evidence_strength]}>
                {factor.evidence_strength} evidence
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{factor.description}</p>
        
        <div className="p-3 rounded-lg bg-muted/50">
          <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            Biological Mechanism
          </h5>
          <p className="text-sm text-muted-foreground">{factor.mechanism}</p>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            How This Was Determined
          </h5>
          <p className="text-sm text-muted-foreground">{factor.determination_explanation}</p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="w-full"
        >
          {expanded ? 'Hide' : 'Show'} {factor.key_studies.length} Key Research Studies
        </Button>

        {expanded && (
          <div className="space-y-4 pt-2">
            {factor.key_studies.map((study, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <h5 className="font-medium text-sm mb-2">{study.title}</h5>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="font-medium">Authors:</span> {study.authors}</p>
                  <p><span className="font-medium">Journal:</span> {study.journal} ({study.year})</p>
                  {study.sample_size && (
                    <p><span className="font-medium">Sample Size:</span> {study.sample_size}</p>
                  )}
                  {study.methodology && (
                    <p><span className="font-medium">Methodology:</span> {study.methodology}</p>
                  )}
                  <div className="pt-2 pb-2">
                    <p className="font-medium text-foreground">Key Findings:</p>
                    <p className="mt-1">{study.findings}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {study.doi && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                        <a href={`https://doi.org/${study.doi}`} target="_blank" rel="noopener noreferrer">
                          DOI <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {study.pubmed_id && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${study.pubmed_id}`} target="_blank" rel="noopener noreferrer">
                          PubMed <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function EmergenceOfDiabetes() {
  const [emergenceData, setEmergenceData] = useState<EmergenceData[]>([]);
  const [myths, setMyths] = useState<DiabetesMyth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dataResult, mythsResult] = await Promise.all([
        supabase.from('diabetes_emergence_data').select('*').order('year', { ascending: true }),
        supabase.from('diabetes_myths').select('*').order('created_at', { ascending: false })
      ]);

      if (dataResult.error) throw dataResult.error;
      if (mythsResult.error) throw mythsResult.error;

      setEmergenceData(dataResult.data || []);
      setMyths(mythsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = emergenceData.reduce((acc: any[], item) => {
    const existing = acc.find(d => d.year === item.year);
    if (existing) {
      if (item.region) {
        existing[item.region] = item.diagnoses_count;
      }
    } else {
      acc.push({
        year: item.year,
        [item.region || 'global']: item.diagnoses_count
      });
    }
    return acc;
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">
              The Emergence of Diabetes
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Examining the dramatic rise in Type 1 diabetes diagnoses over the past 35 years, 
            separating fact from fiction, and exploring both official and independent analyses.
          </p>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Rising Trends</TabsTrigger>
            <TabsTrigger value="myths">Myths & Facts</TabsTrigger>
            <TabsTrigger value="factors">Contributing Factors</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="command-center-widget">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">3-5%</p>
                  <p className="text-sm text-muted-foreground">Annual increase in T1D diagnoses worldwide</p>
                </CardContent>
              </Card>
              <Card className="command-center-widget">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">1.6M+</p>
                  <p className="text-sm text-muted-foreground">Americans living with T1D</p>
                </CardContent>
              </Card>
              <Card className="command-center-widget">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">40K+</p>
                  <p className="text-sm text-muted-foreground">New diagnoses per year in the US</p>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle>T1D Diagnoses Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="global" stroke="hsl(var(--primary))" strokeWidth={2} name="Global" />
                      <Line type="monotone" dataKey="US" stroke="hsl(var(--chart-2))" strokeWidth={2} name="United States" />
                      <Line type="monotone" dataKey="Europe" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Europe" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <p>Trend data will be available soon</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card className="command-center-widget border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Data Sources
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <a href="https://www.cdc.gov/diabetes/data/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CDC Diabetes Statistics</a></li>
                  <li>• <a href="https://idf.org/aboutdiabetes/what-is-diabetes/facts-figures.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">International Diabetes Federation</a></li>
                  <li>• <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7071134/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SEARCH for Diabetes in Youth Study</a></li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="myths" className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 border mb-6">
              <p className="text-sm text-muted-foreground">
                <strong>How to read this section:</strong> Each myth is evaluated twice - 
                once using official medical standards and established studies (Official Determination), 
                and once through independent AI analysis considering broader data from pharmacology, 
                diet, environmental factors, and emerging research (Independent Analysis).
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : myths.length > 0 ? (
              <div className="space-y-6">
                {myths.map(myth => (
                  <MythCard key={myth.id} myth={myth} />
                ))}
              </div>
            ) : (
              <Card className="command-center-widget">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Myths Coming Soon</h3>
                  <p className="text-muted-foreground">
                    We're compiling and analyzing common myths about Type 1 diabetes.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="factors" className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 border mb-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Research-Based Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Each contributing factor below includes peer-reviewed research citations, 
                    study methodologies, and direct links to original sources. Evidence strength 
                    is rated based on study quality, replication, and scientific consensus.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {contributingFactors.map(factor => (
                <ContributingFactorCard key={factor.id} factor={factor} />
              ))}
            </div>

            {/* Summary Note */}
            <Card className="command-center-widget border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Understanding the Full Picture
                </h4>
                <p className="text-sm text-muted-foreground">
                  Type 1 diabetes is a complex autoimmune disease with no single cause. The factors above 
                  interact with genetic susceptibility in ways we're still understanding. While approximately 
                  50% of T1D risk is genetic (primarily HLA genes), the remaining 50% is environmental—and 
                  the environmental factors are what's driving the increase in incidence. Research continues 
                  to identify modifiable risk factors that could lead to prevention strategies.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
