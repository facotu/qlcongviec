import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/backend/supabase-admin";
import { ChatChannel } from "@/types";

const MOCK_CHANNELS: ChatChannel[] = [
  {
    id: "chan-support-bot",
    name: "Bitrix24 Support / CoPilot AI",
    type: "bot",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    description: "Trợ lý ảo Bitrix24 CoPilot hỗ trợ giải đáp thắc mắc và tra cứu tri thức RAG.",
    unreadCount: 1,
    latestMessage: "👋 Xin chào! Tôi là trợ lý Bitrix24 CoPilot của bạn. Tôi có thể giúp bạn làm việc hiệu quả hơn!",
    latestTime: "08:18 am",
    createdAt: new Date().toISOString(),
  },
  {
    id: "chan-company-news",
    name: "Tin tức công ty",
    type: "news",
    avatarUrl: "",
    description: "Chia sẻ những thông tin và tin tức quan trọng toàn bộ công ty.",
    unreadCount: 0,
    latestMessage: "Theo dõi để luôn cập nhật về các sự kiện và thông báo mới nhất.",
    latestTime: "08:16 am",
    createdAt: new Date().toISOString(),
  },
  {
    id: "chan-general",
    name: "Trò chuyện chung",
    type: "general",
    avatarUrl: "",
    description: "Sử dụng cuộc trò chuyện chung để giao tiếp, trao đổi ý tưởng và trao đổi kinh nghiệm.",
    unreadCount: 0,
    latestMessage: "Chào mừng cả team đến với không gian làm việc số!",
    latestTime: "08:14 am",
    createdAt: new Date().toISOString(),
  },
  {
    id: "chan-notes",
    name: "Ghi chú",
    type: "notes",
    avatarUrl: "",
    description: "Không gian ghi chú cá nhân - Chỉ hiển thị cho riêng bạn.",
    unreadCount: 0,
    latestMessage: "Danh sách công việc quan trọng cần hoàn thành tuần này...",
    latestTime: "08:14 am",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      return NextResponse.json({ success: true, data: MOCK_CHANNELS });
    }

    const { data, error } = await supabaseAdmin
      .from("chat_channels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: MOCK_CHANNELS });
    }

    const formattedChannels: ChatChannel[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      avatarUrl: item.avatar_url,
      description: item.description,
      unreadCount: item.unread_count || 0,
      createdAt: item.created_at,
    }));

    return NextResponse.json({ success: true, data: formattedChannels });
  } catch (err) {
    console.error("[API GET /api/chat/channels] Error:", err);
    return NextResponse.json({ success: true, data: MOCK_CHANNELS });
  }
}
