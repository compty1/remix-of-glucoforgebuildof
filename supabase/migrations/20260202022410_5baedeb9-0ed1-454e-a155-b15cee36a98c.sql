-- Fix community_comments - update policy to be more explicit
-- Since there's no user_id, we validate that required fields are present
DROP POLICY IF EXISTS "Authenticated users can add comments" ON public.community_comments;

-- Authenticated users can add comments with valid content and post reference
CREATE POLICY "Authenticated users can add comments"
ON public.community_comments
FOR INSERT
TO authenticated
WITH CHECK (
  content IS NOT NULL 
  AND content <> ''
  AND post_id IS NOT NULL
);