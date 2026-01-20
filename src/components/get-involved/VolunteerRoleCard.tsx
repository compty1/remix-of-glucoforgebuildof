import { Card, CardContent } from '@/components/ui/card';
import { VolunteerRole } from '@/data/volunteerRoles';

interface VolunteerRoleCardProps {
  role: VolunteerRole;
}

export function VolunteerRoleCard({ role }: VolunteerRoleCardProps) {
  const Icon = role.icon;

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30 border-border/50 group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-accent/50 group-hover:bg-primary/10 transition-colors">
            <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{role.title}</h3>
            <p className="text-muted-foreground text-sm mt-1">{role.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
