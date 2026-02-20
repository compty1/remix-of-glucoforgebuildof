import React, { useState } from "react";
import { usePageMeta } from '@/hooks/usePageMeta';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Brain, Heart, AlertTriangle, Shield, Pill, Sun, Phone, ExternalLink,
  ThumbsUp, MessageSquare, ChevronDown, ChevronUp, Flame, Battery,
  CheckCircle2, Clock, Users, Sparkles, Download, BookOpen, Stethoscope,
  Leaf, Moon, Zap, Droplet, HeartPulse, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBurnoutPosts, useBurnoutComments, type BurnoutPost } from "@/hooks/useBurnoutPosts";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { motion } from "framer-motion";

// ─── Self-Assessment Quiz ────────────────────────────────────────────
const quizQuestions = [
  "I skip blood sugar checks more often than I used to",
  "I feel resentful or angry about having to manage diabetes",
  "I avoid looking at my CGM data or glucose logs",
  "I've been 'rage bolusing' or ignoring high blood sugars",
  "I've skipped or delayed doctor/endo appointments",
  "I feel emotionally numb when I see my numbers",
  "Carb counting feels exhausting or pointless",
  "I feel like diabetes controls my life, not the other way around",
  "I withdraw from friends or family when diabetes is hard",
  "I feel guilty about not managing diabetes 'perfectly'",
];

const BurnoutQuiz = () => {
  const [answers, setAnswers] = useState<boolean[]>(new Array(10).fill(false));
  const [showResult, setShowResult] = useState(false);
  const score = answers.filter(Boolean).length;

  const getResult = () => {
    if (score <= 2) return { level: "Low", color: "text-success", bg: "bg-success/10 border-success/30", message: "You're managing well. Keep checking in with yourself regularly." };
    if (score <= 5) return { level: "Moderate", color: "text-warning", bg: "bg-warning/10 border-warning/30", message: "You're showing signs of diabetes fatigue. Consider the recovery plans below and talk to your care team." };
    if (score <= 8) return { level: "High", color: "text-highlight", bg: "bg-highlight/10 border-highlight/30", message: "You're experiencing significant burnout. Please reach out to a diabetes-specialized therapist and review the 'Minimum Viable Diabetes' plan below." };
    return { level: "Severe", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", message: "You're in crisis-level burnout. Please use the safety checklist below and contact your care team or the 988 Suicide & Crisis Lifeline immediately if needed." };
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary" /> Burnout Self-Assessment</CardTitle>
        <CardDescription>Check any statements that apply to you right now</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quizQuestions.map((q, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Checkbox checked={answers[i]} onCheckedChange={(checked) => {
              const newAnswers = [...answers];
              newAnswers[i] = !!checked;
              setAnswers(newAnswers);
            }} />
            <span className="text-sm leading-tight">{q}</span>
          </label>
        ))}
        <Button onClick={() => setShowResult(true)} className="w-full mt-4">See My Results</Button>
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-lg border ${getResult().bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-bold text-lg ${getResult().color}`}>{getResult().level} Burnout</span>
              <Badge variant="outline">{score}/10</Badge>
            </div>
            <p className="text-sm">{getResult().message}</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Community Post Card ─────────────────────────────────────────────
const BurnoutPostCard = ({ post }: { post: BurnoutPost }) => {
  const [showComments, setShowComments] = useState(false);
  const { data: comments } = useBurnoutComments(showComments ? post.id : null);

  const categoryColors: Record<string, string> = {
    "Taking a Break": "bg-accent/20 text-accent-foreground",
    "Automation Saved Me": "bg-primary/10 text-primary",
    "Therapy That Worked": "bg-success/10 text-success",
    "Simplifying Management": "bg-warning/10 text-warning",
    "CGM Burnout": "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {post.burnout_category && (
                <Badge className={categoryColors[post.burnout_category] || "bg-muted"}>{post.burnout_category}</Badge>
              )}
              <span className="text-xs text-muted-foreground">u/{post.author_anonymous}</span>
            </div>
            <h4 className="font-semibold text-sm">{post.title}</h4>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground shrink-0">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{post.score}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-3 pt-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowComments(!showComments)}>
            <MessageSquare className="h-3.5 w-3.5" />
            {post.num_comments} comments
            {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          {post.source_url && (
            <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> View on Reddit
            </a>
          )}
        </div>
        {showComments && comments && comments.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 pt-2 border-t">
            {comments.map((c) => (
              <div key={c.id} className="pl-3 border-l-2 border-muted py-1.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-muted-foreground">u/{c.author_anonymous}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{c.score}</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{c.content}</p>
              </div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Supplement Card ─────────────────────────────────────────────────
interface SupplementInfo {
  name: string;
  icon: React.ReactNode;
  why: string;
  dosage: string;
  evidence: "Strong" | "Moderate" | "Emerging";
  t1dNote: string;
  symptoms?: string[];
  highlighted?: boolean;
}

const supplements: SupplementInfo[] = [
  {
    name: "Vitamin D",
    icon: <Sun className="h-5 w-5 text-warning" />,
    why: "T1D patients are 2-3x more likely to be deficient due to autoimmune mechanisms. Deficiency worsens fatigue, depression, and immune function — all of which compound burnout. Critical in winter months when UVB exposure is minimal.",
    dosage: "2,000-5,000 IU daily (Oct-April); test via 25-hydroxyvitamin D blood test; target 40-60 ng/mL",
    evidence: "Strong",
    t1dNote: "No significant insulin interaction. May improve insulin sensitivity at optimal levels. Get levels tested before supplementing — some people need higher doses to correct severe deficiency.",
    symptoms: ["Persistent fatigue/exhaustion", "Muscle weakness or aches", "Bone pain", "Depression or low mood", "Frequent infections/illness", "Slow wound healing", "Hair loss", "Brain fog"],
    highlighted: true,
  },
  {
    name: "Magnesium Glycinate",
    icon: <Moon className="h-5 w-5 text-chart-1" />,
    why: "Reduces anxiety, improves sleep quality, and may improve insulin sensitivity. Up to 75% of adults don't get enough magnesium, and diabetes increases urinary magnesium loss.",
    dosage: "200-400mg before bed (glycinate form preferred for absorption and gentle on stomach)",
    evidence: "Strong",
    t1dNote: "May slightly lower blood sugar — monitor for the first week. Can interact with certain blood pressure medications. Start with 200mg and increase gradually.",
  },
  {
    name: "Omega-3 (EPA/DHA)",
    icon: <Droplet className="h-5 w-5 text-primary" />,
    why: "Anti-inflammatory properties reduce systemic inflammation common in T1D. EPA specifically has been shown to support mood and reduce symptoms of depression.",
    dosage: "1,000-2,000mg combined EPA/DHA daily with food",
    evidence: "Strong",
    t1dNote: "No significant insulin interaction. Choose high-quality fish oil or algae-based supplements. May thin blood slightly — mention to your doctor if on other blood thinners.",
  },
  {
    name: "B-Complex",
    icon: <Zap className="h-5 w-5 text-warning" />,
    why: "Supports energy metabolism, nerve health (important for neuropathy prevention), and stress response. B12 deficiency is common in people taking metformin.",
    dosage: "One B-complex daily with food; or B12 1,000mcg sublingual if specifically deficient",
    evidence: "Moderate",
    t1dNote: "Generally safe with insulin. B vitamins are water-soluble so excess is excreted. Can cause bright yellow urine — this is normal and harmless.",
  },
  {
    name: "Ashwagandha",
    icon: <Leaf className="h-5 w-5 text-success" />,
    why: "An adaptogen shown to reduce cortisol levels by up to 30% in clinical trials. Lower cortisol can mean less stress-induced blood sugar spikes and better sleep.",
    dosage: "300-600mg daily of KSM-66 or Sensoril extract",
    evidence: "Moderate",
    t1dNote: "May lower blood sugar — monitor closely for the first 2 weeks. Not recommended during pregnancy or with thyroid medications. Discuss with your endocrinologist first.",
  },
];

const prescriptionInfo = [
  {
    name: "SSRIs (e.g., Lexapro, Zoloft)",
    description: "First-line treatment for depression and anxiety. May slightly affect blood sugar in the first 2-3 weeks — typically causing lower readings. Monitor more frequently during adjustment.",
    t1dConsideration: "Reduce basal by ~10% for the first 2 weeks if experiencing more lows. Effects stabilize after adjustment period.",
    evidence: "Strong",
  },
  {
    name: "SNRIs (e.g., Cymbalta, Effexor)",
    description: "Effective for both depression/anxiety AND diabetic neuropathy pain. Duloxetine (Cymbalta) is specifically FDA-approved for diabetic nerve pain.",
    t1dConsideration: "Can affect blood sugar — both highs and lows reported. Duloxetine has the added benefit of treating neuropathy symptoms.",
    evidence: "Strong",
  },
  {
    name: "Buspirone",
    description: "Anti-anxiety medication that doesn't cause sedation or dependency. Works well alongside SSRIs for breakthrough anxiety. Takes 2-4 weeks for full effect.",
    t1dConsideration: "Minimal blood sugar impact. Good option for diabetes-specific anxiety (fear of lows, fear of complications) without sedation.",
    evidence: "Moderate",
  },
];

// ─── Main Page ───────────────────────────────────────────────────────
const DiabetesBurnout = () => {
  usePageMeta('Diabetes Burnout', 'Understand and recover from diabetes burnout — community support, self-assessment, and recovery plans.');
  const [postCategory, setPostCategory] = useState("all");
  const { data: posts, isLoading: postsLoading } = useBurnoutPosts(postCategory === "all" ? undefined : postCategory);
  const [seeding, setSeeding] = useState(false);

  // Auto-seed on first load if no posts
  useEffect(() => {
    if (posts && posts.length === 0 && !seeding) {
      setSeeding(true);
      supabase.functions.invoke("seed-burnout-posts").finally(() => setSeeding(false));
    }
  }, [posts, seeding]);

  const categories = ["all", "Taking a Break", "Automation Saved Me", "Therapy That Worked", "Simplifying Management", "CGM Burnout"];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-10">
        {/* Back Navigation */}
        <Link to="/mental-health" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Mental Health Hub
        </Link>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Diabetes Burnout</h1>
              <p className="text-muted-foreground">A practical resource that actually works — because you deserve more than "just try harder"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-muted/50"><CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">36-45%</div>
              <p className="text-xs text-muted-foreground">of T1D adults experience burnout (Diabetes Care, 2016)</p>
            </CardContent></Card>
            <Card className="bg-muted/50"><CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">100+</div>
              <p className="text-xs text-muted-foreground">estimated health decisions T1D patients make daily</p>
            </CardContent></Card>
            <Card className="bg-muted/50"><CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">Treatable</div>
              <p className="text-xs text-muted-foreground">Burnout is not failure — it's a signal to change your approach</p>
            </CardContent></Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm"><strong>What is diabetes burnout?</strong> It's the emotional and physical exhaustion from the relentless, 24/7 demands of managing type 1 diabetes. Unlike general burnout, it includes a unique component: every "break" carries real health risks. This isn't laziness — it's the natural human response to a disease that never takes a day off.</p>
            </CardContent>
          </Card>
        </motion.section>

        {/* ── Signs & Assessment ───────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-warning" /> Recognizing Burnout</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Common Signs</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Skipping blood sugar checks or ignoring CGM",
                  "'Rage bolusing' large corrections out of frustration",
                  "Avoiding or canceling endo appointments",
                  "Feeling resentful every time you have to think about diabetes",
                  "Emotional numbness when seeing your numbers",
                  "Carb counting feels exhausting or impossible",
                  "Withdrawing from diabetes communities or support",
                  "Eating without bolusing because you 'don't care'",
                  "Feeling like a failure despite doing your best",
                  "Physical exhaustion beyond what sleep can fix",
                ].map((sign, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{sign}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <BurnoutQuiz />
          </div>
        </section>

        {/* ── Recovery Plans ───────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> Evidence-Based Recovery Plans</h2>
          <Tabs defaultValue="reset">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="reset" className="text-xs">🔄 2-Week Reset</TabsTrigger>
              <TabsTrigger value="permission" className="text-xs">✅ Permission Plan</TabsTrigger>
              <TabsTrigger value="delegation" className="text-xs">🤖 Delegation Plan</TabsTrigger>
              <TabsTrigger value="social" className="text-xs">💬 Social Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="reset">
              <Card><CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-lg">The 2-Week Reset: Minimal Viable Diabetes</h3>
                <p className="text-sm text-muted-foreground">A structured plan to ease back into management without the pressure of perfection. Created with input from CDEs and psychologists.</p>
                <div className="space-y-3">
                  {[
                    { days: "Days 1-3", title: "Safety Only", tasks: ["Take basal/long-acting insulin", "Keep glucose tabs within reach", "If you feel bad, check blood sugar", "That's it. Nothing else required."] },
                    { days: "Days 4-7", title: "Add One Thing", tasks: ["Continue safety basics", "Add ONE mealtime bolus per day (pick your biggest meal)", "Guess the carbs — don't count precisely", "Wear CGM but hide the app if numbers cause stress"] },
                    { days: "Days 8-10", title: "Gentle Expansion", tasks: ["Bolus for 2 meals", "Glance at CGM once in the morning, once at night", "No corrections unless over 300 mg/dL", "Celebrate what you're doing, not what you're missing"] },
                    { days: "Days 11-14", title: "Gradual Return", tasks: ["Bolus for all meals (still okay to guess)", "Check CGM a few times per day", "Start noting patterns (not logging — just noticing)", "Schedule a follow-up with your endo/CDE"] },
                  ].map((phase, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{phase.days}</Badge>
                        <span className="font-semibold text-sm">{phase.title}</span>
                      </div>
                      <ul className="space-y-1">
                        {phase.tasks.map((t, j) => <li key={j} className="text-sm flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />{t}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="permission">
              <Card><CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-lg">The Permission Plan: "Good Enough" Targets</h3>
                <p className="text-sm text-muted-foreground">Perfectionism is the #1 driver of diabetes burnout. These targets keep you safe without demanding perfection.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { metric: "A1C Target", perfect: "< 6.5%", good: "< 8.0%", note: "Below 8% prevents most acute complications" },
                    { metric: "Time in Range", perfect: "70%+", good: "50%+", note: "Even 50% TIR is meaningfully protective" },
                    { metric: "Checks/Day", perfect: "8-12", good: "2-4", note: "Wake up + bedtime minimum" },
                    { metric: "Carb Counting", perfect: "Precise grams", good: "Estimate (small/medium/large)", note: "Rough estimates still help dosing" },
                    { metric: "Logging", perfect: "Every meal + correction", good: "Optional or none", note: "CGM data exists even if you don't look at it" },
                    { metric: "Exercise Impact", perfect: "Track + adjust insulin", good: "Move if you feel like it", note: "Don't make exercise another diabetes task" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <div className="font-semibold text-sm mb-2">{item.metric}</div>
                      <div className="flex gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">Perfect: {item.perfect}</Badge>
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Good enough: {item.good}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="delegation">
              <Card><CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-lg">The Delegation Plan: Automate the Paper Cuts</h3>
                <p className="text-sm text-muted-foreground">Every decision you remove from the pile reduces burnout. Here's what you can delegate to technology.</p>
                <div className="space-y-3">
                  {[
                    { task: "Basal rate adjustments", solution: "Closed-loop/AID systems (Omnipod 5, Tandem Control-IQ, Loop, iAPS)", impact: "Removes 15-20 daily decisions" },
                    { task: "Correction boluses", solution: "AID auto-corrections handle most highs automatically", impact: "Removes constant 'should I correct?' decisions" },
                    { task: "Supply reordering", solution: "Set up auto-refill with pharmacy; use delivery services like Amazon Subscribe & Save for OTC supplies", impact: "Eliminates supply anxiety" },
                    { task: "Appointment scheduling", solution: "Book recurring endo appointments 3 months out at each visit; set calendar reminders", impact: "Removes scheduling friction" },
                    { task: "Prescription refills", solution: "Enable auto-refill notifications; use apps like GoodRx to price-compare", impact: "Prevents emergency pharmacy trips" },
                    { task: "Common meal boluses", solution: "Pre-program frequent meals in your pump (coffee, lunch, dinner presets)", impact: "Reduces mealtime decisions to one button" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-semibold text-sm">{item.task}</span>
                        <Badge variant="outline" className="text-xs shrink-0">{item.impact}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.solution}</p>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="social">
              <Card><CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-lg">The Social Plan: Communicating About Burnout</h3>
                <p className="text-sm text-muted-foreground">How to explain burnout to the people in your life so they can support you instead of adding pressure.</p>
                <div className="space-y-3">
                  {[
                    { audience: "Partner / Spouse", script: "\"I'm going through diabetes burnout — it's not that I don't care about my health. It's that managing this disease 24/7 has exhausted me. Instead of asking 'did you check your sugar?', could you ask 'how can I help today?'\"", tip: "Agree on a gentle reminder system together." },
                    { audience: "Parents / Family", script: "\"I know you worry about me, but the constant questions about my diabetes add pressure that makes burnout worse. I promise I'm working on it with my care team. What helps most is just spending normal time together.\"", tip: "Share your care plan so they know you have a safety net." },
                    { audience: "Employer / Coworkers", script: "\"I have a medical condition that requires ongoing management. I may occasionally need brief breaks to attend to it. I'm happy to discuss accommodations privately.\"", tip: "You don't owe anyone details about your diabetes management." },
                    { audience: "Friends", script: "\"I'm having a tough time with my health management right now. I might seem off or distracted. It's not about you — I'm working through it. Normal hangouts actually help me feel better.\"", tip: "Friends who eat with you can help by not commenting on your food choices." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">{item.audience}</span>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md mb-2">
                        <p className="text-sm italic">"{item.script}"</p>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3" /> {item.tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* ── Supplements & Prescriptions ──────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Pill className="h-6 w-6 text-success" /> Supplement & Prescription Guidance</h2>
          <p className="text-sm text-muted-foreground">Evidence-based options to support mental health alongside diabetes management. Always discuss with your endocrinologist before starting.</p>

          <div className="space-y-4">
            {supplements.map((s, i) => (
              <Card key={i} className={s.highlighted ? "border-warning border-2 bg-warning/5 dark:bg-warning/5" : ""}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {s.icon}
                      <h3 className="font-bold text-lg">{s.name}</h3>
                      {s.highlighted && <Badge className="bg-warning/10 text-warning border-warning/30">⚠️ Winter Priority</Badge>}
                    </div>
                    <Badge variant={s.evidence === "Strong" ? "default" : "outline"}>
                      {s.evidence} Evidence
                    </Badge>
                  </div>
                  <p className="text-sm">{s.why}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-xs font-medium text-muted-foreground">Dosage</span>
                      <p className="text-sm">{s.dosage}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-xs font-medium text-muted-foreground">T1D Considerations</span>
                      <p className="text-sm">{s.t1dNote}</p>
                    </div>
                  </div>
                  {s.symptoms && (
                    <div className="p-3 rounded-lg bg-warning/5 dark:bg-warning/10 border border-warning/20">
                      <p className="text-xs font-semibold mb-2 text-warning">Deficiency Symptoms to Watch For:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {s.symptoms.map((symptom, j) => (
                          <div key={j} className="flex items-center gap-1.5 text-xs">
                            <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
                            <span>{symptom}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-bold text-lg flex items-center gap-2"><Stethoscope className="h-5 w-5" /> Prescription Options for Anxiety & Depression</h3>
            <p className="text-xs text-muted-foreground">These require a prescription from your doctor or psychiatrist. Listed here for awareness — discuss what's right for you with your care team.</p>
            {prescriptionInfo.map((rx, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{rx.name}</h4>
                    <Badge variant="outline" className="text-xs">{rx.evidence} Evidence</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rx.description}</p>
                  <div className="p-2 rounded bg-primary/5 dark:bg-primary/10 border border-primary/20">
                    <p className="text-xs"><strong>T1D Consideration:</strong> {rx.t1dConsideration}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Community Solutions ──────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary" /> Real Community Solutions</h2>
          <p className="text-sm text-muted-foreground">Real posts from T1D communities with practical solutions that worked for people experiencing burnout.</p>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button key={cat} variant={postCategory === cat ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setPostCategory(cat)}>
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>

          {postsLoading || seeding ? (
            <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="h-40 animate-pulse bg-muted" />)}</div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => <BurnoutPostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <p>Loading community solutions...</p>
            </CardContent></Card>
          )}
        </section>

        {/* ── Daily Tools ─────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Battery className="h-6 w-6 text-success" /> Practical Daily Tools</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-success/30 dark:border-success/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-success" /> Minimum Viable Diabetes (Bad Day Checklist)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  "✅ Take basal/long-acting insulin",
                  "✅ Keep glucose tabs or juice within arm's reach",
                  "✅ Eat something every few hours",
                  "✅ If you feel weird, check blood sugar",
                  "✅ If over 350 or vomiting → ER / call your doctor",
                  "⭐ Everything else is bonus. You're doing enough.",
                ].map((item, i) => (
                  <p key={i} className={`text-sm ${i === 5 ? "font-semibold text-primary pt-2" : ""}`}>{item}</p>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 border-destructive/30 dark:border-destructive/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><HeartPulse className="h-5 w-5 text-destructive" /> Burnout Emergency Kit</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium text-destructive">When you feel overwhelmed RIGHT NOW:</p>
                {[
                  "1. Stop what you're doing. Take 3 deep breaths.",
                  "2. Check: Am I physically safe? (Not in DKA, not severely low)",
                  "3. If safe: Give yourself permission to do bare minimum today.",
                  "4. Text someone who gets it (friend, online community, crisis line).",
                  "5. Set one timer — only think about diabetes at that time.",
                  "6. Do one kind thing for yourself that has nothing to do with diabetes.",
                  "7. Remember: You are more than your numbers.",
                ].map((step, i) => (
                  <p key={i} className="text-sm">{step}</p>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Mental Health Resources ─────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Heart className="h-6 w-6 text-brand-red" /> Mental Health Professional Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <BookOpen className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Find a Diabetes Therapist</h3>
                <p className="text-xs text-muted-foreground">Use Psychology Today's directory and filter by "Chronic Illness" specialty. Ask specifically about diabetes distress experience.</p>
                <a href="https://www.psychologytoday.com/us/therapists" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> Psychology Today Directory
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <Stethoscope className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Telehealth Options</h3>
                <p className="text-xs text-muted-foreground">BetterHelp and Talkspace offer chronic illness specialized therapists. JDRF has a mental health resource page with vetted providers.</p>
                <a href="https://www.jdrf.org/t1d-resources/living-with-t1d/mental-health/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> JDRF Mental Health Resources
                </a>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 dark:border-destructive/20 bg-destructive/5 dark:bg-destructive/5">
              <CardContent className="p-4 space-y-2">
                <Phone className="h-6 w-6 text-destructive mb-2" />
                <h3 className="font-semibold text-sm">Crisis Resources</h3>
                <div className="space-y-1.5">
                  <p className="text-xs"><strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988</p>
                  <p className="text-xs"><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                  <p className="text-xs"><strong>JDRF Peer Support:</strong> <a href="https://www.jdrf.org/t1d-resources/living-with-t1d/peer-support/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Connect with peers</a></p>
                  <p className="text-xs"><strong>Beyond Type 1 App:</strong> <a href="https://beyondtype1.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Community support</a></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Disclaimer ──────────────────────────────────────── */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This page provides general health information and is not a substitute for professional medical advice. Supplement and medication information is for educational purposes only. Always consult your endocrinologist, primary care physician, or mental health provider before starting any new supplement or medication. If you are in crisis, please contact 988 (Suicide & Crisis Lifeline) or go to your nearest emergency room.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DiabetesBurnout;
