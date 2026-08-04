import { NextResponse } from "next/server";
import { fetchFilteredTasks, insertTask } from "@/lib/backend/db-queries";
import { TaskStatus } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("group_id");
    const tagId = searchParams.get("tag_id");
    const status = searchParams.get("status") as TaskStatus | "all" | null;
    const search = searchParams.get("search");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const tasks = await fetchFilteredTasks({
      groupId: groupId || undefined,
      tagId: tagId || undefined,
      status: status || undefined,
      search: search || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("[API GET /api/tasks] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi lấy danh sách Task" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, group_id, tag_ids, status, due_date, is_knowledge_note } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Tên công việc (title) là bắt buộc" },
        { status: 400 }
      );
    }

    const newTask = await insertTask({
      title: title.trim(),
      groupId: group_id || null,
      tagIds: Array.isArray(tag_ids) ? tag_ids : [],
      status: status || "todo",
      dueDate: due_date || null,
      isKnowledgeNote: Boolean(is_knowledge_note),
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("[API POST /api/tasks] Error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tạo mới Task" },
      { status: 500 }
    );
  }
}
