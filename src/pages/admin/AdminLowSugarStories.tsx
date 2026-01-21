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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Droplet, Eye, EyeOff, ThumbsUp } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string;
  category: string | null;
  source_url: string | null;
  source_platform: string | null;
  author_username: string | null;
  is_published: boolean;
  is_featured: boolean;
  upvotes: number;
  created_at: string;
}

export default function AdminLowSugarStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'funny',
    source_url: '',
    source_platform: 'Reddit',
    author_username: '',
    is_published: true,
    is_featured: false
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('low_blood_sugar_stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch stories');
      return;
    }
    setStories(data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      if (editingStory) {
        const { error } = await supabase
          .from('low_blood_sugar_stories')
          .update(formData)
          .eq('id', editingStory.id);
        
        if (error) throw error;
        toast.success('Story updated');
      } else {
        const { error } = await supabase
          .from('low_blood_sugar_stories')
          .insert({ ...formData, upvotes: 0 });
        
        if (error) throw error;
        toast.success('Story created');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchStories();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save story');
    }
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      category: story.category || 'funny',
      source_url: story.source_url || '',
      source_platform: story.source_platform || 'Reddit',
      author_username: story.author_username || '',
      is_published: story.is_published,
      is_featured: story.is_featured
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    const { error } = await supabase
      .from('low_blood_sugar_stories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete story');
      return;
    }

    toast.success('Story deleted');
    fetchStories();
  };

  const togglePublished = async (story: Story) => {
    const { error } = await supabase
      .from('low_blood_sugar_stories')
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
      content: '',
      category: 'funny',
      source_url: '',
      source_platform: 'Reddit',
      author_username: '',
      is_published: true,
      is_featured: false
    });
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'funny': return 'bg-green-500/20 text-green-600';
      case 'scary': return 'bg-red-500/20 text-red-600';
      case 'educational': return 'bg-blue-500/20 text-blue-600';
      default: return 'bg-muted';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
              <Droplet className="h-8 w-8 text-primary" />
              Low Blood Sugar Stories
            </h1>
            <p className="text-muted-foreground">Manage community stories</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="accent-gradient">
                <Plus className="h-4 w-4 mr-2" />
                New Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingStory ? 'Edit Story' : 'Add New Story'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Story title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="funny">Funny</SelectItem>
                        <SelectItem value="scary">Scary</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Source Platform</Label>
                    <Select value={formData.source_platform} onValueChange={(v) => setFormData({ ...formData, source_platform: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reddit">Reddit</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="User Submission">User Submission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="The full story"
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Author Username</Label>
                    <Input
                      value={formData.author_username}
                      onChange={(e) => setFormData({ ...formData, author_username: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Source URL</Label>
                    <Input
                      value={formData.source_url}
                      onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
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
                  {editingStory ? 'Update Story' : 'Add Story'}
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
              <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No stories yet. Add the first one!</p>
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
                        {story.is_featured && <Badge variant="default">Featured</Badge>}
                        <Badge className={getCategoryColor(story.category)}>
                          {story.category}
                        </Badge>
                        <Badge variant={story.is_published ? 'outline' : 'secondary'}>
                          {story.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {story.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {story.upvotes}
                        </span>
                        <span>by {story.author_username || 'Anonymous'}</span>
                        <span>{story.source_platform}</span>
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
