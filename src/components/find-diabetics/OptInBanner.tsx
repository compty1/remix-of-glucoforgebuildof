import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Eye, EyeOff, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { DiabeticProfile } from '@/hooks/useDiabeticProfiles';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const LOOKING_FOR_OPTIONS = [
  'Workout Buddy', 'Parent of T1D Child', 'Pump User', 'CGM User',
  'Newly Diagnosed', 'College Student', 'Young Adult', 'Support Group',
  'Running Partner', 'Recipe Sharing', 'Travel Buddy'
];

interface Props {
  myProfile: DiabeticProfile | null;
  onSave: (profile: Partial<DiabeticProfile>) => void;
  isSaving: boolean;
}

export const OptInBanner: React.FC<Props> = ({ myProfile, onSave, isSaving }) => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(myProfile?.display_name || '');
  const [city, setCity] = useState(myProfile?.city || '');
  const [state, setState] = useState(myProfile?.state || '');
  const [diagnosisYear, setDiagnosisYear] = useState(myProfile?.diagnosis_year?.toString() || '');
  const [deviceSetup, setDeviceSetup] = useState(myProfile?.device_setup || '');
  const [bio, setBio] = useState(myProfile?.bio_snippet || '');
  const [lookingFor, setLookingFor] = useState<string[]>(myProfile?.looking_for || []);
  const [isVisible, setIsVisible] = useState(myProfile?.is_visible ?? true);

  // Sync form fields when myProfile changes (e.g. after save)
  useEffect(() => {
    if (myProfile) {
      setDisplayName(myProfile.display_name || '');
      setCity(myProfile.city || '');
      setState(myProfile.state || '');
      setDiagnosisYear(myProfile.diagnosis_year?.toString() || '');
      setDeviceSetup(myProfile.device_setup || '');
      setBio(myProfile.bio_snippet || '');
      setLookingFor(myProfile.looking_for || []);
      setIsVisible(myProfile.is_visible ?? true);
    }
  }, [myProfile]);

  if (!user) return null;

  const handleSave = () => {
    onSave({
      display_name: displayName,
      city,
      state,
      diagnosis_year: diagnosisYear ? parseInt(diagnosisYear) : null,
      device_setup: deviceSetup || null,
      bio_snippet: bio || null,
      looking_for: lookingFor.length > 0 ? lookingFor : null,
      is_visible: isVisible,
    });
    setOpen(false);
  };

  const toggleTag = (tag: string) => {
    setLookingFor(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {myProfile ? 'Manage Your Profile' : 'Make Yourself Discoverable'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {myProfile
              ? `You're ${myProfile.is_visible ? 'visible' : 'hidden'} to other T1D users.`
              : 'Opt in so other Type 1 diabetics near you can find and connect with you. Only your city/state and display name are shown.'}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={myProfile ? 'outline' : 'default'} size="sm">
              {myProfile ? (
                <>{myProfile.is_visible ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />} Edit Profile</>
              ) : (
                <><UserPlus className="h-4 w-4 mr-1" /> Opt In</>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{myProfile ? 'Edit Your Profile' : 'Create Your Discoverable Profile'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <Label>Visible to others</Label>
                <Switch checked={isVisible} onCheckedChange={setIsVisible} />
              </div>
              <div>
                <Label>Display Name *</Label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your display name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City *</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                </div>
                <div>
                  <Label>State *</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Diagnosis Year</Label>
                <Input type="number" value={diagnosisYear} onChange={e => setDiagnosisYear(e.target.value)} placeholder="e.g. 2005" />
              </div>
              <div>
                <Label>Device Setup</Label>
                <Input value={deviceSetup} onChange={e => setDeviceSetup(e.target.value)} placeholder="e.g. Dexcom G7 + Omnipod 5" />
              </div>
              <div>
                <Label>Bio (max 200 chars)</Label>
                <Textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 200))} placeholder="A short intro..." maxLength={200} />
              </div>
              <div>
                <Label>Looking For</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {LOOKING_FOR_OPTIONS.map(tag => (
                    <Badge
                      key={tag}
                      variant={lookingFor.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {lookingFor.includes(tag) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleSave} disabled={!displayName || !city || !state || isSaving} className="w-full">
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
