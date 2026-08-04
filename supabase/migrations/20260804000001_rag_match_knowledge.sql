-- ====================================================================
-- SUPABASE POSTGRESQL RAG RPC MIGRATION
-- Function: match_knowledge (Cosine Similarity + filter_tag_id)
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
