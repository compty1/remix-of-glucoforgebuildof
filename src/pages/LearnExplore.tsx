import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TopicDetailModal } from '@/components/learn/TopicDetailModal';
import { 
  BookOpen, 
  Brain, 
  Heart, 
  Activity, 
  Dumbbell,
  Moon,
  Utensils,
  Droplet,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';

const topicCategories = [
  {
    id: 'biology',
    name: 'Biology & Physiology',
    icon: <Brain className="h-6 w-6" />,
    color: 'from-purple-500 to-indigo-500',
    topics: [
      { title: 'Water & Muscle During High Blood Sugar', description: 'How hyperglycemia causes cellular dehydration and affects muscle performance' },
      { title: 'Electrolyte Dynamics During Lows', description: 'Why sodium, potassium, and magnesium matter when glucose crashes' },
      { title: 'The Dawn Phenomenon Explained', description: 'Hormonal cascades that cause morning glucose spikes' },
      { title: 'Insulin Resistance in T1D', description: 'Yes, it happens - and here\'s why and how to manage it' }
    ]
  },
  {
    id: 'daily-life',
    name: 'Daily Life Management',
    icon: <Activity className="h-6 w-6" />,
    color: 'from-blue-500 to-cyan-500',
    topics: [
      { title: 'Travel with Diabetes', description: 'Time zones, airport security, and keeping supplies safe' },
      { title: 'Sick Day Management', description: 'What actually happens to glucose during illness' },
      { title: 'Weather & Blood Sugar', description: 'Heat, cold, and humidity effects on insulin and glucose' },
      { title: 'Stress Response Patterns', description: 'How cortisol and adrenaline spike your numbers' }
    ]
  },
  {
    id: 'intimacy',
    name: 'Intimacy & Relationships',
    icon: <Heart className="h-6 w-6" />,
    color: 'from-pink-500 to-rose-500',
    topics: [
      { title: 'CGM Placement During Intimacy', description: 'Practical positions and sensor protection tips' },
      { title: 'Blood Sugar During Physical Activity', description: 'Why certain activities cause lows and how to prevent them' },
      { title: 'Pump Management During Intimacy', description: 'Disconnect strategies and timing considerations' },
      { title: 'Communication with Partners', description: 'How to explain T1D needs without awkwardness' }
    ]
  },
  {
    id: 'exercise',
    name: 'Exercise & Sports',
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'from-green-500 to-emerald-500',
    topics: [
      { title: 'Cardio vs Strength Training', description: 'Why they affect blood sugar completely differently' },
      { title: 'Pre-Workout Fueling', description: 'Optimal carb timing and insulin adjustments' },
      { title: 'Post-Exercise Lows', description: 'The delayed drop and how to prevent it' },
      { title: 'Competition Day Strategies', description: 'Adrenaline spikes and peak performance management' }
    ]
  },
  {
    id: 'sleep',
    name: 'Sleep & Recovery',
    icon: <Moon className="h-6 w-6" />,
    color: 'from-indigo-500 to-violet-500',
    topics: [
      { title: 'Overnight Basal Optimization', description: 'Testing and adjusting for stable nighttime glucose' },
      { title: 'Sleep Quality & Control', description: 'Bidirectional relationship between sleep and glucose' },
      { title: 'CGM Alarms Strategy', description: 'Balancing safety with sleep quality' },
      { title: 'Shift Work Challenges', description: 'Managing circadian disruption' }
    ]
  },
  {
    id: 'nutrition',
    name: 'Advanced Nutrition',
    icon: <Utensils className="h-6 w-6" />,
    color: 'from-orange-500 to-amber-500',
    topics: [
      { title: 'Fat & Protein Extended Bolusing', description: 'The pizza problem and how to solve it' },
      { title: 'Fiber\'s Impact on Absorption', description: 'Why some carbs hit slower than others' },
      { title: 'Glycemic Index Realities', description: 'What it gets right and wrong for T1D' },
      { title: 'Alcohol & Blood Sugar', description: 'The delayed low and liver competition' }
    ]
  }
];

interface TopicCardProps {
  topic: { title: string; description: string };
  categoryId: string;
  onClick: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, categoryId, onClick }) => {
  usePageMeta("Learn & Explore", "Curated education resources, articles, and guides for living with Type 1 diabetes.");
  return (
    <div 
      className="p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <h4 className="font-medium mb-1">{topic.title}</h4>
      <p className="text-sm text-muted-foreground">{topic.description}</p>
      <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary">
        Read full article →
      </Button>
    </div>
  );
};

export default function LearnExplore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('biology');
  const [selectedTopic, setSelectedTopic] = useState<{ title: string; description: string; categoryId: string } | null>(null);

  const activeTopics = topicCategories.find(c => c.id === activeCategory);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">
              Learn & Explore
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Deep, practical education on Type 1 diabetes - covering the topics others skip. 
            Real information for real life, not watered-down basics.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="command-center-widget">
            <CardContent className="p-4 text-center">
              <Droplet className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">24+</p>
              <p className="text-xs text-muted-foreground">In-Depth Topics</p>
            </CardContent>
          </Card>
          <Card className="command-center-widget">
            <CardContent className="p-4 text-center">
              <Brain className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">6</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card className="command-center-widget">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">Real</p>
              <p className="text-xs text-muted-foreground">Practical Advice</p>
            </CardContent>
          </Card>
          <Card className="command-center-widget">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">No</p>
              <p className="text-xs text-muted-foreground">Sugar-Coating</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {topicCategories.map(category => (
            <Card 
              key={category.id}
              className={`command-center-widget cursor-pointer transition-all ${
                activeCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-3`}>
                  {category.icon}
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Topics List */}
        {activeTopics && (
          <Card className="command-center-widget">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeTopics.color} flex items-center justify-center text-white`}>
                  {activeTopics.icon}
                </div>
                {activeTopics.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTopics.topics.map((topic, index) => (
                  <TopicCard 
                    key={index} 
                    topic={topic}
                    categoryId={activeTopics.id}
                    onClick={() => setSelectedTopic({ ...topic, categoryId: activeTopics.id })}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Deep Dive */}
        <Card 
          className="command-center-widget mt-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setSelectedTopic({ 
            title: 'Why Water Matters More When You\'re High', 
            description: 'Understanding cellular dehydration during hyperglycemia', 
            categoryId: 'biology' 
          })}
        >
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Droplet className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <Badge className="mb-2">Featured Deep Dive</Badge>
                <h3 className="text-2xl font-bold mb-2">
                  Why Water Matters More When You're High
                </h3>
                <p className="text-muted-foreground mb-4">
                  When blood glucose rises, your body pulls water from cells to dilute 
                  the sugar in your blood. This cellular dehydration affects muscle 
                  performance, cognitive function, and even insulin absorption. 
                  Understanding this mechanism changes how you approach hyperglycemia.
                </p>
                <Button>
                  Read Full Article
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Detail Modal */}
        <TopicDetailModal 
          topic={selectedTopic}
          open={!!selectedTopic}
          onOpenChange={(open) => !open && setSelectedTopic(null)}
        />
      </div>
    </Layout>
  );
}
