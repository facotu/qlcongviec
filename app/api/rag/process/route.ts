import { NextResponse } from "next/server";
import { processTaskForRAG } from "@/lib/backend/rag";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json({ error: "taskId là bắt buộc" }, { status: 400 });
    }

    const result = await processTaskForRAG(taskId);
    return NextResponse.json(
      {
        success: true,
        message: "Đã xử lý Chunking và lưu Vector Embeddings cho RAG Knowledge Base thành công",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API POST /api/rag/process] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xử lý RAG Vectorization" },
      { status: 500 }
    );
  }
}
