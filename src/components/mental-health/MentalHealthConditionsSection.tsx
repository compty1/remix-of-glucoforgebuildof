import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Brain,
  AlertTriangle,
  Heart,
  Utensils,
  Battery,
  Shield,
  Zap,
  Moon,
  ExternalLink,
  BookOpen,
  Activity,
  RefreshCw
} from 'lucide-react';

interface Source {
  title: string;
  url: string;
  organization: string;
}

interface MentalHealthCondition {
  id: string;
  title: string;
  description: string;
  prevalence: string;
  symptoms: string[];
  t1dConnection: string;
  sources: Source[];
  icon: React.ReactNode;
  color: string;
}

const mentalHealthConditions: MentalHealthCondition[] = [
  {
    id: 'depression',
    title: 'Depression & Mood Disorders',
    description: 'Depression is significantly more common in people with Type 1 diabetes, affecting quality of life and diabetes management outcomes.',
    prevalence: '2-3x higher than general population',
    symptoms: [
      'Persistent feelings of sadness or emptiness',
      'Loss of interest in activities once enjoyed',
      'Changes in appetite or weight',
      'Sleep disturbances',
      'Fatigue and low energy',
      'Difficulty concentrating on diabetes management'
    ],
    t1dConnection: 'The chronic burden of diabetes management, glucose variability affecting neurotransmitters, and the constant vigilance required can contribute to depression. Blood sugar swings directly impact mood and energy levels.',
    sources: [
      {
        title: 'Prevalence and predictors of diabetes distress and depression in people with Type 1 diabetes',
        url: 'https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2024.1378797',
        organization: 'Frontiers in Psychiatry'
      },
      {
        title: 'Unraveling concepts of distress, burnout, and depression in Type 1 diabetes: A scoping review',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10589808/',
        organization: 'PMC/NIH'
      },
      {
        title: 'Clinical phenotyping of people with Type 1 diabetes according to distress',
        url: 'https://drc.bmj.com/content/11/4/e003427',
        organization: 'BMJ Open Diabetes Research & Care'
      }
    ],
    icon: <Heart className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-600'
  },
  {
    id: 'anxiety',
    title: 'Anxiety Disorders',
    description: 'Anxiety disorders, including generalized anxiety, panic disorder, and social anxiety, are prevalent in T1D due to the constant monitoring and management requirements.',
    prevalence: 'Up to 20% of T1D patients experience clinical anxiety',
    symptoms: [
      'Excessive worry about blood sugar levels',
      'Panic attacks triggered by CGM alarms',
      'Social anxiety around diabetes management in public',
      'Avoidance of activities due to diabetes concerns',
      'Physical symptoms like racing heart and sweating',
      'Difficulty relaxing or sleeping'
    ],
    t1dConnection: 'CGM alarms, fear of public hypoglycemic episodes, constant vigilance about food and insulin, and the unpredictability of blood sugar responses can all trigger and maintain anxiety.',
    sources: [
      {
        title: 'Anxiety in Youth With Type 1 Diabetes',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8983448/',
        organization: 'PMC/NIH'
      },
      {
        title: 'Diabetes and Mental Health',
        url: 'https://www.cdc.gov/diabetes/about/mental-health-and-diabetes.html',
        organization: 'CDC'
      }
    ],
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'bg-amber-500/10 text-amber-600'
  },
  {
    id: 'fear-hypoglycemia',
    title: 'Fear of Hypoglycemia (FOH)',
    description: 'Fear of hypoglycemia is a specific anxiety that affects the majority of people with T1D and can significantly impact daily life and diabetes management decisions.',
    prevalence: 'Affects up to 77% of T1D patients to some degree',
    symptoms: [
      'Intentionally running blood sugars high to avoid lows',
      'Excessive checking of glucose levels',
      'Avoidance of exercise or physical activity',
      'Sleep disruption due to fear of nocturnal hypoglycemia',
      'Limiting travel or social activities',
      'Overeating to prevent low blood sugar'
    ],
    t1dConnection: 'Previous severe hypoglycemic events, hypoglycemia unawareness, and the unpredictability of blood sugar responses can create lasting fear that impacts quality of life and paradoxically worsens glycemic control.',
    sources: [
      {
        title: 'Fear of Hypoglycemia - Mental Health Provider Diabetes Workbook',
        url: 'https://professional.diabetes.org/sites/default/files/media/Mental_Health_Workbook_Chapter_5.pdf',
        organization: 'American Diabetes Association'
      },
      {
        title: 'Fear of hypoglycemia in Danish adolescents with type 1 diabetes and their parents',
        url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0317973',
        organization: 'PLOS ONE'
      },
      {
        title: 'Fear of hypoglycemia: Relationship with hypoglycemic risk and psychological factors',
        url: 'https://www.frontiersin.org/articles/10.3389/fendo.2022.1024924',
        organization: 'Frontiers in Endocrinology'
      }
    ],
    icon: <Zap className="h-5 w-5" />,
    color: 'bg-red-500/10 text-red-600'
  },
  {
    id: 'ocd',
    title: 'Obsessive-Compulsive Behaviors & OCD',
    description: 'The constant monitoring required in T1D management can develop into obsessive-compulsive patterns, with research suggesting shared genetic pathways between OCD and insulin signaling.',
    prevalence: 'Elevated risk, particularly in those with intensive management',
    symptoms: [
      'Compulsive glucose checking beyond medical necessity',
      'Obsession with "perfect" blood sugar numbers',
      'Ritualistic behaviors around food and insulin',
      'Excessive worry about diabetes complications',
      'Intrusive thoughts about diabetes management',
      'Difficulty accepting blood sugar variability'
    ],
    t1dConnection: 'The need for precise management, numeric feedback from CGMs, and the desire for control can trigger OCD-like behaviors. Research has found shared genetic etiology between OCD and insulin signaling pathways.',
    sources: [
      {
        title: 'Shared genetic etiology between obsessive-compulsive disorder and insulin signaling',
        url: 'https://www.nature.com/articles/s41398-022-02063-y',
        organization: 'Nature - Translational Psychiatry'
      },
      {
        title: 'Obsessive-compulsive disorder, insulin signaling and diabetes - A novel approach',
        url: 'https://pubmed.ncbi.nlm.nih.gov/35318286/',
        organization: 'PubMed'
      },
      {
        title: 'Adverse Mental Health Outcomes with CGM Use',
        url: 'https://www.clinicaladvisor.com/home/topics/diabetes-information-center/cases-of-adverse-mental-health-outcomes-with-cgm-use/',
        organization: 'Clinical Advisor'
      }
    ],
    icon: <RefreshCw className="h-5 w-5" />,
    color: 'bg-purple-500/10 text-purple-600'
  },
  {
    id: 'eating-disorders',
    title: 'Eating Disorders & Diabulimia',
    description: 'Eating disorders are significantly more common in people with T1D, with diabulimia (intentional insulin restriction for weight control) being a particularly dangerous form unique to insulin-dependent diabetes.',
    prevalence: '2x more common in T1D, especially in females',
    symptoms: [
      'Intentional insulin omission or restriction for weight loss',
      'Excessive focus on food and carbohydrate counting',
      'Binge eating or restrictive eating patterns',
      'Body image disturbances',
      'Unexplained A1C elevation despite apparent effort',
      'Frequent diabetic ketoacidosis (DKA) episodes'
    ],
    t1dConnection: 'The constant focus on food, weight awareness from insulin\'s effect on weight, and the unique ability to manipulate weight through insulin creates conditions that can foster disordered eating.',
    sources: [
      {
        title: 'Eating disorders in type 1 diabetes: a nationwide study',
        url: 'https://link.springer.com/article/10.1007/s00125-024-06324-x',
        organization: 'Diabetologia'
      },
      {
        title: 'Diabetes & Eating Disorders Clinical Guidebook',
        url: 'https://professional.diabetes.org/sites/default/files/media/Eating_Disorders_web_version_1.pdf',
        organization: 'American Diabetes Association'
      },
      {
        title: 'Eating Disorders in Girls and Women With Type 1 Diabetes',
        url: 'https://diabetesjournals.org/care/article/25/10/1899/24562/Eating-Disorders-in-Girls-and-Women-With-Type-1',
        organization: 'Diabetes Care'
      },
      {
        title: 'Eating Disorders and Disordered Eating in Type 1 Diabetes: Screening and Treatment',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6460527/',
        organization: 'PMC/NIH'
      }
    ],
    icon: <Utensils className="h-5 w-5" />,
    color: 'bg-pink-500/10 text-pink-600'
  },
  {
    id: 'diabetes-distress',
    title: 'Diabetes Distress',
    description: 'Diabetes distress is the emotional burden and worry specifically related to living with and managing diabetes. It is distinct from clinical depression but can significantly impact quality of life.',
    prevalence: '20-40% of T1D patients experience significant distress',
    symptoms: [
      'Feeling overwhelmed by diabetes demands',
      'Frustration with management requirements',
      'Worry about future complications',
      'Feeling alone in managing diabetes',
      'Guilt about glucose readings',
      'Anger at the disease'
    ],
    t1dConnection: 'The relentless 24/7 nature of diabetes management, constant decision-making, and the emotional weight of living with a chronic condition create a unique form of distress specific to diabetes.',
    sources: [
      {
        title: 'Prevalence and predictors of diabetes-related distress among adults with type 1 diabetes',
        url: 'https://www.nature.com/articles/s41598-024-54842-8',
        organization: 'Nature - Scientific Reports'
      },
      {
        title: 'Diabetes Distress in Adults with Type 1 Diabetes: A Norwegian Registry Study',
        url: 'https://pubmed.ncbi.nlm.nih.gov/36420397/',
        organization: 'PubMed'
      }
    ],
    icon: <Battery className="h-5 w-5" />,
    color: 'bg-orange-500/10 text-orange-600'
  },
  {
    id: 'burnout',
    title: 'Diabetes Burnout',
    description: 'Diabetes burnout occurs when the constant demands of diabetes management lead to feeling overwhelmed and disengaged from self-care, often resulting in reduced attention to diabetes management.',
    prevalence: 'Common among long-duration T1D patients',
    symptoms: [
      'Reduced glucose monitoring',
      'Skipping insulin doses',
      'Ignoring CGM alarms',
      'Avoiding healthcare appointments',
      'Feelings of hopelessness about diabetes',
      'Disengagement from diabetes care routines'
    ],
    t1dConnection: 'Years of intensive management without breaks can lead to exhaustion. The relentless nature of T1D, where there is no time off, creates conditions ripe for burnout.',
    sources: [
      {
        title: 'Burnout, distress, and depressive symptoms in adults with type 1 diabetes',
        url: 'https://pubmed.ncbi.nlm.nih.gov/35150184/',
        organization: 'PubMed'
      },
      {
        title: 'Scoping Review: Unraveling Diabetes Distress, Burnout, and Depression',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10589808/',
        organization: 'PMC/NIH'
      }
    ],
    icon: <Battery className="h-5 w-5" />,
    color: 'bg-gray-500/10 text-gray-600'
  },
  {
    id: 'ptsd',
    title: 'PTSD & Trauma',
    description: 'Traumatic experiences related to diabetes, such as severe hypoglycemic events, DKA, or the diagnosis itself, can lead to post-traumatic stress symptoms in both patients and their caregivers.',
    prevalence: 'Significant in those with severe hypoglycemia history',
    symptoms: [
      'Flashbacks to traumatic diabetes events',
      'Nightmares about hypoglycemia or DKA',
      'Hypervigilance around diabetes management',
      'Avoidance of situations associated with trauma',
      'Emotional numbness',
      'Heightened startle response to CGM alarms'
    ],
    t1dConnection: 'Severe hypoglycemic episodes, DKA hospitalizations, and the diagnosis experience itself can be traumatic. Parents of T1D children are also at risk for PTSD symptoms.',
    sources: [
      {
        title: 'PTSD and diabetes-related outcomes in Type 1 Diabetes',
        url: 'https://www.nature.com/articles/s41598-023-37069-3',
        organization: 'Nature - Scientific Reports'
      },
      {
        title: 'Posttraumatic Stress in Parents of Children With New-Onset Type 1 Diabetes',
        url: 'https://academic.oup.com/jpepsy/article/46/9/1080/6291393',
        organization: 'Journal of Pediatric Psychology'
      },
      {
        title: 'Effects of Trauma and Anxiety on Adherence in Pediatric Type 1 Diabetes',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8983448/',
        organization: 'PMC/NIH'
      },
      {
        title: 'Type 1 diabetes and mental health difficulties: A care pathway tool',
        url: 'https://www.cambridge.org/core/journals/bjpsych-advances/article/type-1-diabetes-and-mental-health-difficulties-a-care-pathway-tool/7F8B9E4E42B12B4E8B05FFCB58F1C85E',
        organization: 'Cambridge Core - BJPsych Advances'
      }
    ],
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-indigo-500/10 text-indigo-600'
  },
  {
    id: 'cognitive',
    title: 'Cognitive Impact',
    description: 'Type 1 diabetes can affect cognitive functions including memory, attention, processing speed, and cognitive flexibility, particularly with long disease duration or poor glycemic control.',
    prevalence: 'Up to 50% of adults with T1D may experience cognitive challenges',
    symptoms: [
      'Difficulty concentrating',
      'Memory problems',
      'Slower processing speed',
      'Reduced mental flexibility',
      'Brain fog during glucose fluctuations',
      'Executive function challenges'
    ],
    t1dConnection: 'Chronic hyperglycemia, recurrent hypoglycemia, and glucose variability can all impact brain function. Research shows T1D is associated with subtle cognitive differences and potentially accelerated brain aging.',
    sources: [
      {
        title: 'Type 1 diabetes linked to faster brain aging',
        url: 'https://www.joslin.org/about/news-media/type-1-diabetes-linked-faster-brain-aging',
        organization: 'Joslin Diabetes Center'
      },
      {
        title: 'Cognitive Decline in Long-Duration Type 1 Diabetes',
        url: 'https://insight.jci.org/articles/view/158608',
        organization: 'JCI Insight'
      },
      {
        title: 'Cognitive flexibility in patients with type 1 diabetes',
        url: 'https://www.nature.com/articles/s41598-022-08251-8',
        organization: 'Nature - Scientific Reports'
      },
      {
        title: 'Neurocognitive profile in adult type 1 diabetes population',
        url: 'https://www.frontiersin.org/articles/10.3389/fendo.2023.1141312',
        organization: 'Frontiers in Endocrinology'
      }
    ],
    icon: <Brain className="h-5 w-5" />,
    color: 'bg-cyan-500/10 text-cyan-600'
  },
  {
    id: 'sleep',
    title: 'Sleep Disorders',
    description: 'Sleep problems are common in T1D due to nocturnal hypoglycemia concerns, CGM alarms, and the physiological effects of glucose fluctuations on sleep quality.',
    prevalence: 'Significantly elevated in T1D population',
    symptoms: [
      'Difficulty falling asleep due to diabetes worry',
      'Frequent waking from CGM alarms',
      'Night sweats from nocturnal hypoglycemia',
      'Insomnia related to fear of low blood sugar',
      'Daytime fatigue affecting glucose control',
      'Poor sleep quality overall'
    ],
    t1dConnection: 'Nocturnal hypoglycemia anxiety, CGM alarms, and blood sugar fluctuations disrupt sleep architecture. Poor sleep then worsens insulin sensitivity, creating a vicious cycle.',
    sources: [
      {
        title: 'Sleep-related disorders in patients with type 1 diabetes mellitus: current insights',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5849109/',
        organization: 'PMC/NIH'
      },
      {
        title: 'Influence of sleep quality on glycemic control in type 1 diabetes',
        url: 'https://www.frontiersin.org/articles/10.3389/fendo.2023.1118464',
        organization: 'Frontiers in Endocrinology'
      },
      {
        title: 'Type 1 Diabetes and Sleep: A Narrative Review',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9146161/',
        organization: 'PMC/NIH'
      }
    ],
    icon: <Moon className="h-5 w-5" />,
    color: 'bg-violet-500/10 text-violet-600'
  }
];

const MentalHealthConditionsSection = () => {
  const totalSources = mentalHealthConditions.reduce((acc, condition) => acc + condition.sources.length, 0);

  return (
    <section className="mb-12">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-heading">
                Mental Health Conditions Linked to Type 1 Diabetes
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Understanding the psychological impact of T1D helps in seeking appropriate support and care
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {totalSources}+ Peer-Reviewed Sources
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {mentalHealthConditions.length} Condition Categories
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="mb-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Important:</strong> Living with Type 1 diabetes places unique psychological demands that can impact mental health. 
              Research shows that people with T1D are at higher risk for several mental health conditions. 
              Recognizing these connections is the first step toward getting appropriate support. 
              If you're experiencing any of these conditions, please reach out to a mental health professional who understands chronic illness.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {mentalHealthConditions.map((condition) => (
              <AccordionItem 
                key={condition.id} 
                value={condition.id}
                className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${condition.color}`}>
                      {condition.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{condition.title}</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        Prevalence: {condition.prevalence}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4 pl-13">
                    <p className="text-muted-foreground">
                      {condition.description}
                    </p>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Connection to T1D:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {condition.t1dConnection}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Common Symptoms:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {condition.symptoms.map((symptom, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Research Sources:</h4>
                      <div className="space-y-2">
                        {condition.sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <ExternalLink className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                                {source.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {source.organization}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">About These Sources</h4>
                <p className="text-sm text-muted-foreground">
                  This information is compiled from {totalSources}+ peer-reviewed studies and authoritative sources including 
                  the American Diabetes Association, Nature, CDC, Frontiers in Psychiatry, PLOS ONE, and the NIH/PubMed database.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default MentalHealthConditionsSection;
