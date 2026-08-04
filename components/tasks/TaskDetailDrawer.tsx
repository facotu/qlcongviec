"use client";

import { useState, useEffect } from "react";
import { Task, Group, Tag, TaskStatus } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/lib/frontend/api-client";
import { NotionBlockEditor } from "@/components/editor/NotionBlockEditor";
import {
  X,
  CheckSquare,
  Square,
  Clock,
  Play,
  Pause,
  Calendar,
  Layers,
  Tag as TagIcon,
  BookOpen,
  HelpCircle,
  Sparkles,
  Trash2,
} from "lucide-react";

interface TaskDetailDrawerProps {
  task: Task | null;
  groups: (Group & { tags: Tag[] })[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function TaskDetailDrawer({
  task,
  groups,
  isOpen,
  onClose,
  onRefresh,
}: TaskDetailDrawerProps) {
  const { timer, startTimerApi, stopTimerApi } = useAppStore();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [groupId, setGroupId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [isKnowledgeNote, setIsKnowledgeNote] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setStatus(task.status);
      setGroupId(task.groupId || "");
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      setIsKnowledgeNote(Boolean(task.isKnowledgeNote));
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const isRecordingThisTask = timer.isRunning && timer.activeTaskId === task.id;

  // Auto-save notion content handler via PATCH /api/tasks/[id]
  const handleSaveContent = async (notionContent: Record<string, unknown>) => {
    await apiClient(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title,
        status,
        group_id: groupId || null,
        due_date: dueDate || null,
        is_knowledge_note: isKnowledgeNote,
        notion_content: notionContent,
      }),
    });
    onRefresh();
  };

  // Update specific property immediately
  const handleUpdateProperty = async (
    updates: Partial<{ status: TaskStatus; title: string; group_id: string | null; due_date: string | null; is_knowledge_note: boolean }>
  ) => {
    await apiClient(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
    await apiClient(`/api/tasks/${task.id}`, { method: "DELETE" });
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <aside className="absolute inset-y-0 right-0 w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header Controls */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  status === "done"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : status === "in_progress"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {status.replace("_", " ")}
              </span>

              {/* Timer Control */}
              {isRecordingThisTask ? (
                <button
                  onClick={async () => {
                    await stopTimerApi();
                    onRefresh();
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause Timer
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await startTimerApi(task.id, task.title);
                    setStatus("in_progress");
                    onRefresh();
                  }}
                  className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Start Timer
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Xóa Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Editable Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleUpdateProperty({ title })}
            className="w-full text-lg font-bold bg-transparent text-slate-100 border-b border-transparent hover:border-slate-800 focus:border-indigo-500 focus:outline-none py-1 transition-colors"
          />

          {/* Quick Properties Control Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            {/* Status Select */}
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Trạng thái</span>
              <select
                value={status}
                onChange={(e) => {
                  const nextSt = e.target.value as TaskStatus;
                  setStatus(nextSt);
                  handleUpdateProperty({ status: nextSt });
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Group Select */}
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Nhóm công việc</span>
              <select
                value={groupId}
                onChange={(e) => {
                  setGroupId(e.target.value);
                  handleUpdateProperty({ group_id: e.target.value || null });
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Không có Nhóm --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Hạn chót (Due Date)</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleUpdateProperty({ due_date: e.target.value || null });
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Drawer Body Notion Editor */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Nội Dung Chi Tiết (Notion Block Editor)
            </h3>
          </div>

          <NotionBlockEditor
            initialContent={task.notionContent}
            onSave={handleSaveContent}
          />
        </div>

        {/* Drawer Footer - RAG Knowledge Note Toggle */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 relative">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-200">Đánh dấu là RAG Knowledge Note</span>

            {/* Tooltip Help Icon */}
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-slate-500 hover:text-indigo-400 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Tooltip Box */}
            {showTooltip && (
              <div className="absolute left-0 bottom-8 z-50 w-72 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-[11px] text-slate-300 leading-relaxed pointer-events-none animate-in fade-in duration-150">
                <strong className="text-indigo-400 block mb-1">RAG Knowledge Note:</strong>
                Khi bật tính năng này, nội dung của công việc sẽ được tự động vectorize thành 1536d Embeddings cho Supabase pgvector, cho phép AI Assistant trả lời và tra cứu trong AI Knowledge Chat.
              </div>
            )}
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => {
              const nextVal = !isKnowledgeNote;
              setIsKnowledgeNote(nextVal);
              handleUpdateProperty({ is_knowledge_note: nextVal });
            }}
            className={`w-11 h-6 rounded-full p-1 transition-colors relative ${
              isKnowledgeNote ? "bg-purple-600" : "bg-slate-800"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                isKnowledgeNote ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </aside>
    </div>
  );
}
