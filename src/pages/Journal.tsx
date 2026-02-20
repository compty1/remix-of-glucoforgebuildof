import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { InfoRail } from "@/components/InfoRail";
import { TrendingUp, AlertCircle, Calendar, Sparkles, Upload } from "lucide-react";

interface Shift {
  id: string;
  shift_time: string;
  direction: string;
  context: string;
  tags: string[];
  created_at: string;
  user_id?: string;
}

interface TriggerReport {
  tag: string;
  count: number;
}

const Journal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  usePageMeta('Glucose Journal', 'Track glucose shifts, patterns, and triggers in your personal diabetes journal on GlucoForge.');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [autoDetectedShifts, setAutoDetectedShifts] = useState<Shift[]>([]);
  const [triggerReport, setTriggerReport] = useState<TriggerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [direction, setDirection] = useState<'High' | 'Low'>('High');
  const [context, setContext] = useState('');
  const [tags, setTags] = useState('');
  const [shiftTime, setShiftTime] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchShifts();
  }, [user, navigate]);

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allShifts = data || [];
      
      // Separate auto-detected vs manual entries
      const autoDetected = allShifts.filter(s => 
        Array.isArray(s.tags) && s.tags.includes('auto-detected')
      );
      const manualEntries = allShifts.filter(s => 
        !Array.isArray(s.tags) || !s.tags.includes('auto-detected')
      );
      
      setAutoDetectedShifts(autoDetected);
      setShifts(manualEntries);
      generateTriggerReport(allShifts);
    } catch (error) {
      // Silent failure — toast is shown to user below
      toast({
        title: "Error",
        description: "Failed to load your journal entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTriggerReport = (shiftsData: Shift[]) => {
    const tagCounts: { [key: string]: number } = {};
    
    shiftsData.forEach(shift => {
      shift.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const report = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTriggerReport(report);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await supabase
        .from('shifts')
        .insert({
          user_id: user.id,
          shift_time: shiftTime || new Date().toISOString(),
          direction,
          context,
          tags: tagsArray
        });

      if (error) throw error;

      toast({
        title: "Entry Added",
        description: "Your glycemic shift has been logged successfully",
      });

      // Reset form
      setContext('');
      setTags('');
      setShiftTime('');
      
      // Refresh data
      fetchShifts();
    } catch (error) {
      console.error('Error adding shift:', error);
      toast({
        title: "Error",
        description: "Failed to add journal entry",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Glycemic Shift Journal</h1>
          <p className="text-muted-foreground">Track your glucose patterns and identify personal triggers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add New Entry Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Log New Glycemic Shift
                </CardTitle>
                <CardDescription>Record when you notice unexpected glucose changes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Direction</label>
                      <Select value={direction} onValueChange={(value: 'High' | 'Low') => setDirection(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High Glucose</SelectItem>
                          <SelectItem value="Low">Low Glucose</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Time (optional)</label>
                      <Input
                        type="datetime-local"
                        value={shiftTime}
                        onChange={(e) => setShiftTime(e.target.value)}
                        placeholder="Leave blank for now"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Context</label>
                    <Textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="What was happening when you noticed the shift? (e.g., after exercise, during stress, before meal)"
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Separate with commas (e.g., exercise, stress, meal, sleep)"
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Adding Entry..." : "Add Entry"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Auto-Detected Patterns */}
            {autoDetectedShifts.length > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Auto-Detected Patterns
                  </CardTitle>
                  <CardDescription>
                    Patterns automatically identified from your glucose data uploads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {autoDetectedShifts.slice(0, 5).map((shift) => (
                      <div key={shift.id} className="border-l-4 border-primary/60 pl-4 py-2 bg-background/50 rounded-r-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant={shift.direction === 'High' ? 'destructive' : 'secondary'}>
                                {shift.direction} Glucose
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-primary/10">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Auto-detected
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(shift.shift_time).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{shift.context}</p>
                            <div className="flex flex-wrap gap-1">
                              {shift.tags.filter(t => t !== 'auto-detected').map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    onClick={() => navigate('/data-upload')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload More Data
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Manual Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Your Journal Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shifts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No journal entries yet</p>
                    <p className="text-sm">Start logging your glycemic shifts to identify patterns</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shifts.slice(0, 10).map((shift) => (
                      <div key={shift.id} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={shift.direction === 'High' ? 'destructive' : 'secondary'}>
                                {shift.direction} Glucose
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(shift.shift_time).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{shift.context}</p>
                            <div className="flex flex-wrap gap-1">
                              {shift.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Personal Trigger Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Top Triggers
                </CardTitle>
                <CardDescription>Most common tags in your entries</CardDescription>
              </CardHeader>
              <CardContent>
                {triggerReport.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add more entries to see patterns</p>
                ) : (
                  <div className="space-y-3">
                    {triggerReport.map((trigger, index) => (
                      <div key={trigger.tag} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{trigger.tag}</span>
                        <Badge variant="secondary">{trigger.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Rail */}
            <InfoRail
              whatThisShows="This journal helps you track unexpected glucose changes and identify personal patterns."
              whyItMatters="Understanding your unique triggers helps predict and prevent future glucose excursions."
              nextSteps="Log shifts consistently for 2 weeks to see meaningful patterns emerge."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Journal;