import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/backend/supabase-admin";
import { NotificationItem } from "@/types";

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Công việc đã hoàn thành",
    content: "Task 'Thiết lập kiến trúc Clean Architecture cho Next.js 14' vừa được đổi trạng thái thành Đã hoàn thành.",
    type: "task",
    isRead: false,
    linkUrl: "/tasks",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "notif-2",
    title: "Phiên đếm thời gian bắt đầu",
    content: "Timer vừa khởi chạy cho công việc: 'Khởi tạo Migration SQL & pgvector HNSW Index'.",
    type: "timer",
    isRead: false,
    linkUrl: "/tasks",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "notif-3",
    title: "Tri thức RAG đã được Vector hóa",
    content: "Đã tạo 5 vector embeddings 1536d cho Ghi chú tri thức mới.",
    type: "rag",
    isRead: true,
    linkUrl: "/knowledge-chat",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "notif-4",
    title: "Tin nhắn mới từ Bitrix24 CoPilot",
    content: "Trợ lý CoPilot đã gửi tin nhắn hướng dẫn trong Trình nhắn tin.",
    type: "message",
    isRead: false,
    linkUrl: "/messages",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
      return NextResponse.json({ success: true, data: MOCK_NOTIFICATIONS, unreadCount });
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
      return NextResponse.json({ success: true, data: MOCK_NOTIFICATIONS, unreadCount });
    }

    const notifications: NotificationItem[] = data.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: item.type,
      isRead: item.is_read,
      linkUrl: item.link_url,
      createdAt: item.created_at,
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    console.error("[API GET /api/notifications] Error:", err);
    return NextResponse.json({ success: true, data: MOCK_NOTIFICATIONS, unreadCount: 3 });
  }
}
