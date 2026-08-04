"use client";

import { useAppStore } from "@/store/useAppStore";
import { Group, Tag, TaskStatus } from "@/types";
import {
  Search,
  Filter,
  Plus,
  XCircle,
  Calendar,
  Layers,
  Tag as TagIcon,
  RotateCcw,
} from "lucide-react";

interface TopFilterBarProps {
  groups: (Group & { tags: Tag[] })[];
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onOpenCreateTaskModal: () => void;
}

export function TopFilterBar({
  groups,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onOpenCreateTaskModal,
}: TopFilterBarProps) {
  const {
    filterSettings,
    setSearchQuery,
    setStatusFilter,
    selectedGroupId,
    selectedTagId,
    setSelectedGroup,
    setSelectedTag,
    resetFilters,
  } = useAppStore();

  // Find tags for selected group
  const activeGroup = groups.find((g) => g.id === selectedGroupId);
  const availableTags = activeGroup ? activeGroup.tags : groups.flatMap((g) => g.tags);

  const hasActiveFilters =
    Boolean(filterSettings.searchQuery) ||
    filterSettings.statusFilter !== "all" ||
    Boolean(selectedGroupId) ||
    Boolean(selectedTagId) ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-xl space-y-4 transition-colors">
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc theo tiêu đề hoặc tag..."
            value={filterSettings.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-200 text-xs text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 light:bg-slate-100 border border-slate-800/80 light:border-slate-200 overflow-x-auto">
          {(["all", "todo", "in_progress", "done"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterSettings.statusFilter === st
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:bg-slate-200"
              }`}
            >
              {st === "all" ? "Tất cả Status" : st.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Quick Create Task Button */}
        <button
          onClick={onOpenCreateTaskModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tạo công việc</span>
        </button>
      </div>

      {/* Bottom Dropdowns & Date Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 light:border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Select Group Dropdown */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedGroupId || ""}
              onChange={(e) => setSelectedGroup(e.target.value || null)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-200 text-xs text-slate-200 light:text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Tất cả Nhóm --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Tag Dropdown */}
          <div className="flex items-center gap-1.5">
            <TagIcon className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={selectedTagId || ""}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-200 text-xs text-slate-200 light:text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Tất cả Thẻ Tag --</option>
              {availableTags.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 bg-slate-950 light:bg-slate-100 px-3 py-1 rounded-xl border border-slate-800 light:border-slate-200 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Từ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-transparent text-slate-200 light:text-slate-800 focus:outline-none"
            />
            <span>Đến:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-transparent text-slate-200 light:text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              resetFilters();
              onStartDateChange("");
              onEndDateChange("");
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
}
