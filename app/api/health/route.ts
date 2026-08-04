import { NextResponse } from "next/server";
import { ApiHealthResponse } from "@/types";
import { getSystemHealthFromDB } from "@/lib/backend/db-queries";

const startTime = Date.now();

export async function GET() {
  const dbStatus = await getSystemHealthFromDB();

  const healthData: ApiHealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "qlcongviec-core-api",
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database: dbStatus,
      storage: "available",
      ragService: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY ? "ready" : "standby",
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
