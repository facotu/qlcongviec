import { NextResponse } from "next/server";
import { queryKnowledgeBase } from "@/lib/backend/rag";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      message,
      selected_tag_id,
      custom_api_key,
      custom_system_prompt,
    } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Tin nhắn (message) là bắt buộc" }, { status: 400 });
    }

    // Step A & Step B: Vectorize query and fetch Top 3-5 relevant RAG knowledge chunks
    const tagFilter = selected_tag_id && selected_tag_id !== "all" ? selected_tag_id : null;
    const ragResults = await queryKnowledgeBase(message.trim(), tagFilter, 0.55, 5);

    // Format RAG Context
    const contextText = ragResults.length > 0
      ? ragResults.map((item, idx) => `[Trích dẫn ${idx + 1}]: "${item.content}"`).join("\n\n")
      : "Không tìm thấy đoạn trích dẫn tri thức trực tiếp trong cơ sở dữ liệu vector.";

    const systemInstruction =
      custom_system_prompt?.trim() ||
      "Bạn là AI Assistant thông minh tích hợp RAG Search của hệ thống QLCôngViệc. Hãy trả lời câu hỏi dựa trên ngữ cảnh tri thức trích dẫn bên dưới một cách chính xác, ngắn gọn và hữu ích.";

    // Step C: Call LLM API (Gemini / OpenAI) or fallback streaming response
    const apiKey = custom_api_key || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    let aiReply = "";

    if (apiKey && !apiKey.includes("placeholder") && !apiKey.includes("your-")) {
      try {
        // Call Gemini 2.5 Flash API
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${systemInstruction}\n\n[NGỮ CẢNH TRI THỨC TRÍCH DẪN RAG]:\n${contextText}\n\n[CÂU HỎI NGƯỜI DÙNG]:\n${message}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const geminiJson = await geminiRes.json();
        if (geminiJson.candidates?.[0]?.content?.parts?.[0]?.text) {
          aiReply = geminiJson.candidates[0].content.parts[0].text;
        }
      } catch (err) {
        console.warn("[AI Chat Endpoint] LLM API call error, falling back to RAG synthesis:", err);
      }
    }

    // Fallback response if LLM API key is not provided or fails
    if (!aiReply) {
      if (ragResults.length > 0) {
        aiReply = `Dựa trên kết quả RAG Vector Search (Top ${ragResults.length} trích dẫn), dưới đây là thông tin trả lời cho câu hỏi "${message}":\n\n${ragResults[0].content}`;
      } else {
        aiReply = `Tôi đã nhận được câu hỏi: "${message}". Hiện tại chưa tìm thấy ghi chú tri thức nào có độ tương đồng cao phù hợp với từ khóa này. Bạn có thể bổ sung các RAG Knowledge Note mới trong ứng dụng.`;
      }
    }

    return NextResponse.json(
      {
        success: true,
        reply: aiReply,
        citations: ragResults.map((r, i) => ({
          id: r.id,
          sourceNumber: i + 1,
          snippet: r.content.slice(0, 120) + "...",
          similarity: Math.round(r.score * 100),
          metadata: r.metadata,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API POST /api/ai/chat] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xử lý AI Chatbot" },
      { status: 500 }
    );
  }
}
