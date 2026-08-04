"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { apiClient } from "@/lib/frontend/api-client";
import {
  Clock,
  Play,
  Pause,
  Tag as TagIcon,
  BookOpen,
} from "lucide-react";

interface TaskKanbanViewProps {
  tasks: Task[];
  onRefresh: () => void;
  onSelectTask?: (task: Task) => void;
}

const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string; badgeBg: string }[] = [
  { id: "todo", title: "Cần Làm (To Do)", color: "#94a3b8", badgeBg: "bg-slate-800 text-slate-300" },
  { id: "in_progress", title: "Đang Thực Hiện (In Progress)", color: "#f59e0b", badgeBg: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
  { id: "done", title: "Đã Hoàn Thành (Done)", color: "#10b981", badgeBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
];

export function TaskKanbanView({ tasks: initialTasks, onRefresh, onSelectTask }: TaskKanbanViewProps) {
  const { timer, startTimerApi, stopTimerApi } = useAppStore();

  // Local optimistic tasks state
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Handle Drag-and-Drop End with Optimistic Update
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;

    // 1. Optimistic Update locally
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    // 2. Call PATCH API backend in background
    const res = await apiClient(`/api/tasks/${draggableId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.error) {
      console.error("[Kanban Error] Failed to update task status:", res.error);
      onRefresh();
    }
  };

  const getTasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = getTasksByStatus(col.id);

          return (
            <div
              key={col.id}
              className="p-4 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-xl flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <h2 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                    {col.title}
                  </h2>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeBg}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Droppable Column Body */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 p-1 rounded-xl transition-colors ${
                      snapshot.isDraggingOver ? "bg-indigo-950/20 border border-dashed border-indigo-500/40" : ""
                    }`}
                  >
                    {colTasks.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/60 rounded-xl">
                        Kéo thả công việc vào đây
                      </div>
                    ) : (
                      colTasks.map((task, index) => {
                        const isRecordingThisTask =
                          timer.isRunning && timer.activeTaskId === task.id;

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(providedDrag, snapshotDrag) => (
                              <div
                                ref={providedDrag.innerRef}
                                {...providedDrag.draggableProps}
                                {...providedDrag.dragHandleProps}
                                onClick={() => onSelectTask && onSelectTask(task)}
                                className={`p-4 rounded-xl bg-slate-950 light:bg-slate-50 border transition-all space-y-3 cursor-pointer ${
                                  snapshotDrag.isDragging
                                    ? "shadow-2xl ring-2 ring-indigo-500 scale-105"
                                    : isRecordingThisTask
                                    ? "border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg"
                                    : "border-slate-800/80 hover:border-slate-700"
                                }`}
                              >
                                {/* Group & Knowledge Badges */}
                                <div className="flex items-center justify-between gap-2">
                                  {task.group ? (
                                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: task.group.color || "#6366f1" }}
                                      />
                                      {task.group.name}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-mono">No Group</span>
                                  )}

                                  {task.isKnowledgeNote && (
                                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                                      <BookOpen className="w-3 h-3" /> Tri Thức
                                    </span>
                                  )}
                                </div>

                                {/* Task Title */}
                                <h3 className="font-semibold text-xs text-slate-100 leading-snug hover:text-indigo-300 transition-colors">
                                  {task.title}
                                </h3>

                                {/* Tags */}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap pt-1">
                                    <TagIcon className="w-3 h-3 opacity-60 text-slate-400" />
                                    {task.tags.map((t) => (
                                      <span
                                        key={t.id}
                                        className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300"
                                      >
                                        #{t.name}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Card Footer Controls */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                                  <span className="text-slate-400 font-mono">
                                    {task.dueDate
                                      ? `Due: ${new Date(task.dueDate).toLocaleDateString("vi-VN")}`
                                      : "No Due"}
                                  </span>

                                  {isRecordingThisTask ? (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await stopTimerApi();
                                        onRefresh();
                                      }}
                                      className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-1"
                                    >
                                      <Pause className="w-3 h-3" /> Pause
                                    </button>
                                  ) : (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await startTimerApi(task.id, task.title);
                                        onRefresh();
                                      }}
                                      className="px-2 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white font-semibold flex items-center gap-1 transition-colors"
                                    >
                                      <Play className="w-3 h-3" /> Start
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
