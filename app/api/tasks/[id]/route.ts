import { NextResponse } from "next/server";
import { updateTask, removeTask } from "@/lib/backend/db-queries";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID Task không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const { status, title, due_date, group_id, is_knowledge_note } = body;

    await updateTask(id, {
      status,
      title,
      due_date,
      group_id,
      is_knowledge_note,
    });

    return NextResponse.json({ success: true, message: "Cập nhật Task thành công" }, { status: 200 });
  } catch (error) {
    console.error("[API PATCH /api/tasks/[id]] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi cập nhật Task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID Task không hợp lệ" }, { status: 400 });
    }

    await removeTask(id);
    return NextResponse.json({ success: true, message: "Đã xóa Task thành công" }, { status: 200 });
  } catch (error) {
    console.error("[API DELETE /api/tasks/[id]] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xóa Task" },
      { status: 500 }
    );
  }
}
