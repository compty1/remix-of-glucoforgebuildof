import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BurnoutPost {
  id: string;
  title: string;
  content: string | null;
  author_anonymous: string | null;
  score: number | null;
  num_comments: number | null;
  source: string;
  source_url: string | null;
  burnout_category: string | null;
  topic_tags: string[] | null;
  sentiment: string | null;
  published_at: string | null;
  created_at: string;
}

export interface BurnoutComment {
  id: string;
  post_id: string;
  content: string;
  author_anonymous: string | null;
  score: number | null;
  parent_comment_id: string | null;
  created_at: string;
}

export function useBurnoutPosts(category?: string) {
  return useQuery({
    queryKey: ["burnout-posts", category],
    queryFn: async () => {
      let query = supabase
        .from("burnout_community_posts")
        .select("*")
        .order("score", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("burnout_category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as BurnoutPost[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBurnoutComments(postId: string | null) {
  return useQuery({
    queryKey: ["burnout-comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("burnout_comments")
        .select("*")
        .eq("post_id", postId)
        .order("score", { ascending: false });

      if (error) throw error;
      return (data || []) as BurnoutComment[];
    },
    enabled: !!postId,
    staleTime: 10 * 60 * 1000,
  });
}
