import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { InfoRail } from "@/components/InfoRail";
import { DollarSign, Trophy, Users, CheckCircle, Clock } from "lucide-react";

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  status: string;
  claimed_by: string | null;
  created_at: string;
  updated_at: string;
}

const Bounties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBounties();
  }, [user, navigate]);

  const fetchBounties = async () => {
    try {
      const { data, error } = await supabase
        .from('bounties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBounties(data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load bounties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const claimBounty = async (bountyId: string) => {
    if (!user) return;

    setClaiming(bountyId);
    try {
      const { error } = await supabase
        .from('bounties')
        .update({ 
          status: 'claimed',
          claimed_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', bountyId)
        .eq('status', 'open'); // Only update if still open

      if (error) throw error;

      toast({
        title: "Bounty Claimed!",
        description: "You've successfully claimed this task. Check your email for next steps.",
      });

      fetchBounties();
    } catch {
      toast({
        title: "Error",
        description: "Failed to claim bounty. It may have been claimed by someone else.",
        variant: "destructive",
      });
    } finally {
      setClaiming(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'claimed': return 'secondary';
      case 'completed': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'claimed': return <Users className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const openBounties = bounties.filter(b => b.status === 'open');
  const claimedBounties = bounties.filter(b => b.status === 'claimed');
  const completedBounties = bounties.filter(b => b.status === 'completed');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Community Bounty Board</h1>
          <p className="text-muted-foreground">Contribute to diabetes research and earn rewards for your participation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Available Tasks</p>
                      <p className="text-3xl font-bold">{openBounties.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                      <p className="text-3xl font-bold">
                        ${openBounties.reduce((sum, b) => sum + b.reward_amount, 0)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-3xl font-bold">{completedBounties.length}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Available Bounties */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Available Tasks</h2>
              {openBounties.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No available bounties at the moment</p>
                    <p className="text-sm text-muted-foreground">Check back soon for new opportunities!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {openBounties.map((bounty) => (
                    <Card key={bounty.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{bounty.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(bounty.status)}>
                              {getStatusIcon(bounty.status)}
                              <span className="ml-1 capitalize">{bounty.status}</span>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {bounty.description}
                        </CardDescription>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-bold text-primary">${bounty.reward_amount} reward</span>
                          </div>
                          
                          <Button
                            onClick={() => claimBounty(bounty.id)}
                            disabled={claiming === bounty.id}
                            size="sm"
                          >
                            {claiming === bounty.id ? "Claiming..." : "Claim Task"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* In Progress & Completed */}
            {(claimedBounties.length > 0 || completedBounties.length > 0) && (
              <div className="space-y-6">
                {claimedBounties.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">In Progress</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {claimedBounties.map((bounty) => (
                        <Card key={bounty.id} className="opacity-75">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{bounty.title}</CardTitle>
                              <Badge variant="secondary">
                                <Users className="h-3 w-3 mr-1" />
                                Claimed
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription>{bounty.description}</CardDescription>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {completedBounties.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Completed</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {completedBounties.map((bounty) => (
                        <Card key={bounty.id} className="opacity-50">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{bounty.title}</CardTitle>
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription>{bounty.description}</CardDescription>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Real research tasks where your diabetes data and experiences contribute to scientific advancement."
              whyItMatters="Your participation helps researchers understand diabetes patterns and develop better treatments for everyone."
              nextSteps="Choose a task that matches your experience. Complete it according to the instructions to earn your reward."
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Choose a Task</p>
                    <p className="text-sm text-muted-foreground">Select a bounty that interests you</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Complete the Work</p>
                    <p className="text-sm text-muted-foreground">Follow the task instructions carefully</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Get Rewarded</p>
                    <p className="text-sm text-muted-foreground">Receive payment after review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Bounties;