import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Smartphone, Calendar, UserPlus, Check } from 'lucide-react';
import type { DiabeticProfile } from '@/hooks/useDiabeticProfiles';

interface Props {
  profile: DiabeticProfile;
  onConnect: (userId: string) => void;
  alreadyRequested: boolean;
  isOwnProfile: boolean;
}

export const UserProfileCard: React.FC<Props> = ({ profile, onConnect, alreadyRequested, isOwnProfile }) => {
  const currentYear = new Date().getFullYear();
  const diagnosisYears = profile.diagnosis_year ? currentYear - profile.diagnosis_year : null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {profile.display_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{profile.display_name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{profile.city}, {profile.state}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {profile.bio_snippet && (
          <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio_snippet}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {diagnosisYears !== null && (
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              T1D {diagnosisYears}yr{diagnosisYears !== 1 ? 's' : ''}
            </Badge>
          )}
          {profile.device_setup && (
            <Badge variant="outline" className="text-xs">
              <Smartphone className="h-3 w-3 mr-1" />
              {profile.device_setup}
            </Badge>
          )}
        </div>

        {profile.looking_for && profile.looking_for.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.looking_for.map((tag) => (
              <Badge key={tag} variant="default" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {!isOwnProfile && (
          <Button
            onClick={() => onConnect(profile.user_id)}
            disabled={alreadyRequested}
            size="sm"
            className="w-full"
            variant={alreadyRequested ? "secondary" : "default"}
          >
            {alreadyRequested ? (
              <><Check className="h-4 w-4 mr-1" /> Request Sent</>
            ) : (
              <><UserPlus className="h-4 w-4 mr-1" /> Request to Connect</>
            )}
          </Button>
        )}

        {isOwnProfile && (
          <Badge variant="outline" className="w-full justify-center py-1">Your Profile</Badge>
        )}
      </CardContent>
    </Card>
  );
};
