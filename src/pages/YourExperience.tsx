import React from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import { Droplet, Heart, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { GoodBadJars } from '@/components/experience/GoodBadJars';
import { DailyTasksJar } from '@/components/experience/DailyTasksJar';
import { FearsCloud } from '@/components/experience/FearsCloud';
import { EmbarrassingLowsJar } from '@/components/experience/EmbarrassingLowsJar';
import { SubmissionForm } from '@/components/experience/SubmissionForm';
import { InlineSubmissionForm } from '@/components/experience/InlineSubmissionForm';
import { useExperienceCounts } from '@/hooks/useExperienceSubmissions';

export default function YourExperience() {
  usePageMeta('Your Experience', 'Share your T1D experiences — the good, bad, daily tasks, fears, and embarrassing lows.');
  const { data: counts } = useExperienceCounts();
  
  const totalSubmissions = counts 
    ? Object.values(counts).reduce((a, b) => a + b, 0) 
    : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-brand-red/80 via-brand-purple-dark to-brand-purple-light overflow-hidden">
          <div className="absolute inset-0">
            {/* Animated Blood Drops Background */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                }}
                animate={{
                  y: ['0vh', '120vh'],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: 'linear',
                }}
              >
                <Droplet className="h-6 w-6 text-white/20 fill-white/10" />
              </motion.div>
            ))}
          </div>
          
          <div className="container mx-auto px-4 py-16 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center text-white"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Droplet className="h-10 w-10 fill-white/80" />
                </motion.div>
                <h1 className="heading-hero">Your Experience</h1>
              </div>
              <p className="text-xl opacity-90 mb-6">
                Share your T1D journey—the good, the bad, the daily grind, and the fears. 
                Every drop of experience helps others feel less alone.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Users className="h-3 w-3 mr-1" />
                  {totalSubmissions} experiences shared
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Heart className="h-3 w-3 mr-1" />
                  100% Anonymous
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Submission Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <SubmissionForm />
          </div>

          {/* Experience Jars Grid */}
          <div className="space-y-8">
            {/* Good vs Bad Jars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GoodBadJars />
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <InlineSubmissionForm category="good" />
                <InlineSubmissionForm category="bad" />
              </div>
            </motion.div>

            {/* Daily Tasks - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DailyTasksJar />
              <div className="mt-4">
                <InlineSubmissionForm category="daily_tasks" />
              </div>
            </motion.div>

            {/* Fears Cloud - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FearsCloud />
              <div className="mt-4">
                <InlineSubmissionForm category="fears" />
              </div>
            </motion.div>

            {/* Embarrassing Lows */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <EmbarrassingLowsJar />
              <div className="mt-4">
                <InlineSubmissionForm category="embarrassing_lows" />
              </div>
            </motion.div>
          </div>

          {/* Community Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-r from-brand-purple-dark/5 via-brand-teal/5 to-brand-red/5 rounded-2xl p-8 border">
              <Droplet className="h-12 w-12 mx-auto mb-4 text-brand-red" />
              <h2 className="text-2xl font-bold mb-3">Every Drop Matters</h2>
              <p className="text-muted-foreground">
                Your experiences—whether triumphant or challenging—help build a community 
                where no one walks the T1D journey alone. Thank you for sharing your story.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
