-- ====================================================================
-- SUPABASE POSTGRESQL FULL SCHEMA & RLS POLICIES SCRIPT
-- Copy and paste this script directly into the Supabase SQL Editor Web Dashboard
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Create Table: groups
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Create Table: tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_tags_name_group_id UNIQUE (name, group_id)
);

-- 4. Create Table: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo' NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    notion_content JSONB DEFAULT '{}'::jsonb,
    is_knowledge_note BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Create Table: task_tags (Junction Table for Many-to-Many)
CREATE TABLE IF NOT EXISTS public.task_tags (
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- 6. Create Table: time_trackings
CREATE TABLE IF NOT EXISTS public.time_trackings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Create Table: vector_embeddings (RAG Knowledge & Search)
CREATE TABLE IF NOT EXISTS public.vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. Create Table: chat_channels (Bitrix24 Messenger)
CREATE TABLE IF NOT EXISTS public.chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('bot', 'news', 'general', 'notes', 'task', 'direct')) DEFAULT 'general' NOT NULL,
    avatar_url TEXT,
    description TEXT,
    unread_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. Create Table: chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES public.chat_channels(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    is_ai BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. Create Table: notifications (Realtime Activity System)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('task', 'timer', 'rag', 'system', 'message')) DEFAULT 'system' NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- INDEXES OPTIMIZATION
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_tags_group_id ON public.tags(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON public.tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_knowledge_note ON public.tasks(is_knowledge_note);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON public.task_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_time_trackings_task_id ON public.time_trackings(task_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_task_id ON public.vector_embeddings(task_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_tag_id ON public.vector_embeddings(tag_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON public.chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Vector Search Index (HNSW for Cosine Distance)
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_hnsw 
ON public.vector_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- ====================================================================
-- RAG RPC SIMILARITY SEARCH FUNCTION WITH TAG FILTERING
-- ====================================================================
CREATE OR REPLACE FUNCTION public.match_knowledge (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 5,
  filter_tag_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  task_id UUID,
  tag_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    ve.id,
    ve.task_id,
    ve.tag_id,
    ve.content,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM public.vector_embeddings ve
  WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
    AND (filter_tag_id IS NULL OR ve.tag_id = filter_tag_id)
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_trackings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to groups') THEN
        CREATE POLICY "Allow public read access to groups" ON public.groups FOR SELECT USING (true);
        CREATE POLICY "Allow public insert access to groups" ON public.groups FOR INSERT WITH CHECK (true);
        CREATE POLICY "Allow public update access to groups" ON public.groups FOR UPDATE USING (true);
        CREATE POLICY "Allow public delete access to groups" ON public.groups FOR DELETE USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to tags') THEN
        CREATE POLICY "Allow public read access to tags" ON public.tags FOR SELECT USING (true);
        CREATE POLICY "Allow public insert access to tags" ON public.tags FOR INSERT WITH CHECK (true);
        CREATE POLICY "Allow public update access to tags" ON public.tags FOR UPDATE USING (true);
        CREATE POLICY "Allow public delete access to tags" ON public.tags FOR DELETE USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to tasks') THEN
        CREATE POLICY "Allow public read access to tasks" ON public.tasks FOR SELECT USING (true);
        CREATE POLICY "Allow public insert access to tasks" ON public.tasks FOR INSERT WITH CHECK (true);
        CREATE POLICY "Allow public update access to tasks" ON public.tasks FOR UPDATE USING (true);
        CREATE POLICY "Allow public delete access to tasks" ON public.tasks FOR DELETE USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read chat_channels') THEN
        CREATE POLICY "Allow public read chat_channels" ON public.chat_channels FOR SELECT USING (true);
        CREATE POLICY "Allow public insert chat_channels" ON public.chat_channels FOR INSERT WITH CHECK (true);
        CREATE POLICY "Allow public update chat_channels" ON public.chat_channels FOR UPDATE USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read chat_messages') THEN
        CREATE POLICY "Allow public read chat_messages" ON public.chat_messages FOR SELECT USING (true);
        CREATE POLICY "Allow public insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read notifications') THEN
        CREATE POLICY "Allow public read notifications" ON public.notifications FOR SELECT USING (true);
        CREATE POLICY "Allow public update notifications" ON public.notifications FOR UPDATE USING (true);
        CREATE POLICY "Allow public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
    END IF;
END $$;
