import { NextResponse } from "next/server";
import { stopTaskTimer } from "@/lib/backend/db-queries";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { task_id } = body;

    const result = await stopTaskTimer(task_id);
    return NextResponse.json(
      {
        success: true,
        message: "Đã dừng Timer thành công",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API POST /api/timer/stop] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi dừng Timer" },
      { status: 500 }
    );
  }
}
