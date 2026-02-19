import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { InfoRail } from "@/components/InfoRail";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BeakerIcon, PlayIcon, HistoryIcon } from "lucide-react";

interface Simulation {
  id: string;
  event_name: string;
  params: any;
  created_at: string;
}

interface GlucoseDataPoint {
  time: number;
  glucose: number;
}

const scenarioOptions = [
  { value: 'exercise_cardio', label: 'Cardio Exercise (30 min)', description: 'Moderate intensity cardio workout' },
  { value: 'exercise_strength', label: 'Strength Training (45 min)', description: 'Weight lifting session' },
  { value: 'meal_high_carb', label: 'High Carb Meal (60g)', description: 'Pasta or rice-based meal' },
  { value: 'meal_low_carb', label: 'Low Carb Meal (15g)', description: 'Protein and vegetable meal' },
  { value: 'stress_event', label: 'Stress Event', description: 'High stress situation' },
  { value: 'sleep_poor', label: 'Poor Sleep (4 hrs)', description: 'Sleep deprivation impact' },
  { value: 'illness_cold', label: 'Common Cold', description: 'Mild illness effect' },
  { value: 'medication_steroid', label: 'Steroid Medication', description: 'Prednisone or similar' }
];

const ScenarioLab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  
  // Form state
  const [selectedScenario, setSelectedScenario] = useState('');
  const [baselineGlucose, setBaselineGlucose] = useState('120');
  const [currentSimulation, setCurrentSimulation] = useState<GlucoseDataPoint[] | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSimulations();
  }, [user, navigate]);

  const fetchSimulations = async () => {
    try {
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSimulations(data || []);
    } catch (error) {
      console.error('Error fetching simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateGlucoseCurve = (scenarioType: string, baseline: number): GlucoseDataPoint[] => {
    const data: GlucoseDataPoint[] = [];
    const duration = 240; // 4 hours in minutes
    
    for (let time = 0; time <= duration; time += 15) {
      let glucose = baseline;
      
      switch (scenarioType) {
        case 'exercise_cardio':
          if (time <= 30) {
            glucose = baseline - (time * 0.5); // Drop during exercise
          } else if (time <= 60) {
            glucose = baseline - 15 + ((time - 30) * 0.3); // Recovery
          } else {
            glucose = baseline - 6 + Math.random() * 5; // Stabilize lower
          }
          break;
          
        case 'exercise_strength':
          if (time <= 45) {
            glucose = baseline + (time * 0.2); // Slight rise during strength training
          } else {
            glucose = baseline + 9 - ((time - 45) * 0.1); // Gradual decline
          }
          break;
          
        case 'meal_high_carb':
          if (time <= 15) {
            glucose = baseline; // No change yet
          } else if (time <= 75) {
            glucose = baseline + Math.pow((time - 15) / 60, 2) * 80; // Peak rise
          } else {
            glucose = baseline + 80 - ((time - 75) * 0.8); // Decline
          }
          break;
          
        case 'meal_low_carb':
          if (time <= 30) {
            glucose = baseline + (time * 0.3); // Gentle rise
          } else {
            glucose = baseline + 9 - ((time - 30) * 0.05); // Slow decline
          }
          break;
          
        case 'stress_event':
          // Cortisol-driven spike: rapid rise over ~60 min, gradual recovery over 2-3h
          if (time <= 60) {
            glucose = baseline + (time / 60) * 35; // Rise to ~+35 mg/dL
          } else {
            glucose = baseline + 35 * Math.exp(-0.015 * (time - 60)); // Exponential decay
          }
          break;
          
        case 'sleep_poor':
          // Dawn phenomenon exaggerated + elevated baseline from insulin resistance
          if (time <= 120) {
            glucose = baseline + 10 + (time / 120) * 15; // Gradual climb
          } else {
            glucose = baseline + 25 - ((time - 120) * 0.08); // Slow recovery
          }
          break;
          
        case 'illness_cold':
          // Sustained elevation from inflammation + counter-regulatory hormones
          if (time <= 60) {
            glucose = baseline + (time / 60) * 30; // Rise phase
          } else if (time <= 180) {
            glucose = baseline + 30 + Math.sin((time - 60) * 0.03) * 10; // Elevated plateau with variation
          } else {
            glucose = baseline + 30 - ((time - 180) * 0.2); // Slow recovery
          }
          break;
          
        case 'medication_steroid':
          // Steroid effect: delayed onset (~2h), peaks at 4-6h, here we show 4h window
          if (time <= 60) {
            glucose = baseline + (time / 60) * 10; // Mild early rise
          } else if (time <= 180) {
            glucose = baseline + 10 + ((time - 60) / 120) * 50; // Accelerating rise
          } else {
            glucose = baseline + 60 + ((time - 180) / 60) * 10; // Continued climb (plateau not yet reached in 4h)
          }
          break;
          
        default:
          glucose = baseline + Math.random() * 10 - 5;
      }
      
      // Add deterministic physiological noise (seeded by time for reproducibility)
      const noise = Math.sin(time * 0.7) * 3 + Math.cos(time * 1.3) * 2;
      glucose += noise;
      
      // Keep realistic bounds
      glucose = Math.max(50, Math.min(400, glucose));
      
      data.push({ time, glucose: Math.round(glucose) });
    }
    
    return data;
  };

  const runSimulation = async () => {
    if (!selectedScenario || !user) return;
    
    setRunning(true);
    
    try {
      const baseline = parseInt(baselineGlucose);
      const glucoseCurve = generateGlucoseCurve(selectedScenario, baseline);
      
      // Save simulation to database
      const { error } = await supabase
        .from('simulations')
        .insert({
          user_id: user.id,
          event_name: selectedScenario,
          params: JSON.stringify({
            baseline_glucose: baseline,
            curve_data: glucoseCurve
          })
        });

      if (error) throw error;

      setCurrentSimulation(glucoseCurve);
      fetchSimulations();
      
      toast({
        title: "Simulation Complete",
        description: "Your glucose prediction has been generated",
      });
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: "Error",
        description: "Failed to run simulation",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const selectedScenarioData = scenarioOptions.find(s => s.value === selectedScenario);

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
          <h1 className="text-4xl font-bold text-foreground mb-2">Scenario Lab</h1>
          <p className="text-muted-foreground mb-4">Explore how different events might affect glucose levels using simplified simulations</p>
          <MedicalDisclaimer context="These are simplified mathematical simulations, not AI-powered predictions. Results are illustrative and should not guide treatment decisions." />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Simulation Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BeakerIcon className="h-5 w-5" />
                  Run New Simulation
                </CardTitle>
                <CardDescription>Select a scenario to see predicted glucose response</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Scenario</label>
                    <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a scenario" />
                      </SelectTrigger>
                      <SelectContent>
                        {scenarioOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedScenarioData && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedScenarioData.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Baseline Glucose (mg/dL)</label>
                    <Input
                      type="number"
                      value={baselineGlucose}
                      onChange={(e) => setBaselineGlucose(e.target.value)}
                      placeholder="120"
                      min="70"
                      max="200"
                    />
                  </div>
                </div>

                <Button 
                  onClick={runSimulation} 
                  disabled={!selectedScenario || running}
                  className="w-full"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  {running ? "Running Simulation..." : "Run Simulation"}
                </Button>
              </CardContent>
            </Card>

            {/* Current Simulation Results */}
            {currentSimulation && (
              <Card>
                <CardHeader>
                  <CardTitle>Predicted Glucose Response</CardTitle>
                  <CardDescription>
                    {selectedScenarioData?.label} - 4 hour projection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentSimulation}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="time" 
                          label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Glucose (mg/dL)', angle: -90, position: 'insideLeft' }}
                          domain={[50, 300]}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value} mg/dL`, 'Glucose']}
                          labelFormatter={(label) => `${label} minutes`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="glucose" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Simulation Notes:</p>
                    <p className="text-sm text-muted-foreground">
                      This prediction is based on general patterns and may not reflect your individual response. 
                      Use this as a starting point for discussion with your healthcare team.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Simulation History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HistoryIcon className="h-5 w-5" />
                  Recent Simulations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {simulations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BeakerIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No simulations yet</p>
                    <p className="text-sm">Run your first scenario to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {simulations.map((simulation) => {
                      const scenarioData = scenarioOptions.find(s => s.value === simulation.event_name);
                      return (
                        <div key={simulation.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{scenarioData?.label || simulation.event_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(simulation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Baseline: {simulation.params?.baseline_glucose}mg/dL
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Simulated glucose curves based on general physiological models — not personalized AI predictions. Results are illustrative only."
              whyItMatters="Visualizing potential glucose responses can help you think through scenarios, but these are simplified simulations, not medical predictions."
              nextSteps="Use these as discussion starters with your healthcare team. Never adjust insulin or treatment based solely on these simulations."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ScenarioLab;
