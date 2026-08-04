"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Task, Group, Tag } from "@/types";
import { apiClient } from "@/lib/frontend/api-client";
import { TopFilterBar } from "@/components/tasks/TopFilterBar";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { ViewTabSwitcher, ViewMode } from "@/components/views/ViewTabSwitcher";
import { TaskListView } from "@/components/views/TaskListView";
import { TaskKanbanView } from "@/components/views/TaskKanbanView";
import { TaskCalendarView } from "@/components/views/TaskCalendarView";
import { CheckSquare, Sparkles } from "lucide-react";

export default function TasksPage() {
  const {
    filterSettings,
    selectedGroupId,
    selectedTagId,
  } = useAppStore();

  const [currentView, setCurrentView] = useState<ViewMode>("list");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<(Group & { tags: Tag[] })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<Task | null>(null);

  // Date range local state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Load groups for dropdowns
  const loadGroups = useCallback(async () => {
    const res = await apiClient<(Group & { tags: Tag[] })[]>("/api/groups");
    if (res.data) setGroups(res.data);
  }, []);

  // Fetch tasks with dynamic query parameters
  const loadTasks = useCallback(async () => {
    setIsLoading(true);

    const params = new URLSearchParams();
    if (selectedGroupId) params.set("group_id", selectedGroupId);
    if (selectedTagId) params.set("tag_id", selectedTagId);
    if (filterSettings.statusFilter !== "all") params.set("status", filterSettings.statusFilter);
    if (filterSettings.searchQuery.trim()) params.set("search", filterSettings.searchQuery.trim());
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);

    const res = await apiClient<Task[]>(`/api/tasks?${params.toString()}`);
    if (res.data) {
      setTasks(res.data);
      // Keep selected task for drawer updated if open
      if (selectedTaskForDrawer) {
        const updated = res.data.find((t) => t.id === selectedTaskForDrawer.id);
        if (updated) setSelectedTaskForDrawer(updated);
      }
    }
    setIsLoading(false);
  }, [
    selectedGroupId,
    selectedTagId,
    filterSettings.statusFilter,
    filterSettings.searchQuery,
    startDate,
    endDate,
    selectedTaskForDrawer?.id,
  ]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <TopFilterBar
        groups={groups}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onOpenCreateTaskModal={() => setIsCreateTaskModalOpen(true)}
      />

      {/* Header Info & View Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Quản Lý Công Việc ({tasks.length})
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isLoading ? "Đang cập nhật danh sách..." : `Hiển thị ${tasks.length} công việc theo bộ lọc`}
          </p>
        </div>

        {/* View Tab Switcher (List / Kanban / Calendar) */}
        <ViewTabSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {/* Main View Mode Area */}
      <div className="transition-all">
        {tasks.length === 0 && !isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 space-y-3">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Chưa có công việc nào phù hợp</p>
            <p className="text-xs text-slate-500">
              Bấm <strong className="text-indigo-400">+ Tạo công việc</strong> để tạo mới công việc.
            </p>
          </div>
        ) : currentView === "list" ? (
          <TaskListView
            tasks={tasks}
            onRefresh={loadTasks}
            onSelectTask={(task) => setSelectedTaskForDrawer(task)}
          />
        ) : currentView === "kanban" ? (
          <TaskKanbanView
            tasks={tasks}
            onRefresh={loadTasks}
            onSelectTask={(task) => setSelectedTaskForDrawer(task)}
          />
        ) : (
          <TaskCalendarView tasks={tasks} onRefresh={loadTasks} />
        )}
      </div>

      {/* Quick Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        groups={groups}
        defaultGroupId={selectedGroupId}
        defaultTagId={selectedTagId}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSuccess={loadTasks}
      />

      {/* Task Detail Slide-Over Drawer */}
      <TaskDetailDrawer
        task={selectedTaskForDrawer}
        groups={groups}
        isOpen={Boolean(selectedTaskForDrawer)}
        onClose={() => setSelectedTaskForDrawer(null)}
        onSuccess={loadTasks}
      />
    </div>
  );
}
