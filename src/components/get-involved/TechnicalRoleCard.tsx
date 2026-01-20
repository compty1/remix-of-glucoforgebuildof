import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { TechnicalRole } from '@/data/volunteerRoles';
import { Link } from 'react-router-dom';

interface TechnicalRoleCardProps {
  role: TechnicalRole;
}

export function TechnicalRoleCard({ role }: TechnicalRoleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = role.icon;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-border/50 ${
        isExpanded ? 'ring-2 ring-primary/20' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{role.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{role.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {role.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Typical Tasks</h4>
              <ul className="space-y-1">
                {role.tasks.map((task, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>

            {role.openProjects && role.openProjects.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Open Projects</h4>
                <div className="flex flex-wrap gap-2">
                  {role.openProjects.map((project) => (
                    <Link 
                      key={project} 
                      to="/build-with-us"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {project}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
