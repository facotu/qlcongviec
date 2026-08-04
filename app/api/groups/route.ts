import { NextResponse } from "next/server";
import { fetchGroupsWithTags, insertGroup } from "@/lib/backend/db-queries";

export async function GET() {
  try {
    const groups = await fetchGroupsWithTags();
    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error("[API GET /api/groups] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi lấy danh sách Nhóm" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Tên Nhóm công việc là bắt buộc" },
        { status: 400 }
      );
    }

    const newGroup = await insertGroup(name.trim(), color || "#6366f1");
    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    console.error("[API POST /api/groups] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tạo Nhóm công việc" },
      { status: 500 }
    );
  }
}
