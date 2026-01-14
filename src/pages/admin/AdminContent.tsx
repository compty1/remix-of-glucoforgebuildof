import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, FileText, Award, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Discovery {
  id: string;
  title: string;
  snippet: string;
  credibility: string;
  mechanism: string;
  created_at: string;
}

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  status: string;
  created_at: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

export default function AdminContent() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discoveries');

  const [newDiscovery, setNewDiscovery] = useState({
    title: '',
    snippet: '',
    credibility: 'Medium',
    mechanism: ''
  });

  const [newBounty, setNewBounty] = useState({
    title: '',
    description: '',
    reward_amount: 0
  });

  const fetchContent = async () => {
    try {
      // Fetch discoveries
      const { data: discoveriesData } = await supabase
        .from('discovery_cards')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch bounties
      const { data: bountiesData } = await supabase
        .from('bounties')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch surveys
      const { data: surveysData } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      setDiscoveries(discoveriesData || []);
      setBounties(bountiesData || []);
      setSurveys(surveysData || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleCreateDiscovery = async () => {
    if (!newDiscovery.title || !newDiscovery.snippet) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discovery_cards')
        .insert({
          title: newDiscovery.title,
          snippet: newDiscovery.snippet,
          credibility: newDiscovery.credibility,
          mechanism: newDiscovery.mechanism,
          icon_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
          sources: []
        })
        .select()
        .single();

      if (error) throw error;

      setDiscoveries([data, ...discoveries]);
      setNewDiscovery({ title: '', snippet: '', credibility: 'Medium', mechanism: '' });
      toast.success('Discovery created successfully');
    } catch (error) {
      console.error('Error creating discovery:', error);
      toast.error('Failed to create discovery');
    }
  };

  const handleCreateBounty = async () => {
    if (!newBounty.title || !newBounty.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bounties')
        .insert({
          title: newBounty.title,
          description: newBounty.description,
          reward_amount: newBounty.reward_amount,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      setBounties([data, ...bounties]);
      setNewBounty({ title: '', description: '', reward_amount: 0 });
      toast.success('Bounty created successfully');
    } catch (error) {
      console.error('Error creating bounty:', error);
      toast.error('Failed to create bounty');
    }
  };

  const handleDeleteDiscovery = async (id: string) => {
    try {
      const { error } = await supabase
        .from('discovery_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDiscoveries(discoveries.filter(d => d.id !== id));
      toast.success('Discovery deleted successfully');
    } catch (error) {
      console.error('Error deleting discovery:', error);
      toast.error('Failed to delete discovery');
    }
  };

  const handleDeleteBounty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bounties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBounties(bounties.filter(b => b.id !== id));
      toast.success('Bounty deleted successfully');
    } catch (error) {
      console.error('Error deleting bounty:', error);
      toast.error('Failed to delete bounty');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-8">
            Content Management
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="discoveries" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Discoveries ({discoveries.length})
              </TabsTrigger>
              <TabsTrigger value="bounties" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Bounties ({bounties.length})
              </TabsTrigger>
              <TabsTrigger value="surveys" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Surveys ({surveys.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discoveries" className="space-y-6">
              {/* Create Discovery Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Discovery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        value={newDiscovery.title}
                        onChange={(e) => setNewDiscovery({...newDiscovery, title: e.target.value})}
                        placeholder="Discovery title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Credibility</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={newDiscovery.credibility}
                        onChange={(e) => setNewDiscovery({...newDiscovery, credibility: e.target.value})}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Snippet *</label>
                    <Textarea
                      value={newDiscovery.snippet}
                      onChange={(e) => setNewDiscovery({...newDiscovery, snippet: e.target.value})}
                      placeholder="Brief description of the discovery"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mechanism</label>
                    <Textarea
                      value={newDiscovery.mechanism}
                      onChange={(e) => setNewDiscovery({...newDiscovery, mechanism: e.target.value})}
                      placeholder="Explain the scientific mechanism"
                    />
                  </div>
                  <Button onClick={handleCreateDiscovery}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Discovery
                  </Button>
                </CardContent>
              </Card>

              {/* Discoveries List */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Discoveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Credibility</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discoveries.map((discovery) => (
                        <TableRow key={discovery.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{discovery.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {discovery.snippet}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{discovery.credibility}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(discovery.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteDiscovery(discovery.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bounties" className="space-y-6">
              {/* Create Bounty Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Bounty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        value={newBounty.title}
                        onChange={(e) => setNewBounty({...newBounty, title: e.target.value})}
                        placeholder="Bounty title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Reward Amount</label>
                      <Input
                        type="number"
                        value={newBounty.reward_amount}
                        onChange={(e) => setNewBounty({...newBounty, reward_amount: parseInt(e.target.value)})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <Textarea
                      value={newBounty.description}
                      onChange={(e) => setNewBounty({...newBounty, description: e.target.value})}
                      placeholder="Detailed description of the bounty task"
                    />
                  </div>
                  <Button onClick={handleCreateBounty}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bounty
                  </Button>
                </CardContent>
              </Card>

              {/* Bounties List */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Bounties</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bounties.map((bounty) => (
                        <TableRow key={bounty.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{bounty.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {bounty.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${bounty.reward_amount}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{bounty.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(bounty.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteBounty(bounty.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="surveys">
              <Card>
                <CardHeader>
                  <CardTitle>Survey Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Survey management functionality coming soon. Currently showing existing surveys:
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {surveys.map((survey) => (
                        <TableRow key={survey.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{survey.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {survey.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{survey.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(survey.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}