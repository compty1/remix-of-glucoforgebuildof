import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { usePageMeta } from '@/hooks/usePageMeta';
import { toast } from 'sonner';
import { Users, Search, UserPlus, Heart, Loader2, Star } from 'lucide-react';
import { rankMentors, type MentorProfile, type MenteePreferences, type MatchResult } from '@/utils/mentorMatcher';

const sb = supabase as any;

export default function MentorDirectory() {
  usePageMeta('Mentor Directory', 'Find a T1D mentor matched to your device stack and experience.');
  const { user } = useAuthStore();
  const [mentors, setMentors] = useState<any[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('find');
  const [searchQuery, setSearchQuery] = useState('');
  const [myDevices, setMyDevices] = useState('');
  const [mySpecialties, setMySpecialties] = useState('');
  const [myYears, setMyYears] = useState(1);

  useEffect(() => {
    const load = async () => {
      const { data } = await sb
        .from('mentor_profiles')
        .select('*')
        .eq('is_mentor', true)
        .order('years_with_t1d', { ascending: false });

      // Gap 14/163: Get actual mentee counts from mentor_matches
      const mentorList = data || [];
      if (mentorList.length > 0) {
        const mentorIds = mentorList.map((m: any) => m.user_id);
        const { data: matchCounts } = await sb
          .from('mentor_matches')
          .select('mentor_id')
          .in('mentor_id', mentorIds)
          .eq('status', 'active');
        const countMap: Record<string, number> = {};
        (matchCounts || []).forEach((mc: any) => {
          countMap[mc.mentor_id] = (countMap[mc.mentor_id] || 0) + 1;
        });
        mentorList.forEach((m: any) => { m._menteeCount = countMap[m.user_id] || 0; });
      }

      setMentors(mentorList);
      setLoading(false);
    };
    load();
  }, []);

  const findMatches = () => {
    const menteePrefs: MenteePreferences = {
      currentDevices: myDevices.split(',').map(d => d.trim()).filter(Boolean),
      desiredSpecialties: mySpecialties.split(',').map(s => s.trim()).filter(Boolean),
      yearsWithT1d: myYears,
    };
    const mentorProfiles: MentorProfile[] = mentors.map(m => ({
      userId: m.user_id,
      yearsWithT1d: m.years_with_t1d || 0,
      devicesUsed: m.devices_used || [],
      specialties: m.specialties || [],
      maxMentees: m.max_mentees || 3,
      currentMenteeCount: m._menteeCount || 0,
    }));
    setMatches(rankMentors(mentorProfiles, menteePrefs));
    setTab('matches');
  };

  const requestMentor = async (mentorUserId: string) => {
    if (!user) { toast.error('Please sign in'); return; }
    const { error } = await sb.from('mentor_matches').insert({
      mentor_id: mentorUserId,
      mentee_id: user.id,
      status: 'pending',
      device_overlap_score: matches.find(m => m.mentorUserId === mentorUserId)?.score || 0,
    });
    if (error?.code === '23505') toast.info('Already requested');
    else if (error) toast.error('Failed to send request');
    else toast.success('Mentor request sent!');
  };

  const filteredMentors = mentors.filter(m =>
    !searchQuery || m.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.specialties?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-3xl font-heading font-bold mb-2">Mentor Directory</h1>
        <p className="text-muted-foreground mb-6">Connect with experienced T1D veterans matched to your exact device stack.</p>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="find">Find Mentors</TabsTrigger>
            <TabsTrigger value="matches">My Matches</TabsTrigger>
            <TabsTrigger value="become">Become a Mentor</TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-5 w-5" /> Smart Match</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Your devices (e.g., Dexcom G7, Tandem t:slim X2)" value={myDevices} onChange={(e) => setMyDevices(e.target.value)} />
                <Input placeholder="Topics (e.g., pregnancy, athletics)" value={mySpecialties} onChange={(e) => setMySpecialties(e.target.value)} />
                <div className="flex items-center gap-3">
                  <label className="text-sm">Years with T1D:</label>
                  <Input type="number" min={0} value={myYears} onChange={(e) => setMyYears(parseInt(e.target.value) || 0)} className="w-20" />
                  <Button onClick={findMatches} size="sm"><Search className="h-4 w-4 mr-1" /> Find</Button>
                </div>
              </CardContent>
            </Card>

            <Input placeholder="Search by specialty or bio..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : filteredMentors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No mentors found.</p>
            ) : (
              <div className="grid gap-3">
                {filteredMentors.map(m => (
                  <Card key={m.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{m.years_with_t1d}+ years with T1D</p>
                          <p className="text-sm text-muted-foreground mt-1">{m.bio || 'No bio yet'}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {m.devices_used?.map((d: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{d}</Badge>)}
                            {m.specialties?.map((s: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => requestMentor(m.user_id)}>
                          <UserPlus className="h-4 w-4 mr-1" /> Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-3">
            {matches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Use Smart Match to find compatible mentors.</p>
            ) : matches.map(match => {
              const mentor = mentors.find(m => m.user_id === match.mentorUserId);
              if (!mentor) return null;
              return (
                <Card key={match.mentorUserId}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge>{match.score}% match</Badge>
                          <span className="text-sm">{mentor.years_with_t1d}+ years</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{mentor.bio}</p>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Devices: {match.breakdown.deviceOverlap}pts</span>
                          <span>Specialty: {match.breakdown.specialtyOverlap}pts</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => requestMentor(match.mentorUserId)}>
                        <Heart className="h-4 w-4 mr-1" /> Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="become">
            <BecomeMentorForm userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function BecomeMentorForm({ userId }: { userId?: string }) {
  const [bio, setBio] = useState('');
  const [devices, setDevices] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [years, setYears] = useState(5);
  const [maxMentees, setMaxMentees] = useState(3);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!userId) { toast.error('Please sign in first'); return; }
    setSaving(true);
    const { error } = await sb.from('mentor_profiles').upsert({
      user_id: userId,
      is_mentor: true,
      years_with_t1d: years,
      devices_used: devices.split(',').map(d => d.trim()).filter(Boolean),
      specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
      bio,
      max_mentees: maxMentees,
    }, { onConflict: 'user_id' });

    toast[error ? 'error' : 'success'](error ? 'Failed to save' : 'Mentor profile saved!');
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-5 w-5" /> Become a Mentor</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Years with T1D</label>
          <Input type="number" min={0} value={years} onChange={(e) => setYears(parseInt(e.target.value) || 0)} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Devices Used (comma-separated)</label>
          <Input placeholder="Dexcom G7, Tandem t:slim X2" value={devices} onChange={(e) => setDevices(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Specialties</label>
          <Input placeholder="pregnancy, athletics, low-carb" value={specialties} onChange={(e) => setSpecialties(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <Textarea placeholder="Tell mentees about your T1D journey..." value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium">Max Mentees</label>
          <Input type="number" min={1} max={10} value={maxMentees} onChange={(e) => setMaxMentees(parseInt(e.target.value) || 1)} className="mt-1 w-20" />
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Mentor Profile
        </Button>
      </CardContent>
    </Card>
  );
}
