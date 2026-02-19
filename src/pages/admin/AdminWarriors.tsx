import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Award, Eye, EyeOff, Shield, Trophy } from 'lucide-react';

interface WarriorStory {
  id: string;
  title: string;
  story_content: string;
  person_name: string | null;
  is_anonymous: boolean;
  platform: string | null;
  obstacles: string[] | null;
  triumphs: string[] | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

export default function AdminWarriors() {
  const [stories, setStories] = useState<WarriorStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState<WarriorStory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    story_content: '',
    person_name: '',
    is_anonymous: false,
    platform: 'Reddit',
    obstacles: '',
    triumphs: '',
    is_published: true,
    is_featured: false
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('warrior_stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch warrior stories');
      return;
    }
    setStories(data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.story_content) {
      toast.error('Title and story content are required');
      return;
    }

    const storyData = {
      title: formData.title,
      story_content: formData.story_content,
      person_name: formData.is_anonymous ? null : formData.person_name,
      is_anonymous: formData.is_anonymous,
      platform: formData.platform,
      obstacles: formData.obstacles.split('\n').filter(o => o.trim()),
      triumphs: formData.triumphs.split('\n').filter(t => t.trim()),
      is_published: formData.is_published,
      is_featured: formData.is_featured
    };

    try {
      if (editingStory) {
        const { error } = await supabase
          .from('warrior_stories')
          .update(storyData)
          .eq('id', editingStory.id);
        
        if (error) throw error;
        toast.success('Warrior story updated');
      } else {
        const { error } = await supabase
          .from('warrior_stories')
          .insert(storyData);
        
        if (error) throw error;
        toast.success('Warrior story created');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStories();
    } catch (error) {
      toast.error('Failed to save warrior story');
    }
  };

  const handleEdit = (story: WarriorStory) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      story_content: story.story_content,
      person_name: story.person_name || '',
      is_anonymous: story.is_anonymous,
      platform: story.platform || 'Reddit',
      obstacles: (story.obstacles || []).join('\n'),
      triumphs: (story.triumphs || []).join('\n'),
      is_published: story.is_published,
      is_featured: story.is_featured
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warrior story?')) return;

    const { error } = await supabase
      .from('warrior_stories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete story');
      return;
    }

    toast.success('Warrior story deleted');
    fetchStories();
  };

  const togglePublished = async (story: WarriorStory) => {
    const { error } = await supabase
      .from('warrior_stories')
      .update({ is_published: !story.is_published })
      .eq('id', story.id);

    if (error) {
      toast.error('Failed to update story');
      return;
    }

    fetchStories();
  };

  const resetForm = () => {
    setEditingStory(null);
    setFormData({
      title: '',
      story_content: '',
      person_name: '',
      is_anonymous: false,
      platform: 'Reddit',
      obstacles: '',
      triumphs: '',
      is_published: true,
      is_featured: false
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              Warrior Spotlight
            </h1>
            <p className="text-muted-foreground">Manage inspiring T1D warrior stories</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="accent-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Add Warrior Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStory ? 'Edit Warrior Story' : 'Add New Warrior Story'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Story headline"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Person Name</Label>
                    <Input
                      value={formData.person_name}
                      onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                      placeholder="Name (if not anonymous)"
                      disabled={formData.is_anonymous}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Source Platform</Label>
                    <Input
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      placeholder="Reddit, Facebook, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Story Content *</Label>
                  <Textarea
                    value={formData.story_content}
                    onChange={(e) => setFormData({ ...formData, story_content: e.target.value })}
                    placeholder="The full warrior story"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Obstacles Overcome (one per line)</Label>
                  <Textarea
                    value={formData.obstacles}
                    onChange={(e) => setFormData({ ...formData, obstacles: e.target.value })}
                    placeholder="DKA at diagnosis&#10;Insurance battles&#10;Depression from burnout"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Triumphs (one per line)</Label>
                  <Textarea
                    value={formData.triumphs}
                    onChange={(e) => setFormData({ ...formData, triumphs: e.target.value })}
                    placeholder="Ran first marathon&#10;A1C under 7 for 5 years&#10;Started support group"
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_anonymous}
                      onCheckedChange={(v) => setFormData({ ...formData, is_anonymous: v })}
                    />
                    <Label>Anonymous</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(v) => setFormData({ ...formData, is_published: v })}
                    />
                    <Label>Published</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                    />
                    <Label>Featured</Label>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingStory ? 'Update Story' : 'Add Warrior Story'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : stories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No warrior stories yet. Add the first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Card key={story.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{story.title}</h3>
                        {story.is_featured && (
                          <Badge className="bg-warning/20 text-warning">
                            <Trophy className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge variant={story.is_published ? 'outline' : 'secondary'}>
                          {story.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {story.story_content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {story.is_anonymous ? (
                            <>
                              <Shield className="h-3 w-3" />
                              Anonymous
                            </>
                          ) : (
                            story.person_name
                          )}
                        </span>
                        <span>{story.platform}</span>
                        <span>{(story.obstacles || []).length} obstacles</span>
                        <span>{(story.triumphs || []).length} triumphs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePublished(story)}
                      >
                        {story.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(story)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(story.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
