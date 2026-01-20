import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TechnicalRoleCard } from '@/components/get-involved/TechnicalRoleCard';
import { VolunteerRoleCard } from '@/components/get-involved/VolunteerRoleCard';
import { InterestForm } from '@/components/get-involved/InterestForm';
import { DonationSlider } from '@/components/get-involved/DonationSlider';
import { SocialShareButtons } from '@/components/get-involved/SocialShareButtons';
import { technicalRoles, volunteerRoles } from '@/data/volunteerRoles';
import { 
  Heart, 
  Download, 
  ArrowRight, 
  Search, 
  Wrench, 
  Rocket,
  Shield,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GetInvolved() {
  const howItWorksSteps = [
    {
      number: 1,
      title: 'Pick a Project',
      description: 'Browse by pillar or search for projects that match your skills and interests.',
      icon: Search
    },
    {
      number: 2,
      title: 'Claim & Build',
      description: 'Claim the whole project or individual tasks. Get starter files and resources instantly.',
      icon: Wrench
    },
    {
      number: 3,
      title: 'Ship & Impact',
      description: 'Submit your work, receive feedback, and see your contribution make a real difference.',
      icon: Rocket
    }
  ];

  const transparencyItems = [
    'Development infrastructure and hosting',
    'Community testing and feedback programs',
    'Legal and filing fees for nonprofit status'
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get Involved
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Whether you're a developer, designer, healthcare professional, or community advocate — 
            there's a place for you here. Your skills can help millions living with Type 1 diabetes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <a href="#interest-form">
                <Heart className="mr-2 h-5 w-5" />
                Express Interest
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/build-with-us">
                View Development Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Technical Roles Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Technical Roles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Click any role to see required skills, typical tasks, and open projects where you can make an impact.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {technicalRoles.map((role) => (
              <TechnicalRoleCard key={role.id} role={role} />
            ))}
          </div>
        </section>

        {/* Other Volunteer Services Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Other Volunteer Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not a developer? We need help in many areas to keep GlucoForge running smoothly.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {volunteerRoles.map((role) => (
              <VolunteerRoleCard key={role.id} role={role} />
            ))}
          </div>
        </section>

        {/* Interest Form Section */}
        <section id="interest-form" className="mb-16 scroll-mt-20">
          <InterestForm />
        </section>

        {/* Donation and Social Share Section */}
        <section className="mb-16">
          <div className="grid gap-6 lg:grid-cols-2">
            <DonationSlider />
            <SocialShareButtons />
          </div>
        </section>

        {/* For Donors & Partners Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">For Donors & Partners</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              For a detailed overview of our mission, roadmap, and funding needs, please view our comprehensive presentation.
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <Button size="lg" variant="outline" asChild>
              <a href="/presentation.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-5 w-5" />
                Download Our Presentation
              </a>
            </Button>
          </div>

          <Card className="border-border/50 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Our Commitment to Transparency
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    We're actively working toward 501(c)(3) nonprofit status. All donations go directly toward:
                  </p>
                  <ul className="space-y-2">
                    {transparencyItems.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="link" className="p-0 h-auto mt-4" asChild>
                    <Link to="/journey">
                      View Our Roadmap
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">How It Works</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {howItWorksSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="border-border/50 text-center">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                      {step.number}
                    </div>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-xl bg-accent/50">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Every Contribution Matters Section */}
        <section className="text-center">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 md:p-12">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Every Contribution Matters
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                Whether you're contributing code, sharing our mission, or connecting us with potential partners, 
                your involvement directly impacts the lives of people managing Type 1 diabetes. Together, we're 
                not just building a platform — we're building a community that turns individual challenges into 
                collective solutions.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
