"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Clock, Play, Pause, Square } from "lucide-react";

export function ActiveTimerWidget() {
  const { timer, startTimerApi, stopTimerApi, resetTimer, tickTimer } = useAppStore();

  // Subscribe and tick timer every second when active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer.isRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, tickTimer]);

  // Standard hh:mm:ss formatting
  const formatTimeHHMMSS = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/40 via-slate-900/80 to-purple-900/30 border border-indigo-500/30 shadow-lg shadow-indigo-950/40 space-y-3 relative overflow-hidden group">
      {/* Active pulse glow effect */}
      {timer.isRunning && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl animate-pulse pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-indigo-400">
          <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: timer.isRunning ? "3s" : "0s" }} />
          <span className="uppercase tracking-wider">Active Timer</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
            timer.isRunning
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${timer.isRunning ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
          {timer.isRunning ? "RUNNING" : "PAUSED"}
        </span>
      </div>

      {/* Task Name Title */}
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-indigo-300 transition-colors" title={timer.activeTaskTitle || "No Active Task"}>
          {timer.activeTaskTitle || "Công việc tự do"}
        </p>
        <p className="text-[10px] text-slate-400 font-mono truncate">ID: {timer.activeTaskId || "N/A"}</p>
      </div>

      {/* Stopwatch Counter Display (hh:mm:ss) */}
      <div className="flex items-center justify-between pt-1 border-t border-indigo-500/20">
        <div className="font-mono text-2xl font-bold tracking-wider text-white drop-shadow-md">
          {formatTimeHHMMSS(timer.seconds)}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {timer.isRunning ? (
            <button
              onClick={() => stopTimerApi()}
              className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all active:scale-95 shadow-sm"
              title="Dừng & Lưu Timer (POST /api/timer/stop)"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => startTimerApi(timer.activeTaskId || "task-103", timer.activeTaskTitle || "Công việc tự do")}
              className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-all active:scale-95 shadow-sm"
              title="Bắt đầu Timer (POST /api/timer/start)"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={resetTimer}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all active:scale-95"
            title="Reset"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
