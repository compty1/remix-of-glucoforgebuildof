import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { usePageMeta } from '@/hooks/usePageMeta';
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
  FlaskConical,
  GitCompare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, ComposedChart, Bar } from 'recharts';
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
  true: { icon: <Check className="h-5 w-5" />, color: 'text-success', bg: 'bg-success/5 dark:bg-success/10' },
  false: { icon: <X className="h-5 w-5" />, color: 'text-destructive', bg: 'bg-destructive/5 dark:bg-destructive/10' },
  partially_true: { icon: <HelpCircle className="h-5 w-5" />, color: 'text-warning', bg: 'bg-warning/5 dark:bg-warning/10' },
  unproven: { icon: <HelpCircle className="h-5 w-5" />, color: 'text-muted-foreground', bg: 'bg-muted' },
  requires_investigation: { icon: <Beaker className="h-5 w-5" />, color: 'text-primary', bg: 'bg-primary/5 dark:bg-primary/10' }
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
    strong: 'bg-success/10 text-success',
    moderate: 'bg-warning/10 text-warning',
    emerging: 'bg-primary/10 text-primary'
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
        <BackButton fallbackPath="/explore" />

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
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="trends">Rising Trends</TabsTrigger>
            <TabsTrigger value="concurrent" className="gap-1">
              <GitCompare className="h-4 w-4" />
              Concurrent Trends
            </TabsTrigger>
            <TabsTrigger value="myths">Myths & Facts</TabsTrigger>
            <TabsTrigger value="factors">Contributing Factors</TabsTrigger>
            <TabsTrigger value="articles" className="gap-1">
              <BookOpen className="h-4 w-4" />
              In-Depth Articles
            </TabsTrigger>
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
            <Card className="command-center-widget border-primary/20 bg-primary/5">
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

          <TabsContent value="concurrent" className="space-y-6">
            {/* Explanation Card */}
            <Card className="command-center-widget border-warning/20 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Correlation ≠ Causation</h4>
                    <p className="text-sm text-muted-foreground">
                      The trends shown below coincide with the rise in T1D but may not directly cause it. 
                      These are observations from epidemiological data that warrant further investigation. 
                      Some may be confounding factors, while others may contribute to autoimmune dysregulation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Concurrent Environmental Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vitamin D Deficiency Trend */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-500" />
                    Vitamin D Deficiency Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { year: 1990, rate: 15, t1d: 20 },
                      { year: 1995, rate: 22, t1d: 24 },
                      { year: 2000, rate: 30, t1d: 28 },
                      { year: 2005, rate: 36, t1d: 33 },
                      { year: 2010, rate: 42, t1d: 38 },
                      { year: 2015, rate: 45, t1d: 42 },
                      { year: 2020, rate: 48, t1d: 48 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Deficiency %" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-3">
                    Vitamin D deficiency has tripled since 1990, paralleling indoor lifestyle shifts and sunscreen use. 
                    <span className="block mt-1 text-xs">Source: NHANES surveys, CDC</span>
                  </p>
                </CardContent>
              </Card>

              {/* Antibiotic Usage Trend */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    Pediatric Antibiotic Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { year: 1990, rate: 550, t1d: 20 },
                      { year: 1995, rate: 620, t1d: 24 },
                      { year: 2000, rate: 680, t1d: 28 },
                      { year: 2005, rate: 750, t1d: 33 },
                      { year: 2010, rate: 820, t1d: 38 },
                      { year: 2015, rate: 780, t1d: 42 },
                      { year: 2020, rate: 720, t1d: 48 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="Prescriptions per 1000" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-3">
                    Early-life antibiotic exposure disrupts gut microbiome development and may affect immune tolerance.
                    <span className="block mt-1 text-xs">Source: CDC NAMCS, AAP Pediatrics</span>
                  </p>
                </CardContent>
              </Card>

              {/* C-Section Rates */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-purple-500" />
                    Cesarean Section Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { year: 1990, rate: 22.7 },
                      { year: 1995, rate: 20.8 },
                      { year: 2000, rate: 22.9 },
                      { year: 2005, rate: 30.3 },
                      { year: 2010, rate: 32.8 },
                      { year: 2015, rate: 32.0 },
                      { year: 2020, rate: 31.8 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[15, 40]} unit="%" />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.3} name="C-Section Rate %" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-3">
                    C-section delivery bypasses vaginal microbiome transfer, affecting infant gut colonization and immune development.
                    <span className="block mt-1 text-xs">Source: CDC NCHS, WHO</span>
                  </p>
                </CardContent>
              </Card>

              {/* Breastfeeding Duration */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    Exclusive Breastfeeding Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { year: 1990, rate: 52 },
                      { year: 1995, rate: 45 },
                      { year: 2000, rate: 42 },
                      { year: 2005, rate: 38 },
                      { year: 2010, rate: 35 },
                      { year: 2015, rate: 40 },
                      { year: 2020, rate: 46 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[20, 60]} unit="%" />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} name="6mo exclusive %" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-3">
                    Breastmilk provides protective immunoglobulins and shapes healthy gut microbiome development.
                    <span className="block mt-1 text-xs">Source: CDC Breastfeeding Report Card</span>
                  </p>
                </CardContent>
              </Card>

              {/* Ultra-Processed Food */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    Ultra-Processed Food Consumption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { year: 1990, rate: 42 },
                      { year: 1995, rate: 48 },
                      { year: 2000, rate: 52 },
                      { year: 2005, rate: 55 },
                      { year: 2010, rate: 58 },
                      { year: 2015, rate: 62 },
                      { year: 2020, rate: 67 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[30, 80]} unit="%" />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} name="% of diet" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-3">
                    Ultra-processed foods now comprise 67% of children's diets. Additives and emulsifiers may affect gut barrier integrity.
                    <span className="block mt-1 text-xs">Source: NHANES, BMJ Open</span>
                  </p>
                </CardContent>
              </Card>

              {/* Screen Time / Outdoor Play */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-cyan-500" />
                    Childhood Outdoor Play Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { year: 1990, rate: 8.2 },
                      { year: 1995, rate: 7.5 },
                      { year: 2000, rate: 6.8 },
                      { year: 2005, rate: 5.5 },
                      { year: 2010, rate: 4.5 },
                      { year: 2015, rate: 4.0 },
                      { year: 2020, rate: 3.5 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, 10]} unit=" hrs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Hours/week" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-3">
                    Reduced outdoor play decreases sun exposure (vitamin D) and microbial diversity exposure.
                    <span className="block mt-1 text-xs">Source: Kaiser Family Foundation, AAP</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Correlation Summary */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5" />
                  Correlation Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Environmental Factor</th>
                        <th className="text-center py-2 px-3">Trend Direction</th>
                        <th className="text-center py-2 px-3">Evidence Strength</th>
                        <th className="text-left py-2 px-3">Key Studies</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3">Vitamin D Deficiency</td>
                        <td className="text-center py-2 px-3"><TrendingUp className="h-4 w-4 text-destructive inline" /> Rising</td>
                        <td className="text-center py-2 px-3"><Badge variant="default">Strong</Badge></td>
                        <td className="py-2 px-3 text-muted-foreground">TEDDY Study, DAISY Cohort</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">Gut Microbiome Disruption</td>
                        <td className="text-center py-2 px-3"><TrendingUp className="h-4 w-4 text-destructive inline" /> Rising</td>
                        <td className="text-center py-2 px-3"><Badge variant="default">Strong</Badge></td>
                        <td className="py-2 px-3 text-muted-foreground">DIABIMMUNE, TEDDY</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">C-Section Births</td>
                        <td className="text-center py-2 px-3"><TrendingUp className="h-4 w-4 text-warning inline" /> Increased</td>
                        <td className="text-center py-2 px-3"><Badge variant="secondary">Moderate</Badge></td>
                        <td className="py-2 px-3 text-muted-foreground">Meta-analysis (Cardwell 2008)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">Ultra-Processed Foods</td>
                        <td className="text-center py-2 px-3"><TrendingUp className="h-4 w-4 text-destructive inline" /> Rising</td>
                        <td className="text-center py-2 px-3"><Badge variant="outline">Emerging</Badge></td>
                        <td className="py-2 px-3 text-muted-foreground">NHANES longitudinal</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">Outdoor Play / Sun Exposure</td>
                        <td className="text-center py-2 px-3"><TrendingUp className="h-4 w-4 text-success inline rotate-180" /> Declining</td>
                        <td className="text-center py-2 px-3"><Badge variant="secondary">Moderate</Badge></td>
                        <td className="py-2 px-3 text-muted-foreground">Hygiene hypothesis studies</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Exclusive Breastfeeding</td>
                        <td className="text-center py-2 px-3"><TrendingUp className="h-4 w-4 text-success inline rotate-180" /> Was declining</td>
                        <td className="text-center py-2 px-3"><Badge variant="secondary">Moderate</Badge></td>
                        <td className="py-2 px-3 text-muted-foreground">BABYDIAB, EURODIAB</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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

          <TabsContent value="articles" className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 border mb-6">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Research Deep Dives</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive articles exploring the science behind the rise in Type 1 diabetes, 
                    based on peer-reviewed research and epidemiological studies.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Article 1: Global Incidence Trends */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">1</span>
                    Global Incidence Trends: 1990-2025
                  </CardTitle>
                  <Badge variant="secondary">Epidemiology</Badge>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    The global incidence of Type 1 diabetes has increased dramatically over the past three decades, 
                    with an average annual increase of 3-5% in most developed countries. This rise is too rapid 
                    to be explained by genetic changes alone, pointing to environmental and lifestyle factors.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Regional Variations</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Finland maintains the world's highest T1D incidence at approximately 64 cases per 100,000 
                    children per year, followed by Sweden, Norway, and the UK. In contrast, Asian countries 
                    like China and Japan have rates 10-20 times lower. This "Nordic Paradox" puzzles researchers: 
                    despite excellent healthcare and nutrition, Scandinavian countries lead global T1D rates. 
                    Theories include reduced sun exposure, vitamin D deficiency, and the "hygiene hypothesis" - 
                    the idea that too-clean environments prevent proper immune system development.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Age of Onset Shifting</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Perhaps more concerning than the overall increase is the shift toward earlier diagnosis. 
                    The fastest-growing age group is children under 5 years old, where incidence is increasing 
                    at 5-6% annually - nearly double the rate for older children. This suggests that whatever 
                    environmental factors are responsible, they may be affecting the earliest stages of immune 
                    development. The TEDDY study (The Environmental Determinants of Diabetes in the Young) 
                    has followed over 8,000 children from birth, revealing that islet autoantibodies can appear 
                    as early as 6 months of age, with peak appearance between 1-2 years.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Key Studies</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• DIAMOND Project (WHO): 57 countries, 1990-present</li>
                    <li>• EURODIAB: 44 European centers, standardized methodology</li>
                    <li>• SEARCH for Diabetes in Youth: US multicenter study since 2000</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Article 2: Genetic Risk Factors */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">2</span>
                    Genetic Risk Factors & HLA Types
                  </CardTitle>
                  <Badge variant="secondary">Genetics</Badge>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    While T1D incidence is rising, the genetic landscape remains unchanged. The HLA (Human 
                    Leukocyte Antigen) region on chromosome 6 accounts for approximately 50% of genetic 
                    susceptibility. Specific HLA class II alleles - particularly DR3-DQ2 and DR4-DQ8 - 
                    dramatically increase risk, while others like DR2-DQ6 are protective.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Family Risk Calculations</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    The general population risk for T1D is approximately 0.4% (1 in 250). This increases 
                    to 6% if a sibling has T1D, 3% if the mother has it, and 8% if the father does (the 
                    paternal effect remains unexplained). If both parents have T1D, risk rises to 30%. 
                    For identical twins, concordance is 30-50%, meaning if one twin develops T1D, the other 
                    has a 30-50% lifetime risk. Importantly, this leaves 50-70% discordance even with 
                    identical genes - powerful evidence that environmental triggers are essential.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">The Changing Gene Pool Paradox</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Interestingly, the proportion of newly diagnosed T1D patients with high-risk HLA 
                    genotypes has been declining. In the 1960s, over 60% of new T1D cases had DR3/DR4 
                    high-risk genetics. Today, it's closer to 40%. This "dilution effect" suggests that 
                    whatever environmental factors are driving the increase, they're now able to trigger 
                    T1D in individuals with lower genetic susceptibility - a concerning trend indicating 
                    that environmental pressures have intensified.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Beyond HLA</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Genome-wide association studies (GWAS) have identified over 60 additional gene regions 
                    contributing to T1D risk, including INS (insulin gene), PTPN22, IL2RA, and CTLA4. 
                    Many of these genes regulate immune function, underscoring T1D's autoimmune nature. 
                    However, these non-HLA genes together contribute less than 15% of genetic risk.
                  </p>
                </CardContent>
              </Card>

              {/* Article 3: Accelerator Hypothesis */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">3</span>
                    The Accelerator Hypothesis: Beta Cell Stress
                  </CardTitle>
                  <Badge variant="secondary">Theory</Badge>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    Proposed by Dr. Terence Wilkin in 2001, the Accelerator Hypothesis offers a unifying 
                    theory for Type 1 and Type 2 diabetes. It proposes that all diabetes fundamentally 
                    results from beta cell loss, and that three "accelerators" determine when this loss 
                    becomes clinically significant: intrinsic beta cell fragility (constitution), 
                    insulin resistance (metabolism), and autoimmunity (immune).
                  </p>
                  <h4 className="font-medium mt-4 mb-2">The Childhood Obesity Connection</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    The hypothesis suggests that rising childhood obesity increases insulin resistance, 
                    forcing beta cells to work harder. This metabolic stress makes beta cells more 
                    vulnerable to autoimmune attack and may trigger autoimmunity in genetically susceptible 
                    individuals by increasing beta cell antigen expression. Supporting evidence includes: 
                    higher BMI in children at T1D diagnosis, earlier T1D onset in heavier children, 
                    and correlation between national obesity rates and T1D incidence.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Criticisms and Support</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Critics note that T1D also occurs in thin children and that the obesity-T1D 
                    relationship isn't consistent across all studies. However, the hypothesis has 
                    merit in explaining the parallel rise in childhood obesity and T1D, the decreasing 
                    age of T1D onset, and why T1D is increasing even as high-risk genetics become less 
                    common among new cases. The hypothesis also suggests intervention possibilities: 
                    reducing insulin resistance through weight management could potentially delay or 
                    prevent T1D in genetically susceptible individuals.
                  </p>
                </CardContent>
              </Card>

              {/* Article 4: Protective Factors & Prevention */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">4</span>
                    Protective Factors & Prevention Trials
                  </CardTitle>
                  <Badge variant="secondary">Prevention</Badge>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    While much research focuses on triggers, equally important is understanding what 
                    protects against T1D development. Several factors have shown protective effects, 
                    and ongoing trials are testing interventions in high-risk individuals.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Teplizumab: A Breakthrough</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    In 2022, the FDA approved teplizumab (Tzield) - the first drug shown to delay 
                    T1D onset. In the landmark TN-10 trial, a 14-day course of this anti-CD3 antibody 
                    delayed clinical T1D by a median of 3 years in high-risk relatives with islet 
                    autoantibodies. At 2 years, 50% of the teplizumab group remained diabetes-free 
                    compared to 22% of placebo. This represents the first successful intervention in 
                    T1D prevention history and opens the door to screening at-risk individuals.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Other Protective Findings</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Breastfeeding:</strong> Extended exclusive breastfeeding (&gt;4 months) 
                    consistently shows 20-30% risk reduction, possibly through gut microbiome development 
                    and immune education. <strong>Farm exposure:</strong> Growing up on farms with 
                    livestock exposure reduces T1D risk by 50% in multiple studies (PASTURE, GABRIELA). 
                    <strong>Vitamin D:</strong> The TEDDY study found that adequate vitamin D in infancy 
                    reduces islet autoantibody development by 30%. <strong>Early daycare:</strong> 
                    Paradoxically, more early infections through daycare attendance may be protective.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Ongoing Prevention Trials</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Several trials are testing interventions in at-risk individuals: oral insulin 
                    to induce tolerance (TrialNet), gluten-free diets in infants (GPPAD), and various 
                    immunomodulatory agents. The key barrier is screening: only 10-15% of new T1D 
                    cases have a family history, making population-level screening necessary to 
                    identify at-risk individuals before symptoms appear.
                  </p>
                </CardContent>
              </Card>

              {/* Article 5: Birth Month & Seasonality */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">5</span>
                    The Birth Month Effect & Seasonality
                  </CardTitle>
                  <Badge variant="secondary">Environmental</Badge>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    One of the most intriguing clues about T1D environmental triggers comes from 
                    seasonality patterns. Both the month of birth and the month of diagnosis show 
                    consistent patterns across different populations, suggesting environmental 
                    factors tied to seasons play a role.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Birth Month Effects</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    In Northern Hemisphere countries, children born in spring (March-May) consistently 
                    show 10-20% higher T1D risk than those born in autumn. The pattern reverses in 
                    the Southern Hemisphere. The leading hypothesis involves vitamin D: spring babies 
                    experience their third trimester during winter when maternal vitamin D is lowest, 
                    and spend their first months of life indoors during winter. Since vitamin D is 
                    crucial for immune system development, this early deficiency may set the stage 
                    for later autoimmunity.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Diagnosis Seasonality</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    T1D diagnosis peaks in autumn and winter in most Northern Hemisphere countries, 
                    with the lowest incidence in summer. This pattern suggests viral triggers, as 
                    enterovirus infections (strongly linked to T1D) also peak in autumn. Additionally, 
                    reduced vitamin D during winter months may allow existing autoimmunity to progress. 
                    Some researchers speculate that summer sun exposure may provide a temporary 
                    protective effect, delaying diagnosis until fall.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Latitude Gradient</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    T1D incidence generally increases with latitude (distance from the equator), 
                    correlating with reduced UV exposure and vitamin D synthesis. However, Sardinia - 
                    a Mediterranean island - has one of the world's highest T1D rates, suggesting 
                    genetics (the Sardinian population has unique HLA patterns) can override 
                    environmental latitude effects.
                  </p>
                </CardContent>
              </Card>

              {/* Article 6: Infant Nutrition */}
              <Card className="command-center-widget">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">6</span>
                    Role of Infant Nutrition: TRIGR & Beyond
                  </CardTitle>
                  <Badge variant="secondary">Nutrition</Badge>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    The role of early nutrition in T1D development has been debated for decades. 
                    Several dietary factors during infancy have been implicated, though results 
                    from major trials have been surprising.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">The TRIGR Trial: Unexpected Results</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    The Trial to Reduce IDDM in the Genetically at Risk (TRIGR) was one of the largest 
                    T1D prevention trials ever conducted. Based on earlier studies suggesting that 
                    cow's milk proteins might trigger autoimmunity, TRIGR randomized 2,159 at-risk 
                    infants to receive either extensively hydrolyzed formula (broken-down proteins) 
                    or standard cow's milk formula when breastfeeding wasn't possible. After 15 years 
                    of follow-up, there was no difference in T1D development between groups - a major 
                    negative finding that challenged the cow's milk hypothesis.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Gluten Introduction Timing</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    The timing of gluten introduction has shown more consistent effects. The TEDDY 
                    study found that introducing gluten before 4 months of age doubled the risk of 
                    developing islet autoantibodies. The mechanism may involve gut permeability: 
                    introducing complex proteins before the gut is mature may trigger immune reactions. 
                    Current recommendations suggest introducing gluten between 4-6 months while still 
                    breastfeeding if possible.
                  </p>
                  <h4 className="font-medium mt-4 mb-2">Breastfeeding Protection</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Despite TRIGR's negative results, breastfeeding remains protective. The BABYDIAB 
                    study showed that exclusive breastfeeding for more than 4 months reduced T1D risk, 
                    even in children with high genetic risk. Breast milk provides immune factors, 
                    shapes the gut microbiome favorably, and delays introduction of foreign proteins. 
                    The protection appears dose-dependent - longer breastfeeding duration correlates 
                    with greater risk reduction. However, breastfeeding alone cannot prevent T1D in 
                    all cases, indicating multiple factors are involved.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
