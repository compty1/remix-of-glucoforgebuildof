import Layout from "@/components/Layout";
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  Target, 
  Telescope, 
  Eye, 
  Users, 
  Zap, 
  Lightbulb, 
  Shield,
  ArrowRight,
  Heart,
  Hammer,
  HandHeart
} from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Eye,
    title: "Transparency",
    description: "Open data, open dialogue. We believe in sharing knowledge freely and making our processes visible to those we serve."
  },
  {
    icon: Users,
    title: "Inclusion",
    description: "Global, multilingual, and culturally sensitive. Everyone belongs here, regardless of where they live or how they manage their diabetes."
  },
  {
    icon: Zap,
    title: "Action",
    description: "Rapid response over red tape. We move quickly to solve real problems because we know every moment matters."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Patient-led solutions designed for real-life use. The best ideas come from those living with the condition every day."
  },
  {
    icon: Shield,
    title: "Accountability",
    description: "We hold ourselves and our partners to the highest standards. Trust is earned through consistent, ethical action."
  }
];

export default function About() {
  usePageMeta('About', 'Learn about GlucoForge — our mission, values, and the open T1D intelligence platform we\'re building together.');
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/80 text-primary-foreground">
              <Flame className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Forged from Lived Experience
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            GlucoForge was born from the frustration of device failures at 3 AM, the isolation of managing a chronic condition, and the gap between cutting-edge research and the realities of daily life. We're building more than a platform — we're creating a movement.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To empower people living with Type 1 diabetes by creating innovative tools, connecting communities, and translating research into practical solutions that work in the real world.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Every feature we build, every connection we facilitate, and every piece of research we surface is designed with one goal: to make daily diabetes management less burdensome so you can focus on living your life.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Telescope className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A world where every person with Type 1 diabetes has instant access to peer support, real-time device solutions, and actionable research insights.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We envision a future where diagnosis doesn't mean isolation, where device issues are solved in minutes not hours, and where the collective wisdom of millions is just a tap away.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why We Started Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-muted/50 to-muted border-0">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Why We Started</h2>
              <div className="max-w-4xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Every breakthrough in diabetes technology should make life easier, not more complicated. Yet too often, we find ourselves managing our management tools instead of living our lives.
                </p>
                <p>
                  GlucoForge emerged from countless 3 AM troubleshooting sessions, from the frustration of watching promising research sit locked away in academic papers, and from the recognition that the Type 1 diabetes community has solutions that never make it beyond individual conversations.
                </p>
                <p>
                  We've all been there: a sensor fails during an important meeting, an algorithm behaves unexpectedly during exercise, or a new study promises hope but the implications remain unclear. These moments of isolation and frustration sparked a question: What if we could harness the collective experience of millions of people navigating the same challenges?
                </p>
                <p className="font-medium text-foreground">
                  We believe that the people living with this condition every day are the real experts. Our platform amplifies that expertise, connects those insights with cutting-edge research, and transforms individual struggles into collective solutions.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're contributing code, sharing your expertise, or supporting our mission, your involvement directly impacts the lives of people managing Type 1 diabetes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/get-involved">
                <HandHeart className="h-5 w-5" />
                Get Involved
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/build-with-us">
                <Hammer className="h-5 w-5" />
                Build With Us
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="gap-2">
              <Link to="/donate">
                <Heart className="h-5 w-5" />
                Support Our Mission
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
