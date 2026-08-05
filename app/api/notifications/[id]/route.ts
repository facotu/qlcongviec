import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/backend/supabase-admin";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      return NextResponse.json({ success: true, message: "Đã cập nhật trạng thái thông báo" });
    }

    if (id === "all") {
      await supabaseAdmin.from("notifications").update({ is_read: true }).eq("is_read", false);
    } else {
      await supabaseAdmin.from("notifications").update({ is_read: true }).eq("id", id);
    }

    return NextResponse.json({ success: true, message: "Đã đánh dấu thông báo là đã đọc" });
  } catch (err) {
    console.error("[API PATCH /api/notifications/[id]] Error:", err);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật thông báo" }, { status: 500 });
  }
}
