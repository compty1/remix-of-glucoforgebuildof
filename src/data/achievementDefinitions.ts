// Achievement definitions for the gamification system

export interface AchievementDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  trigger: string;
  category: 'data' | 'community' | 'research' | 'engagement';
  target: number;
  points: number;
}

export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  // Data Achievements
  first_upload: {
    id: 'first_upload',
    name: 'First Upload',
    icon: '📤',
    description: 'Upload your first CGM data file',
    trigger: 'Upload first CGM data file',
    category: 'data',
    target: 1,
    points: 10,
  },
  data_pioneer: {
    id: 'data_pioneer',
    name: 'Data Pioneer',
    icon: '📊',
    description: '30 consecutive days of data uploads',
    trigger: '30 consecutive days of data',
    category: 'data',
    target: 30,
    points: 100,
  },
  data_scientist: {
    id: 'data_scientist',
    name: 'Data Scientist',
    icon: '🔬',
    description: 'Analyze 10 glucose reports',
    trigger: 'Analyze 10 glucose reports',
    category: 'data',
    target: 10,
    points: 50,
  },
  pattern_hunter: {
    id: 'pattern_hunter',
    name: 'Pattern Hunter',
    icon: '🎯',
    description: 'Save 5 named glucose patterns',
    trigger: 'Save 5 glucose patterns',
    category: 'data',
    target: 5,
    points: 40,
  },

  // Community Achievements
  community_champion: {
    id: 'community_champion',
    name: 'Community Champion',
    icon: '🏆',
    description: 'Post 10 helpful comments in the community',
    trigger: 'Post 10 helpful comments',
    category: 'community',
    target: 10,
    points: 75,
  },
  warrior_storyteller: {
    id: 'warrior_storyteller',
    name: 'Warrior Storyteller',
    icon: '📖',
    description: 'Share your T1D story with the community',
    trigger: 'Share your T1D story',
    category: 'community',
    target: 1,
    points: 50,
  },
  community_helper: {
    id: 'community_helper',
    name: 'Community Helper',
    icon: '🤝',
    description: 'Share 3 tips or solutions',
    trigger: 'Share 3 tips or solutions',
    category: 'community',
    target: 3,
    points: 30,
  },
  welcome_committee: {
    id: 'welcome_committee',
    name: 'Welcome Committee',
    icon: '👋',
    description: 'Welcome 5 new community members',
    trigger: 'Welcome 5 new members',
    category: 'community',
    target: 5,
    points: 40,
  },
  discussion_starter: {
    id: 'discussion_starter',
    name: 'Discussion Starter',
    icon: '💬',
    description: 'Start 5 community discussions',
    trigger: 'Start 5 discussions',
    category: 'community',
    target: 5,
    points: 35,
  },

  // Research Achievements
  research_contributor: {
    id: 'research_contributor',
    name: 'Research Contributor',
    icon: '🔬',
    description: 'Complete 5 research surveys',
    trigger: 'Complete 5 surveys',
    category: 'research',
    target: 5,
    points: 60,
  },
  knowledge_seeker: {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    icon: '📚',
    description: 'Read 25 research articles',
    trigger: 'Read 25 articles',
    category: 'research',
    target: 25,
    points: 80,
  },
  trial_explorer: {
    id: 'trial_explorer',
    name: 'Trial Explorer',
    icon: '🧪',
    description: 'Explore 10 clinical trials',
    trigger: 'Explore 10 clinical trials',
    category: 'research',
    target: 10,
    points: 45,
  },
  cure_tracker: {
    id: 'cure_tracker',
    name: 'Cure Tracker',
    icon: '🎯',
    description: 'Follow 5 cure therapy developments',
    trigger: 'Follow 5 cure therapies',
    category: 'research',
    target: 5,
    points: 40,
  },

  // Engagement Achievements
  early_adopter: {
    id: 'early_adopter',
    name: 'Early Adopter',
    icon: '🌟',
    description: 'One of the first 1000 users',
    trigger: 'Join as early adopter',
    category: 'engagement',
    target: 1,
    points: 100,
  },
  device_expert: {
    id: 'device_expert',
    name: 'Device Expert',
    icon: '📱',
    description: 'Review 3 different devices',
    trigger: 'Review 3 devices',
    category: 'engagement',
    target: 3,
    points: 45,
  },
  medication_reviewer: {
    id: 'medication_reviewer',
    name: 'Medication Reviewer',
    icon: '💊',
    description: 'Review 3 different medications',
    trigger: 'Review 3 medications',
    category: 'engagement',
    target: 3,
    points: 45,
  },
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    icon: '🧭',
    description: 'Visit 15 different sections of the platform',
    trigger: 'Visit 15 different sections',
    category: 'engagement',
    target: 15,
    points: 30,
  },
  consistent_visitor: {
    id: 'consistent_visitor',
    name: 'Consistent Visitor',
    icon: '📅',
    description: 'Visit the platform 7 days in a row',
    trigger: '7-day visit streak',
    category: 'engagement',
    target: 7,
    points: 35,
  },
  bookworm: {
    id: 'bookworm',
    name: 'Bookworm',
    icon: '🔖',
    description: 'Bookmark 20 items',
    trigger: 'Bookmark 20 items',
    category: 'engagement',
    target: 20,
    points: 25,
  },
};

export const ACHIEVEMENT_CATEGORIES = {
  data: { name: 'Data & Analytics', icon: '📊', color: 'bg-blue-500' },
  community: { name: 'Community', icon: '👥', color: 'bg-green-500' },
  research: { name: 'Research', icon: '🔬', color: 'bg-purple-500' },
  engagement: { name: 'Engagement', icon: '⭐', color: 'bg-amber-500' },
};

export const getAchievementsByCategory = (category: string): AchievementDefinition[] => {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
};

export const getTotalPoints = (completedAchievements: string[]): number => {
  return completedAchievements.reduce((total, id) => {
    const achievement = ACHIEVEMENTS[id];
    return total + (achievement?.points || 0);
  }, 0);
};
