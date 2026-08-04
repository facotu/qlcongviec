-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Project: QLCongViec Full-Stack
-- Feature: Core Relational Database + pgvector Search
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

-- ====================================================================
-- INDEXES OPTIMIZATION
-- ====================================================================

-- Foreign Key & Query Optimization B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_tags_group_id ON public.tags(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON public.tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_knowledge_note ON public.tasks(is_knowledge_note);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON public.task_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_time_trackings_task_id ON public.time_trackings(task_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_task_id ON public.vector_embeddings(task_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_tag_id ON public.vector_embeddings(tag_id);

-- Vector Search Index (HNSW - Hierarchical Navigable Small World for Cosine Distance)
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_hnsw 
ON public.vector_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- ====================================================================
-- RAG RPC SIMILARITY SEARCH FUNCTION
-- ====================================================================
CREATE OR REPLACE FUNCTION match_vector_embeddings (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
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
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
$$;
