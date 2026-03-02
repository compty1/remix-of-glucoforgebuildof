/**
 * Wave 5.4: Query Key Factory
 * Prevents React Query cache collisions from simple keys like ['posts'].
 * All query keys should be created through this factory.
 */

export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    list: (filters?: Record<string, unknown>) => ['posts', 'list', filters] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
    comments: (postId: string) => ['posts', 'comments', postId] as const,
  },
  devices: {
    all: ['devices'] as const,
    list: (filters?: Record<string, unknown>) => ['devices', 'list', filters] as const,
    detail: (id: string) => ['devices', 'detail', id] as const,
    reviews: (deviceId: string) => ['devices', 'reviews', deviceId] as const,
    issues: (deviceId: string) => ['devices', 'issues', deviceId] as const,
  },
  medications: {
    all: ['medications'] as const,
    list: (filters?: Record<string, unknown>) => ['medications', 'list', filters] as const,
    detail: (id: string) => ['medications', 'detail', id] as const,
    reviews: (medicationId: string) => ['medications', 'reviews', medicationId] as const,
  },
  articles: {
    all: ['articles'] as const,
    list: (filters?: Record<string, unknown>) => ['articles', 'list', filters] as const,
    detail: (slug: string) => ['articles', 'detail', slug] as const,
  },
  glucose: {
    all: ['glucose'] as const,
    uploads: (userId: string) => ['glucose', 'uploads', userId] as const,
    analysis: (uploadId: string) => ['glucose', 'analysis', uploadId] as const,
    publicData: (filters?: Record<string, unknown>) => ['glucose', 'public', filters] as const,
  },
  chat: {
    sessions: (userId: string) => ['chat', 'sessions', userId] as const,
    session: (sessionId: string) => ['chat', 'session', sessionId] as const,
  },
  user: {
    profile: (userId: string) => ['user', 'profile', userId] as const,
    streaks: (userId: string) => ['user', 'streaks', userId] as const,
    notifications: (userId: string) => ['user', 'notifications', userId] as const,
    savedIssues: (userId: string) => ['user', 'savedIssues', userId] as const,
  },
  admin: {
    users: (filters?: Record<string, unknown>) => ['admin', 'users', filters] as const,
    settings: (category?: string) => ['admin', 'settings', category] as const,
    analytics: (type: string) => ['admin', 'analytics', type] as const,
  },
  research: {
    trials: (filters?: Record<string, unknown>) => ['research', 'trials', filters] as const,
    trial: (id: string) => ['research', 'trial', id] as const,
    therapies: (filters?: Record<string, unknown>) => ['research', 'therapies', filters] as const,
  },
  shop: {
    products: (filters?: Record<string, unknown>) => ['shop', 'products', filters] as const,
    orders: (userId: string) => ['shop', 'orders', userId] as const,
  },
  community: {
    connections: (userId: string) => ['community', 'connections', userId] as const,
    challenges: () => ['community', 'challenges'] as const,
  },
} as const;
