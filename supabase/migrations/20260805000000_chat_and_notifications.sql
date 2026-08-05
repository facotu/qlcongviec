-- ====================================================================
-- SUPABASE POSTGRESQL MIGRATION: Chat Channels, Messages & Notifications
-- Bitrix24 Style Messenger System & Realtime Activity Notifications
-- ====================================================================

-- 1. Create Table: chat_channels
CREATE TABLE IF NOT EXISTS public.chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('bot', 'news', 'general', 'notes', 'task', 'direct')) DEFAULT 'general' NOT NULL,
    avatar_url TEXT,
    description TEXT,
    unread_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create Table: chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES public.chat_channels(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    is_ai BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Create Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('task', 'timer', 'rag', 'system', 'message')) DEFAULT 'system' NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Allow public read chat_channels" ON public.chat_channels FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_channels" ON public.chat_channels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update chat_channels" ON public.chat_channels FOR UPDATE USING (true);

CREATE POLICY "Allow public read chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public update notifications" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "Allow public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
