"use client";

import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_TASKS } from "@/lib/mock-data";

export default function CalendarPage() {
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            Lịch Biểu Công Việc & Tiến Độ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Xem thời gian hạn chót (Due dates) và thời lượng theo dõi cho các công việc
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-indigo-400 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
            Tháng 8, 2026
          </span>
          <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Demo */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-4 space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 31 }).map((_, i) => {
            const dayNum = i + 1;
            const hasTasks = dayNum === 4 || dayNum === 6 || dayNum === 9;
            const isToday = dayNum === 4;

            return (
              <div
                key={i}
                className={`min-h-[90px] p-2 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  isToday
                    ? "bg-indigo-950/40 border-indigo-500/60 text-indigo-300"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold">
                  <span>{dayNum}</span>
                  {isToday && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500 text-white">Today</span>
                  )}
                </div>

                {hasTasks && (
                  <div className="space-y-1">
                    <div className="p-1 rounded bg-indigo-600/30 border border-indigo-500/40 text-[10px] text-indigo-200 truncate">
                      Setup Clean Arch
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
