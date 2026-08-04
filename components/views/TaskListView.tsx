"use client";

import { Task, TaskStatus } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/lib/frontend/api-client";
import {
  CheckSquare,
  Square,
  Clock,
  Play,
  Pause,
  Tag as TagIcon,
  Calendar as CalendarIcon,
  BookOpen,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface TaskListViewProps {
  tasks: Task[];
  onRefresh: () => void;
  onSelectTask?: (task: Task) => void;
}

export function TaskListView({ tasks, onRefresh, onSelectTask }: TaskListViewProps) {
  const { timer, startTimerApi, stopTimerApi } = useAppStore();

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === "todo"
        ? "in_progress"
        : task.status === "in_progress"
        ? "done"
        : "todo";

    await apiClient(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });

    onRefresh();
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
    await apiClient(`/api/tasks/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const formatSeconds = (secs?: number) => {
    if (!secs) return "0s";
    const m = Math.floor(secs / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m ${secs % 60}s`;
  };

  return (
    <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 light:bg-slate-100 text-slate-400 light:text-slate-600 font-semibold border-b border-slate-800/80 light:border-slate-200">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Status</th>
              <th className="py-3 px-4">Tên Công Việc</th>
              <th className="py-3 px-4">Nhóm & Thẻ Tag</th>
              <th className="py-3 px-4">Tổng Thời Gian</th>
              <th className="py-3 px-4">Hạn Chót (Due Date)</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 light:divide-slate-200">
            {tasks.map((task) => {
              const isRecordingThisTask =
                timer.isRunning && timer.activeTaskId === task.id;

              return (
                <tr
                  key={task.id}
                  className={`hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors ${
                    isRecordingThisTask ? "bg-indigo-950/30" : ""
                  }`}
                >
                  {/* Status Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                      title={`Đổi trạng thái: ${task.status}`}
                    >
                      {task.status === "done" ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : task.status === "in_progress" ? (
                        <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </td>

                  {/* Title & Knowledge Note (Click to open Drawer) */}
                  <td className="py-3.5 px-4">
                    <div
                      onClick={() => onSelectTask && onSelectTask(task)}
                      className="flex items-center gap-2 cursor-pointer group/title"
                    >
                      <span
                        className={`font-semibold group-hover/title:text-indigo-300 transition-colors ${
                          task.status === "done"
                            ? "line-through text-slate-500"
                            : "text-slate-100 light:text-slate-900"
                        }`}
                      >
                        {task.title}
                      </span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover/title:opacity-100 text-indigo-400 transition-opacity" />

                      {task.isKnowledgeNote && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                          <BookOpen className="w-3 h-3" /> Tri Thức
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Group & Tag Badges */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.group && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: task.group.color || "#6366f1" }}
                          />
                          {task.group.name}
                        </span>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {task.tags.map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300"
                            >
                              #{t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Total Duration */}
                  <td className="py-3.5 px-4 font-mono text-indigo-300">
                    {formatSeconds(task.totalDurationSeconds)}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {task.dueDate ? (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 text-indigo-400" />
                        {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                      </span>
                    ) : (
                      "---"
                    )}
                  </td>

                  {/* Actions (Timer API & Delete) */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isRecordingThisTask ? (
                        <button
                          onClick={async () => {
                            await stopTimerApi();
                            onRefresh();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold text-[11px] flex items-center gap-1"
                          title="Tạm dừng & Chốt phiên Timer"
                        >
                          <Pause className="w-3 h-3" /> Pause
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await startTimerApi(task.id, task.title);
                            onRefresh();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white font-semibold text-[11px] flex items-center gap-1 transition-all"
                          title="Bắt đầu đếm giờ"
                        >
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Xóa công việc"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
