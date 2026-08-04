import { NextResponse } from "next/server";
import { insertTag } from "@/lib/backend/db-queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, group_id } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Tên Thẻ Tag là bắt buộc" },
        { status: 400 }
      );
    }

    if (!group_id || typeof group_id !== "string" || !group_id.trim()) {
      return NextResponse.json(
        { error: "Bắt buộc phải truyền group_id. 1 Tag chỉ thuộc về 1 Group duy nhất." },
        { status: 400 }
      );
    }

    const newTag = await insertTag(name.trim(), group_id.trim());
    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error("[API POST /api/tags] Error:", error);
    const message = error instanceof Error ? error.message : "Lỗi hệ thống khi tạo Tag";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
