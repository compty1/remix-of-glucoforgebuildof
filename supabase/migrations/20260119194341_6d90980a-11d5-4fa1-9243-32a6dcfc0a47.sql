-- Create user_saved_posts table for saving favorite community posts
CREATE TABLE public.user_saved_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id text NOT NULL,
  community_post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.user_saved_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user saved posts
CREATE POLICY "Users can view their own saved posts" 
  ON public.user_saved_posts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved posts" 
  ON public.user_saved_posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved posts" 
  ON public.user_saved_posts FOR DELETE 
  USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_user_saved_posts_user_id ON public.user_saved_posts(user_id);
CREATE INDEX idx_user_saved_posts_post_id ON public.user_saved_posts(post_id);