import { NextResponse } from "next/server";
import { removeTag } from "@/lib/backend/db-queries";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID Tag không hợp lệ" }, { status: 400 });
    }

    await removeTag(id);
    return NextResponse.json({ success: true, message: "Đã xóa Tag thành công" }, { status: 200 });
  } catch (error) {
    console.error("[API DELETE /api/tags/[id]] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xóa Tag" },
      { status: 500 }
    );
  }
}
