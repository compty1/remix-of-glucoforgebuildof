import { 
  Code, 
  Database, 
  Brain, 
  Palette, 
  Server, 
  FileText,
  ClipboardList,
  Users,
  Stethoscope,
  DollarSign,
  LucideIcon
} from 'lucide-react';

export interface TechnicalRole {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  skills: string[];
  tasks: string[];
  openProjects?: string[];
}

export interface VolunteerRole {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const technicalRoles: TechnicalRole[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Build user interfaces with React and TypeScript',
    icon: Code,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Responsive Design', 'Accessibility'],
    tasks: [
      'Implement UI components and data visualizations',
      'Build interactive glucose charts and dashboards',
      'Improve accessibility and mobile responsiveness',
      'Create reusable component libraries'
    ],
    openProjects: ['CGM Data Visualization', 'Photo-Based Carb Estimator']
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Build APIs and data infrastructure',
    icon: Database,
    skills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Supabase', 'Edge Functions'],
    tasks: [
      'Design and implement database schemas',
      'Build secure API endpoints',
      'Integrate with external data sources',
      'Optimize query performance'
    ],
    openProjects: ['CGM Data Integration API', 'Insulin Dose Calculator API']
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Analyze patterns and build AI models',
    icon: Brain,
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow/PyTorch', 'Statistics'],
    tasks: [
      'Build predictive models for glucose trends',
      'Analyze community data for insights',
      'Develop anomaly detection algorithms',
      'Create personalized recommendation systems'
    ],
    openProjects: ['Exercise Impact Prediction Model', 'Glycemic Volatility Index']
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Designer',
    description: 'Design beautiful, accessible experiences',
    icon: Palette,
    skills: ['Figma', 'User Research', 'Accessibility', 'Design Systems', 'Prototyping'],
    tasks: [
      'Design intuitive user interfaces',
      'Conduct user research and testing',
      'Create and maintain design systems',
      'Ensure WCAG accessibility compliance'
    ],
    openProjects: ['Interactive Diabetes Education Platform', 'Pump & Pocket Wearable Guide']
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    description: 'Build infrastructure and deployment pipelines',
    icon: Server,
    skills: ['CI/CD', 'Docker', 'Cloud Platforms', 'Monitoring', 'Security'],
    tasks: [
      'Set up automated testing and deployment',
      'Monitor application performance',
      'Implement security best practices',
      'Manage cloud infrastructure'
    ],
    openProjects: ['Open Source CGM Firmware', 'Lost Devices Protocol']
  },
  {
    id: 'technical-writer',
    title: 'Technical Writer',
    description: 'Document features and create guides',
    icon: FileText,
    skills: ['Technical Writing', 'Documentation', 'Markdown', 'API Documentation', 'Tutorials'],
    tasks: [
      'Write user guides and tutorials',
      'Document API endpoints',
      'Create onboarding materials',
      'Maintain knowledge base articles'
    ],
    openProjects: ['School Accommodation Toolkit', 'Pump & Pocket Wearable Guide']
  }
];

export const volunteerRoles: VolunteerRole[] = [
  {
    id: 'project-manager',
    title: 'Project Manager',
    description: 'Coordinate development efforts and keep projects on track.',
    icon: ClipboardList
  },
  {
    id: 'community-manager',
    title: 'Community Manager',
    description: 'Foster safe, supportive online spaces for our community.',
    icon: Users
  },
  {
    id: 'clinical-liaison',
    title: 'Clinical Liaison',
    description: 'Bridge communication between developers and healthcare providers.',
    icon: Stethoscope
  },
  {
    id: 'fundraising-lead',
    title: 'Fundraising Lead',
    description: 'Help secure funding through grants and partnerships.',
    icon: DollarSign
  }
];

export const allRoles = [
  ...technicalRoles.map(r => ({ id: r.id, title: r.title })),
  ...volunteerRoles.map(r => ({ id: r.id, title: r.title }))
];

export const impactLevels = [
  { amount: 25, description: 'Cover hosting costs for one day' },
  { amount: 150, description: 'Enable a week of backend infrastructure' },
  { amount: 450, description: 'Sponsor a month of community programs' },
  { amount: 890, description: 'Fund a major feature development' },
  { amount: 2500, description: 'Support a full research initiative' }
];
