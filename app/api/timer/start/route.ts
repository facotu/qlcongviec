import { NextResponse } from "next/server";
import { startTaskTimer } from "@/lib/backend/db-queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id } = body;

    if (!task_id || typeof task_id !== "string") {
      return NextResponse.json({ error: "task_id là bắt buộc" }, { status: 400 });
    }

    const result = await startTaskTimer(task_id);
    return NextResponse.json(
      {
        success: true,
        message: "Đã chốt phiên đếm cũ và bắt đầu phiên mới",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API POST /api/timer/start] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi kích hoạt Timer" },
      { status: 500 }
    );
  }
}
