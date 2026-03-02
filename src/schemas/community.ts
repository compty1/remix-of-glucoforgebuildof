/**
 * Phase 19.5: Shared Zod Schemas – Community
 */
import { z } from 'zod';

export const communityPostSchema = z.object({
  title: z.string().min(3).max(500),
  content: z.string().min(10).max(50000),
  topicTags: z.array(z.string().max(50)).max(10).optional(),
  category: z.string().max(100).optional(),
});

export const communityCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(10000),
  parentCommentId: z.string().uuid().optional(),
});

export type CommunityPost = z.infer<typeof communityPostSchema>;
export type CommunityComment = z.infer<typeof communityCommentSchema>;
