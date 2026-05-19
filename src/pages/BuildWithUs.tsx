import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DevelopmentProjectCard } from "@/components/build-with-us/DevelopmentProjectCard";
import { developmentProjects, DevelopmentProject } from "@/data/developmentProjects";
import { 
import { usePageMeta } from '@/hooks/usePageMeta';
  Code2, 
  Cpu, 
  Wrench, 
  Users, 
  Search, 
  Rocket, 
  ChevronDown 
} from "lucide-react";

const categories = [
  { value: "all", label: "All", icon: Code2 },
  { value: "AI Intelligence", label: "AI Intelligence", icon: Cpu },
  { value: "User Tools", label: "User Tools", icon: Wrench },
  { value: "Device/Goals Management", label: "Device/Goals Management", icon: Wrench },
  { value: "Community Support", label: "Community Support", icon: Users },
] as const;

const steps = [
  {
    number: 1,
    title: "Pick a Project",
    description: "Browse by pillar or search for projects that match your skills and interests.",
    icon: Search,
  },
  {
    number: 2,
    title: "Claim & Build",
    description: "Claim the whole project or individual tasks. Get starter files and resources instantly.",
    icon: Wrench,
  },
  {
    number: 3,
    title: "Ship & Impact",
    description: "Submit your work, receive feedback, and see your contribution make a real difference.",
    icon: Rocket,
  },
];

export default function BuildWithUs() {
  usePageMeta("Build With Us", "Partner with GlucoForge to co-create open T1D tools, research, and community programs.");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProjects = activeCategory === "all" 
    ? developmentProjects 
    : developmentProjects.filter(p => p.category === activeCategory);

  const scrollToProjects = () => {
    document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Build With Us
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Choose a project that speaks to your skills and passion. Build the whole thing, or pick a specific component. Every contribution moves us closer to eliminating daily stress for millions living with Type 1 diabetes.
            </p>
            <Button 
              size="lg" 
              onClick={scrollToProjects}
              className="gap-2"
            >
              Explore Projects
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects-section" className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Development Projects
            </h2>

            <Tabs 
              value={activeCategory} 
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <div className="flex justify-center mb-8">
                <TabsList className="flex-wrap h-auto gap-1 p-1">
                  {categories.map((cat) => (
                    <TabsTrigger 
                      key={cat.value} 
                      value={cat.value}
                      className="text-sm px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <cat.icon className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeCategory} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <DevelopmentProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No projects found in this category.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="relative mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
