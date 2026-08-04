import { NextResponse } from "next/server";
import { removeGroup } from "@/lib/backend/db-queries";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID nhóm không hợp lệ" }, { status: 400 });
    }

    await removeGroup(id);
    return NextResponse.json({ success: true, message: "Đã xóa Nhóm thành công" }, { status: 200 });
  } catch (error) {
    console.error("[API DELETE /api/groups/[id]] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xóa Nhóm" },
      { status: 500 }
    );
  }
}
