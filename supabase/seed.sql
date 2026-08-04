-- ====================================================================
-- SUPABASE SEED DATA SCRIPT
-- Sample data insertion for testing groups, tags, tasks, time trackings & embeddings
-- ====================================================================

-- 1. Seed Groups
INSERT INTO public.groups (id, name, color) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Phát triển Sản phẩm', '#6366f1'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Quản lý Dự án', '#10b981'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Ghi chú & Tri thức', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Tags
INSERT INTO public.tags (id, name, group_id) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Frontend', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Backend', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Sprint 1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Tasks
INSERT INTO public.tasks (id, title, status, group_id, due_date, notion_content, is_knowledge_note) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Thiết lập kiến trúc Clean Architecture cho Next.js 14',
  'done',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  now() + interval '2 days',
  '{"type": "doc", "content": "Tạo thư mục /app, /lib/backend, /lib/frontend, /store, /types"}'::jsonb,
  false
),
(
  '22222222-2222-2222-2222-222222222222',
  'Khởi tạo Migration SQL & pgvector HNSW Index',
  'in_progress',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  now() + interval '5 days',
  '{"type": "doc", "content": "Tạo các bảng groups, tags, tasks, time_trackings, vector_embeddings"}'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Task Tags Junction
INSERT INTO public.task_tags (task_id, tag_id) VALUES
('11111111-1111-1111-1111-111111111111', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'),
('22222222-2222-2222-2222-222222222222', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55')
ON CONFLICT DO NOTHING;

-- 5. Seed Time Trackings
INSERT INTO public.time_trackings (id, task_id, start_at, end_at, duration_seconds) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', now() - interval '2 hours', now() - interval '1 hour', 3600)
ON CONFLICT (id) DO NOTHING;
