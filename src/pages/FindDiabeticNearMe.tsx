import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Building2, Globe, Search, ExternalLink, Shield, Heart, MessageCircle, Eye, Lightbulb, Handshake } from 'lucide-react';
import { useDiabeticProfiles } from '@/hooks/useDiabeticProfiles';
import { useCommunityDirectory } from '@/hooks/useCommunityDirectory';
import { UserProfileCard } from '@/components/find-diabetics/UserProfileCard';
import { CommunityDirectoryCard } from '@/components/find-diabetics/CommunityDirectoryCard';
import { OptInBanner } from '@/components/find-diabetics/OptInBanner';
import { ConnectionRequestModal } from '@/components/find-diabetics/ConnectionRequestModal';
import { ConnectionsTab } from '@/components/find-diabetics/ConnectionsTab';
import { useAuthStore } from '@/store/authStore';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const ORG_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'jdrf_chapter', label: 'JDRF Chapters' },
  { value: 'ada_office', label: 'ADA Offices' },
  { value: 'campus_chapter', label: 'Campus Chapters' },
  { value: 'camp', label: 'Diabetes Camps' },
  { value: 'online_community', label: 'Online Communities' },
  { value: 'support_group', label: 'Support Groups' },
];

const REDDIT_COMMUNITIES = [
  { name: 'r/diabetes_t1d', url: 'https://www.reddit.com/r/diabetes_t1d/', description: 'Main T1D subreddit with 50k+ members' },
  { name: 'r/diabetes', url: 'https://www.reddit.com/r/diabetes/', description: 'General diabetes community' },
  { name: 'r/Type1Diabetes', url: 'https://www.reddit.com/r/Type1Diabetes/', description: 'Active T1D discussion forum' },
  { name: 'r/dexcom', url: 'https://www.reddit.com/r/dexcom/', description: 'Dexcom CGM users community' },
  { name: 'r/Omnipod', url: 'https://www.reddit.com/r/Omnipod/', description: 'Omnipod pump users' },
];

const TIPS = [
  { icon: '🚶', title: 'Diabetes Walks', text: 'JDRF One Walk and ADA Step Out events are the #1 way to meet other T1Ds in your area. Most chapters host annual walks.' },
  { icon: '📱', title: 'Spot the CGM', text: "See someone with a Dexcom or Libre sensor? A friendly wave and 'Hey, nice sensor!' is the T1D handshake." },
  { icon: '🏕️', title: 'Diabetes Camps', text: 'Even if you\'re an adult, many camps have alumni networks and volunteer opportunities to stay connected.' },
  { icon: '💬', title: 'Online to IRL', text: 'Join local Facebook groups or Discord servers, then suggest a coffee meetup. Many lasting friendships start online.' },
  { icon: '🏥', title: 'Endo Waiting Room', text: "Your endocrinologist's waiting room is full of fellow T1Ds. Don't be afraid to start a conversation." },
  { icon: '🔒', title: 'Safety First', text: 'When meeting someone from the internet, always meet in a public place, tell a friend where you\'re going, and trust your instincts.' },
];

const FindDiabeticNearMe: React.FC = () => {
  const { user } = useAuthStore();
  const [stateFilter, setStateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [orgTypeFilter, setOrgTypeFilter] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [connectUserId, setConnectUserId] = useState<string | null>(null);

  const { profiles, isLoading, myProfile, myProfileLoading, upsertProfile, sendConnectionRequest, myRequests, connectedProfiles, updateConnectionStatus, removeConnection } = useDiabeticProfiles(stateFilter, searchQuery);
  const pendingIncomingCount = myRequests.filter(r => r.to_user_id === user?.id && r.status === 'pending').length;
  const { data: directory = [], isLoading: dirLoading } = useCommunityDirectory(stateFilter, orgTypeFilter || undefined);

  const connectedOrRequestedUserIds = new Set(
    myRequests
      .filter(r => r.status !== 'declined')
      .flatMap(r => [r.from_user_id, r.to_user_id])
  );

  const generateRedditSearchUrl = (location: string) => {
    const encoded = encodeURIComponent(`meetup ${location}`);
    return `https://www.reddit.com/r/diabetes_t1d/search/?q=${encoded}&restrict_sr=1&sort=new`;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <BackButton />

        {/* Hero */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <MapPin className="h-4 w-4" />
            Find Your T1D Community
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Find a Diabetic Near Me</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with other Type 1 diabetics near you. Browse app users who've opted in, 
            or explore local JDRF chapters, ADA offices, campus groups, and online communities.
          </p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, city, or device..."
                className="pl-9"
              />
            </div>
            <Select value={stateFilter} onValueChange={(v) => setStateFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Opt-in Banner */}
        {user && (
          <OptInBanner
            myProfile={myProfile ?? null}
            onSave={(profile) => upsertProfile.mutate(profile)}
            isSaving={upsertProfile.isPending}
          />
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> People</TabsTrigger>
            <TabsTrigger value="orgs"><Building2 className="h-4 w-4 mr-1" /> Orgs</TabsTrigger>
            <TabsTrigger value="online"><Globe className="h-4 w-4 mr-1" /> Online</TabsTrigger>
            <TabsTrigger value="connections" className="relative">
              <Handshake className="h-4 w-4 mr-1" /> Connections
              {pendingIncomingCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {pendingIncomingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb className="h-4 w-4 mr-1" /> Tips</TabsTrigger>
          </TabsList>

          {/* People Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Nearby App Users (Opt-in)
              </h2>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" /> Privacy-first
              </Badge>
            </div>

            {!user && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Sign in to see and connect with other T1D users near you.</p>
                  <Button asChild className="mt-3"><a href="/auth">Sign In</a></Button>
                </CardContent>
              </Card>
            )}

            {user && isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <Card key={i} className="animate-pulse"><CardContent className="h-48" /></Card>
                ))}
              </div>
            )}

            {user && !isLoading && profiles.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No discoverable users found{stateFilter ? ` in ${stateFilter}` : ''}. Be the first to opt in!</p>
                </CardContent>
              </Card>
            )}

            {user && !isLoading && profiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map(profile => (
                  <UserProfileCard
                    key={profile.id}
                    profile={profile}
                    onConnect={(userId) => setConnectUserId(userId)}
                    alreadyRequested={connectedOrRequestedUserIds.has(profile.user_id)}
                    isOwnProfile={profile.user_id === user?.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="orgs" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Local T1D Communities & Organizations
              </h2>
              <Select value={orgTypeFilter} onValueChange={(v) => setOrgTypeFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {ORG_TYPES.map(t => <SelectItem key={t.value || 'all'} value={t.value || 'all'}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {dirLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <Card key={i} className="animate-pulse"><CardContent className="h-36" /></Card>
                ))}
              </div>
            )}

            {!dirLoading && directory.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No organizations found. Try adjusting your filters or check back soon!</p>
                </CardContent>
              </Card>
            )}

            {!dirLoading && directory.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {directory.map(entry => (
                  <CommunityDirectoryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Online Communities Tab */}
          <TabsContent value="online" className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Reddit & Online Communities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {REDDIT_COMMUNITIES.map(c => (
                <Card key={c.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{c.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <a href={c.url} target="_blank" rel="noopener noreferrer">
                        Visit Community <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Reddit location search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4" /> Find Local Posts on Reddit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter your city or state to search for meetup posts and local T1D discussions on Reddit.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    placeholder="e.g. Austin TX, California, Chicago..."
                  />
                  <Button
                    asChild
                    disabled={!locationInput}
                    variant="default"
                  >
                    <a
                      href={locationInput ? generateRedditSearchUrl(locationInput) : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Search <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            {user ? (
              <ConnectionsTab
                userId={user.id}
                myRequests={myRequests}
                connectedProfiles={connectedProfiles}
                onAccept={(id) => updateConnectionStatus.mutate({ requestId: id, status: 'accepted' })}
                onDecline={(id) => updateConnectionStatus.mutate({ requestId: id, status: 'declined' })}
                onRemove={(id) => removeConnection.mutate(id)}
                isUpdating={updateConnectionStatus.isPending}
                isRemoving={removeConnection.isPending}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Sign in to manage your connections.</p>
                  <Button asChild className="mt-3"><a href="/auth">Sign In</a></Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Tips for Meeting Other Diabetics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TIPS.map(tip => (
                <Card key={tip.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-xl">{tip.icon}</span> {tip.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{tip.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Connection Request Modal */}
        <ConnectionRequestModal
          open={!!connectUserId}
          onClose={() => setConnectUserId(null)}
          onSend={(message) => {
            if (connectUserId) {
              sendConnectionRequest.mutate({ toUserId: connectUserId, message });
              setConnectUserId(null);
            }
          }}
          isSending={sendConnectionRequest.isPending}
        />
      </div>
    </Layout>
  );
};

export default FindDiabeticNearMe;
