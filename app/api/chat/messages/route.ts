import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/backend/supabase-admin";
import { queryKnowledgeBase } from "@/lib/backend/rag";
import { ChatMessage } from "@/types";

const INITIAL_BOT_MESSAGES: Record<string, ChatMessage[]> = {
  "chan-support-bot": [
    {
      id: "msg-bot-1",
      channelId: "chan-support-bot",
      senderName: "Bitrix24 Support / CoPilot",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: "👋 Xin chào! Tôi là trợ lý ảo Bitrix24 CoPilot của bạn. Tôi có thể hỗ trợ bạn tìm kiếm tri thức, hướng dẫn quản lý dự án và tối ưu hóa công việc hàng ngày!",
      isAi: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  "chan-company-news": [
    {
      id: "msg-news-1",
      channelId: "chan-company-news",
      senderName: "Ban Quản Lý",
      content: "📢 Thông báo: Hệ thống QLCôngViệc vừa chính thức nâng cấp tính năng RAG Vector Search & Bitrix24 Messenger!",
      isAi: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  "chan-general": [
    {
      id: "msg-gen-1",
      channelId: "chan-general",
      senderName: "Nguyễn Văn Admin",
      content: "Chào cả nhà! Mọi người thử nghiệm giao diện trò chuyện mới và cho ý kiến nhé.",
      isAi: false,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ],
  "chan-notes": [
    {
      id: "msg-note-1",
      channelId: "chan-notes",
      senderName: "Ghi chú cá nhân",
      content: "📝 Đây là sổ tay cá nhân của bạn. Dùng để nháp ý tưởng, ghi lại liên kết quan trọng hoặc nhiệm vụ cần làm ngay.",
      isAi: false,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
  ],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channel_id") || "chan-support-bot";

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      const mockList = INITIAL_BOT_MESSAGES[channelId] || [];
      return NextResponse.json({ success: true, data: mockList });
    }

    const { data, error } = await supabaseAdmin
      .from("chat_messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      const mockList = INITIAL_BOT_MESSAGES[channelId] || [];
      return NextResponse.json({ success: true, data: mockList });
    }

    const messages: ChatMessage[] = data.map((item) => ({
      id: item.id,
      channelId: item.channel_id,
      senderName: item.sender_name,
      senderAvatar: item.sender_avatar,
      content: item.content,
      isAi: item.is_ai,
      createdAt: item.created_at,
    }));

    return NextResponse.json({ success: true, data: messages });
  } catch (err) {
    console.error("[API GET /api/chat/messages] Error:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channelId, senderName, content, customApiKey, customSystemPrompt } = body;

    if (!channelId || !content || !content.trim()) {
      return NextResponse.json({ error: "channelId và content là bắt buộc" }, { status: 400 });
    }

    const userMessage: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      channelId,
      senderName: senderName || "Người dùng",
      content: content.trim(),
      isAi: false,
      createdAt: new Date().toISOString(),
    };

    let aiMessage: ChatMessage | null = null;

    // If channel is Bot or Support, generate AI response via RAG + LLM Engine!
    if (channelId === "chan-support-bot" || channelId.includes("bot")) {
      const ragResults = await queryKnowledgeBase(content.trim(), null, 0.55, 3);
      const contextText = ragResults.length > 0
        ? ragResults.map((r, i) => `[Trích dẫn ${i + 1}]: "${r.content}"`).join("\n")
        : "";

      const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
      let replyText = "";

      if (apiKey && !apiKey.includes("placeholder") && !apiKey.includes("your-")) {
        try {
          const systemInstruction = customSystemPrompt || "Bạn là Bitrix24 CoPilot AI Assistant. Hãy dựa vào ngữ cảnh RAG bên dưới để hỗ trợ người dùng nhiệt tình và chính xác.";
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    role: "user",
                    parts: [{ text: `${systemInstruction}\n\n[NGỮ CẢNH RAG]:\n${contextText}\n\n[CÂU HỎI]:\n${content}` }],
                  },
                ],
              }),
            }
          );
          const json = await geminiRes.json();
          replyText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (e) {
          console.warn("[Chat Bot AI Error]", e);
        }
      }

      if (!replyText) {
        if (ragResults.length > 0) {
          replyText = `🤖 [Bitrix24 CoPilot AI]: Dựa trên dữ liệu tri thức RAG:\n\n${ragResults[0].content}`;
        } else {
          replyText = `🤖 [Bitrix24 CoPilot AI]: Tôi đã ghi nhận tin nhắn: "${content}". Bạn có thể quản lý công việc và sử dụng AI Knowledge Chatbot bất cứ lúc nào!`;
        }
      }

      aiMessage = {
        id: `msg-ai-${Date.now()}`,
        channelId,
        senderName: "Bitrix24 Support / CoPilot",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        content: replyText,
        isAi: true,
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      userMessage,
      aiMessage,
    });
  } catch (err) {
    console.error("[API POST /api/chat/messages] Error:", err);
    return NextResponse.json({ error: "Lỗi hệ thống khi gửi tin nhắn" }, { status: 500 });
  }
}
