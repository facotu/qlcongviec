-- ====================================================================
-- SUPABASE POSTGRESQL ROW LEVEL SECURITY (RLS) POLICIES
-- Project: QLCongViec Full-Stack
-- ====================================================================

-- 1. Enable Row Level Security on all public tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_trackings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_embeddings ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for Table: groups
CREATE POLICY "Allow public read access to groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to groups" ON public.groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to groups" ON public.groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to groups" ON public.groups FOR DELETE USING (true);

-- 3. RLS Policies for Table: tags
CREATE POLICY "Allow public read access to tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to tags" ON public.tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to tags" ON public.tags FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to tags" ON public.tags FOR DELETE USING (true);

-- 4. RLS Policies for Table: tasks
CREATE POLICY "Allow public read access to tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to tasks" ON public.tasks FOR DELETE USING (true);

-- 5. RLS Policies for Table: task_tags
CREATE POLICY "Allow public read access to task_tags" ON public.task_tags FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to task_tags" ON public.task_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to task_tags" ON public.task_tags FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to task_tags" ON public.task_tags FOR DELETE USING (true);

-- 6. RLS Policies for Table: time_trackings
CREATE POLICY "Allow public read access to time_trackings" ON public.time_trackings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to time_trackings" ON public.time_trackings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to time_trackings" ON public.time_trackings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to time_trackings" ON public.time_trackings FOR DELETE USING (true);

-- 7. RLS Policies for Table: vector_embeddings
CREATE POLICY "Allow public read access to vector_embeddings" ON public.vector_embeddings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to vector_embeddings" ON public.vector_embeddings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to vector_embeddings" ON public.vector_embeddings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to vector_embeddings" ON public.vector_embeddings FOR DELETE USING (true);
