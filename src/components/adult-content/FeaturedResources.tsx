import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, FlaskConical, Users, FileText } from 'lucide-react';

const resources = [
  {
    title: 'GrownUpT1Ds Community',
    description: 'A support community specifically for adults with Type 1 diabetes, covering intimacy, alcohol, and real-life challenges.',
    url: 'https://grownupt1ds.org/about-diabetes-type-1-support-community/',
    type: 'Community',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Diabeloop: Sex Differences in Insulin Requirements',
    description: 'Clinical study revealing significant differences in insulin needs between male and female T1D patients.',
    url: 'https://www.diabeloop.com/news/company/diabeloop-study-reveals-significative-sex-differences-in-insulin-requirements-for-type-1-diabetes-patients',
    type: 'Research',
    icon: <FlaskConical className="h-5 w-5" />,
  },
  {
    title: 'EUROSPEC: Sex-Based Insulin Research Poster',
    description: 'European research on how biological sex influences basal insulin requirements and glycemic variability.',
    url: 'https://abstracts.eurospe.org/hrp/0086/eposters/hrp0086rfc5.3_eposter.pdf',
    type: 'Research',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Reddit: Sex with T1D — Community Megathread',
    description: 'One of the most comprehensive community discussions about managing intimacy and sex with Type 1 Diabetes.',
    url: 'https://www.reddit.com/r/Type1Diabetes/comments/1cd7rb7/sex_with_type_1_diabetes_the_challenges_and_the/',
    type: 'Community',
    icon: <Users className="h-5 w-5" />,
  },
];

export const FeaturedResources: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Curated Resources
        </h3>
        <div className="space-y-3">
          {resources.map((r) => (
            <div key={r.url} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="text-primary mt-0.5">{r.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{r.title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {r.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
