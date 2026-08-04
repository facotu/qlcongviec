"use client";

import { useState } from "react";
import { Task } from "@/types";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle2 } from "lucide-react";

interface TaskCalendarViewProps {
  tasks: Task[];
  onRefresh: () => void;
}

export function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  const [currentDate] = useState<Date>(new Date());
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // Helper to format YYYY-MM-DD
  const formatDateKey = (year: number, month: number, day: number) => {
    const m = (month + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  // Group tasks by Due Date YYYY-MM-DD
  const tasksByDateMap = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
    }
    return acc;
  }, {});

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get total days in month
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  return (
    <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200 p-6 space-y-6 shadow-xl">
      {/* Calendar Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
            View Calendar (Lịch Hạn Chót Task)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tự động sắp xếp công việc theo ngày Hạn Chót (Due Date)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-indigo-300 px-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono">
            Tháng {currentMonth + 1}, {currentYear}
          </span>
          <button className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: totalDaysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateKey = formatDateKey(currentYear, currentMonth, dayNum);
          const dayTasks = tasksByDateMap[dateKey] || [];
          const isToday = new Date().getDate() === dayNum;

          return (
            <div
              key={dayNum}
              className={`min-h-[110px] p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                isToday
                  ? "bg-indigo-950/40 border-indigo-500/60 text-indigo-300 ring-1 ring-indigo-500/30"
                  : "bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700"
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between font-mono font-bold">
                <span>{dayNum}</span>
                {isToday && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-sans">
                    Hôm nay
                  </span>
                )}
              </div>

              {/* Tasks on this day */}
              <div className="space-y-1 mt-2 flex-1 overflow-y-auto max-h-[70px] scrollbar-none">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-1.5 rounded-lg text-[10px] font-semibold truncate border ${
                      t.status === "done"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : t.status === "in_progress"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                    }`}
                    title={t.title}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
