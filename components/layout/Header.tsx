"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Group, Tag, NotificationItem } from "@/types";
import { apiClient } from "@/lib/frontend/api-client";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { Search, Plus, Bell, ShieldCheck, User, Check, ExternalLink, X } from "lucide-react";
import Link from "next/link";

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

  // Notifications Dropdown State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadGroups = useCallback(async () => {
    const res = await apiClient<(Group & { tags: Tag[] })[]>("/api/groups");
    if (res.data) setGroups(res.data);
  }, []);

  const loadNotifications = useCallback(async () => {
    const res = await apiClient<{ data: NotificationItem[]; unreadCount: number }>("/api/notifications");
    if (res.data) {
      setNotifications(res.data);
      setUnreadCount(res.unreadCount || 0);
    }
  }, []);

  useEffect(() => {
    loadGroups();
    loadNotifications();
  }, [loadGroups, loadNotifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await apiClient("/api/notifications/all", { method: "PATCH" });
    loadNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await apiClient(`/api/notifications/${id}`, { method: "PATCH" });
    loadNotifications();
  };

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

          {/* Notification Bell & Interactive Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen) loadNotifications();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 light:hover:bg-slate-100 transition-colors relative"
              title="Thông báo hoạt động"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center absolute -top-1 -right-1 border-2 border-slate-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-3.5 border-b border-slate-800 light:border-slate-200 flex items-center justify-between bg-slate-950/60 light:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-xs text-slate-100 light:text-slate-900">
                      Thông Báo Hoạt Động
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-indigo-400 hover:underline font-semibold"
                    >
                      Đã đọc tất cả
                    </button>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="p-1 rounded text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 light:divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Không có thông báo nào
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                          !n.isRead
                            ? "bg-indigo-950/30 light:bg-indigo-50/50"
                            : "hover:bg-slate-800/40 light:hover:bg-slate-50"
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-slate-200 light:text-slate-900">
                              {n.title}
                            </h4>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 light:text-slate-600 leading-snug">
                            {n.content}
                          </p>
                          {n.linkUrl && (
                            <Link
                              href={n.linkUrl}
                              className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:underline font-semibold pt-1"
                            >
                              <span>Xem chi tiết</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
