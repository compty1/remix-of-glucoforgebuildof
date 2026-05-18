import Layout from '@/components/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { 
  User, Mail, Calendar, Shield, Award, Wand2, RefreshCw, 
  Lock, Eye, EyeOff, Activity, FileText, MessageSquare, 
  Upload as UploadIcon, CheckCircle2, Clock, TrendingUp, Trophy, Flame, Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  generateNickname, 
  generateMultipleNicknames, 
  avatarStyles, 
  getAvatarUrl 
} from '@/utils/nicknameGenerator';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';
import { useAchievements } from '@/hooks/useAchievements';
import { useStreaks } from '@/hooks/useStreaks';
import { useSearchParams } from 'react-router-dom';
import { ConnectedAccounts } from '@/components/settings/ConnectedAccounts';

interface Profile {
  id?: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  avatar_style?: string;
  created_at?: string;
  updated_at?: string;
}

interface ActivityItem {
  id: string;
  type: 'survey' | 'upload' | 'post' | 'review' | 'save';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

export default function Profile() {
  usePageMeta('Profile', 'View and edit your GlucoForge profile, achievements, streaks, and activity history.');
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_style: 'default'
  });
  
  // Nickname generation
  const [nicknameOptions, setNicknameOptions] = useState<string[]>([]);
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  
  // Password change
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Activity stats
  const [activityStats, setActivityStats] = useState({
    surveysCompleted: 0,
    dataUploads: 0,
    communityPosts: 0,
    deviceReviews: 0,
    savedItems: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  
  // Achievements and streaks
  const { completedAchievements, totalPoints, isLoading: achievementsLoading } = useAchievements();
  const { streaks, getTotalStreakDays } = useStreaks();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchActivityStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_style: (data as any).avatar_style || 'default'
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityStats = async () => {
    if (!user) return;

    try {
      // Fetch survey responses count
      const { count: surveyCount } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch device reviews count
      const { count: reviewCount } = await supabase
        .from('device_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setActivityStats({
        surveysCompleted: surveyCount || 0,
        dataUploads: 0,
        communityPosts: 0,
        deviceReviews: reviewCount || 0,
        savedItems: 0
      });

      // Build recent activity from device reviews
      const activities: ActivityItem[] = [];

      // Add recent reviews
      const { data: recentReviews } = await supabase
        .from('device_reviews')
        .select('id, created_at, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      recentReviews?.forEach(review => {
        activities.push({
          id: review.id,
          type: 'review',
          title: 'Device Review Posted',
          description: review.title || 'Shared your experience',
          timestamp: review.created_at,
          icon: <MessageSquare className="h-4 w-4 text-primary" />
        });
      });

      setRecentActivity(activities);
    } catch (error) {
      // Activity stats are non-critical — fail silently
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: formData.display_name || null,
            bio: formData.bio || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: formData.display_name || null,
            bio: formData.bio || null
          })
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
      }

      toast.success('Profile updated successfully');
      await fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateNewNicknames = () => {
    setNicknameOptions(generateMultipleNicknames(6));
  };

  const selectNickname = (nickname: string) => {
    setFormData(prev => ({ ...prev, display_name: nickname }));
    setShowNicknameDialog(false);
    toast.success(`Nickname set to "${nickname}"`);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const selectAvatarStyle = (styleId: string) => {
    setFormData(prev => ({ ...prev, avatar_style: styleId }));
  };

  const currentAvatarUrl = getAvatarUrl(
    formData.display_name || user?.email || 'user',
    formData.avatar_style
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            Your Profile
          </h1>
          
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="achievements">
                <Trophy className="h-4 w-4 mr-1" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Profile Header with Avatar */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-4 border-primary/20">
                        <AvatarImage src={currentAvatarUrl} alt="Profile" />
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                          {formData.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h2 className="text-2xl font-semibold">
                          {formData.display_name || 'Anonymous Warrior'}
                        </h2>
                        <Dialog open={showNicknameDialog} onOpenChange={setShowNicknameDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={generateNewNicknames}
                              className="gap-1"
                            >
                              <Wand2 className="h-4 w-4" />
                              Generate Nickname
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Choose Your Warrior Name</DialogTitle>
                              <DialogDescription>
                                Pick a diabetes-themed nickname or generate new ones
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-2">
                                {nicknameOptions.map((nickname, i) => (
                                  <Button
                                    key={i}
                                    variant="outline"
                                    className="justify-start h-auto py-3"
                                    onClick={() => selectNickname(nickname)}
                                  >
                                    {nickname}
                                  </Button>
                                ))}
                              </div>
                              <Button 
                                variant="secondary" 
                                className="w-full gap-2"
                                onClick={generateNewNicknames}
                              >
                                <RefreshCw className="h-4 w-4" />
                                Generate More
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                        <Mail className="h-4 w-4" />
                        {user?.email}
                      </p>
                      <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Active Contributor
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Customize how you appear in the community
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <div className="flex gap-2">
                          <Input
                            id="display_name"
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => handleChange('display_name', e.target.value.slice(0, 50))}
                            placeholder="Your warrior name"
                            maxLength={50}
                          />
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, display_name: generateNickname() }));
                              toast.success('Random nickname generated!');
                            }}
                          >
                            <Wand2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleChange('bio', e.target.value.slice(0, 500))}
                          placeholder="Share your T1D journey, tips, or anything you'd like..."
                          className="min-h-[100px]"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/500</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Avatar Style</Label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {avatarStyles.map(style => (
                            <button
                              key={style.id}
                              onClick={() => selectAvatarStyle(style.id)}
                              className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                                formData.avatar_style === style.id 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="text-2xl text-center">{style.icon}</div>
                              <p className="text-xs text-center mt-1 text-muted-foreground">
                                {style.name}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button onClick={handleSave} disabled={saving} className="w-full">
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Your Contributions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Surveys</span>
                          </div>
                          <Badge variant="secondary">{activityStats.surveysCompleted}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UploadIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Data Uploads</span>
                          </div>
                          <Badge variant="secondary">{activityStats.dataUploads}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Reviews</span>
                          </div>
                          <Badge variant="secondary">{activityStats.deviceReviews}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Saved Items</span>
                          </div>
                          <Badge variant="secondary">{activityStats.savedItems}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Account Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Verified
                    </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className="bg-primary/10 text-primary">
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center bg-primary/5 border-primary/20">
                  <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-primary">
                    {completedAchievements.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                </Card>
                <Card className="p-4 text-center bg-warning/5 border-warning/20">
                  <Star className="h-6 w-6 text-warning mx-auto mb-2" />
                  <div className="text-3xl font-bold text-warning">
                    {totalPoints}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </Card>
                <Card className="p-4 text-center bg-brand-red/5 border-brand-red/20">
                  <Flame className="h-6 w-6 text-brand-red mx-auto mb-2" />
                  <div className="text-3xl font-bold text-brand-red">
                    {getTotalStreakDays()}
                  </div>
                  <p className="text-sm text-muted-foreground">Streak Days</p>
                </Card>
                <Card className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <div className="text-3xl font-bold">
                    {streaks.find(s => s.streak_type === 'platform_visit')?.longest_streak || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Best Visit Streak</p>
                </Card>
              </div>

              {/* Active Streaks */}
              {streaks.filter(s => s.current_streak > 0).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-brand-red" />
                      Active Streaks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {streaks.filter(s => s.current_streak > 0).map(streak => (
                        <div 
                          key={streak.id}
                          className="flex items-center justify-between p-3 bg-brand-red/10 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {streak.streak_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Best: {streak.longest_streak}
                            </p>
                          </div>
                          <div className="text-2xl font-bold text-brand-red flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            {streak.current_streak}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Achievements Grid */}
              <AchievementGrid showAll />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest contributions and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map(activity => (
                        <div 
                          key={activity.id}
                          className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="p-2 bg-background rounded-full">
                            {activity.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Activity Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Start contributing by uploading data, completing surveys, or writing reviews!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contribution Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {activityStats.surveysCompleted}
                  </div>
                  <p className="text-sm text-muted-foreground">Surveys</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {activityStats.dataUploads}
                  </div>
                  <p className="text-sm text-muted-foreground">Uploads</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {activityStats.deviceReviews}
                  </div>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {activityStats.savedItems}
                  </div>
                  <p className="text-sm text-muted-foreground">Saved</p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <ConnectedAccounts />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and privacy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Change your account password
                      </p>
                    </div>
                    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Lock className="h-4 w-4" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter a new password for your account
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>New Password</Label>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({
                                  ...prev, 
                                  newPassword: e.target.value
                                }))}
                                placeholder="Enter new password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({
                                ...prev, 
                                confirmPassword: e.target.value
                              }))}
                              placeholder="Confirm new password"
                            />
                          </div>
                          <Button 
                            onClick={handlePasswordChange} 
                            disabled={changingPassword}
                            className="w-full"
                          >
                            {changingPassword ? 'Updating...' : 'Update Password'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Verified
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Privacy Settings</p>
                      <p className="text-sm text-muted-foreground">
                        Control how your data is used
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Export Your Data</p>
                      <p className="text-sm text-muted-foreground">
                        Download all your contributions
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}