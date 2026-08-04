"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Group, Tag } from "@/types";
import { apiClient } from "@/lib/frontend/api-client";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { Search, Plus, Bell, ShieldCheck, User } from "lucide-react";

export function Header() {
  const {
    filterSettings,
    setSearchQuery,
    currentUser,
    selectedGroupId,
    selectedTagId,
  } = useAppStore();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [groups, setGroups] = useState<(Group & { tags: Tag[] })[]>([]);

  const loadGroups = useCallback(async () => {
    const res = await apiClient<(Group & { tags: Tag[] })[]>("/api/groups");
    if (res.data) setGroups(res.data);
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 light:border-slate-200 bg-slate-950/80 light:bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
        {/* Global Search Input */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc, ghi chú tri thức, tag..."
              value={filterSettings.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 light:bg-slate-100 border border-slate-800 light:border-slate-200 text-xs text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            />
          </div>

          {/* Selected Filter Indicators */}
          {(selectedGroupId || selectedTagId) && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
              Filtered Active
            </span>
          )}
        </div>

        {/* Right Header User Controls */}
        <div className="flex items-center gap-4">
          {/* Quick Add Task Button */}
          <button
            onClick={() => {
              loadGroups();
              setIsTaskModalOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo công việc</span>
          </button>

          {/* Notification Bell */}
          <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 light:hover:bg-slate-100 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2 animate-ping" />
          </button>

          <div className="h-4 w-px bg-slate-800 light:bg-slate-200" />

          {/* User Profile */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs overflow-hidden">
              {currentUser?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>

            <div className="hidden md:block text-left space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-200 light:text-slate-800">
                  {currentUser?.fullName || "Admin"}
                </span>
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="text-[10px] text-slate-400 light:text-slate-500 font-mono block">
                {currentUser?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Create Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        groups={groups}
        defaultGroupId={selectedGroupId}
        defaultTagId={selectedTagId}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />
    </>
  );
}
