-- Add context columns to chat_sessions for device/project-specific chats
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS context_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS context_id UUID,
ADD COLUMN IF NOT EXISTS context_name TEXT,
ADD COLUMN IF NOT EXISTS suggested_questions JSONB DEFAULT '[]';

-- Create index for efficient filtering by user and context
CREATE INDEX IF NOT EXISTS idx_chat_sessions_context 
ON public.chat_sessions(user_id, context_type, updated_at DESC);

-- Add index for context_id lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_context_id
ON public.chat_sessions(context_id) WHERE context_id IS NOT NULL;