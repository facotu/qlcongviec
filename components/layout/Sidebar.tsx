"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Group, Tag } from "@/types";
import { apiClient } from "@/lib/frontend/api-client";
import { ActiveTimerWidget } from "./ActiveTimerWidget";
import { CreateGroupModal } from "@/components/modals/CreateGroupModal";
import { CreateTagModal } from "@/components/modals/CreateTagModal";
import {
  CheckSquare,
  Calendar,
  MessageSquareCode,
  MessageSquare,
  Tag as TagIcon,
  ChevronDown,
  ChevronRight,
  Settings,
  Sun,
  Moon,
  Check,
  Layers,
  XCircle,
  Plus,
  Trash2,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const {
    selectedGroupId,
    selectedTagId,
    setSelectedGroup,
    setSelectedTag,
    clearGroupTagFilters,
    theme,
    toggleTheme,
  } = useAppStore();

  // Dynamic Groups State from API
  const [groups, setGroups] = useState<(Group & { tags: Tag[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [targetGroupIdForTag, setTargetGroupIdForTag] = useState<string | null>(null);

  // Accordion open/close state
  const [openGroupIds, setOpenGroupIds] = useState<string[]>([]);

  // Fetch groups from API
  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    const res = await apiClient<(Group & { tags: Tag[] })[]>("/api/groups");
    if (res.data) {
      setGroups(res.data);
      // Auto open all groups on initial load
      setOpenGroupIds(res.data.map((g) => g.id));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const toggleGroupAccordion = (groupId: string) => {
    setOpenGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  // Delete Group handler
  const handleDeleteGroup = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa Nhóm này cùng tất cả các Thẻ Tag bên trong?")) return;

    await apiClient(`/api/groups/${id}`, { method: "DELETE" });
    if (selectedGroupId === id) setSelectedGroup(null);
    loadGroups();
  };

  // Delete Tag handler
  const handleDeleteTag = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa Thẻ Tag này?")) return;

    await apiClient(`/api/tags/${id}`, { method: "DELETE" });
    if (selectedTagId === id) setSelectedTag(null);
    loadGroups();
  };

  const navMenuItems = [
    {
      label: "Trình nhắn tin",
      href: "/messages",
      icon: MessageSquare,
      badge: "1",
    },
    {
      label: "Danh sách Công việc",
      href: "/tasks",
      icon: CheckSquare,
    },
    {
      label: "Lịch biểu",
      href: "/calendar",
      icon: Calendar,
    },
    {
      label: "AI Knowledge Chat",
      href: "/knowledge-chat",
      icon: MessageSquareCode,
    },
  ];

  return (
    <>
      <aside className="w-72 bg-slate-950 dark:bg-slate-950 light:bg-white border-r border-slate-800/80 light:border-slate-200 flex flex-col h-screen select-none transition-colors duration-200">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 light:border-slate-200 flex items-center justify-between">
          <Link href="/tasks" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-100 light:text-slate-900 group-hover:text-indigo-400 transition-colors">
                QLCôngViệc
              </h1>
              <span className="text-[10px] text-slate-400 light:text-slate-500 font-mono block -mt-0.5">
                Clean Architecture
              </span>
            </div>
          </Link>
        </div>

        {/* Sidebar Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {/* 1. Active Timer Widget */}
          <ActiveTimerWidget />

          {/* 2. Main Navigation Menu */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider block mb-2">
              Điều hướng
            </span>
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 light:text-slate-600 light:hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 3. Accordion Group & Tag Filtering (Realtime API Connected) */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60 light:border-slate-200">
            <div className="flex items-center justify-between px-3">
              <span className="text-[11px] font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider">
                Nhóm & Thẻ Tag
              </span>

              <div className="flex items-center gap-1">
                {(selectedGroupId || selectedTagId) && (
                  <button
                    onClick={clearGroupTagFilters}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium mr-1"
                    title="Bỏ chọn Lọc"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                )}

                {/* Add Group Button */}
                <button
                  onClick={() => setIsGroupModalOpen(true)}
                  className="p-1 rounded-lg text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors"
                  title="Thêm Nhóm công việc"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {isLoading ? (
                <div className="p-3 text-xs text-slate-500 animate-pulse">Đang tải danh sách...</div>
              ) : groups.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 text-center">Chưa có Nhóm công việc</div>
              ) : (
                groups.map((group) => {
                  const isOpen = openGroupIds.includes(group.id);
                  const isGroupSelected = selectedGroupId === group.id;

                  return (
                    <div key={group.id} className="space-y-1 group/item">
                      {/* Group Header Item */}
                      <div
                        onClick={() => setSelectedGroup(group.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                          isGroupSelected
                            ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                            : "text-slate-300 hover:bg-slate-900/40 light:text-slate-700 light:hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: group.color || "#6366f1" }}
                          />
                          <span className="truncate">{group.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Add Tag to this Group button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetGroupIdForTag(group.id);
                              setIsTagModalOpen(true);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-indigo-400 text-slate-500 transition-opacity"
                            title="Thêm Tag cho Nhóm này"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          {/* Delete Group button */}
                          <button
                            onClick={(e) => handleDeleteGroup(e, group.id)}
                            className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition-opacity"
                            title="Xóa Nhóm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {isGroupSelected && <Check className="w-3 h-3 text-indigo-400" />}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroupAccordion(group.id);
                            }}
                            className="p-1 hover:text-white text-slate-500 transition-colors"
                          >
                            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Tag List inside Accordion */}
                      {isOpen && group.tags && group.tags.length > 0 && (
                        <div className="pl-6 space-y-0.5 border-l border-slate-800/80 ml-4 py-1">
                          {group.tags.map((tag) => {
                            const isTagSelected = selectedTagId === tag.id;
                            return (
                              <div
                                key={tag.id}
                                onClick={() => setSelectedTag(tag.id)}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all group/tagitem ${
                                  isTagSelected
                                    ? "bg-indigo-600 text-white font-bold shadow-sm"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 light:text-slate-600 light:hover:bg-slate-100"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <TagIcon className="w-3 h-3 opacity-60 flex-shrink-0" />
                                  <span className="truncate">{tag.name}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => handleDeleteTag(e, tag.id)}
                                    className="opacity-0 group-hover/tagitem:opacity-100 p-0.5 hover:text-rose-300 text-slate-400 transition-opacity"
                                    title="Xóa Tag"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                  {isTagSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 4. Bottom Menu & Theme Toggle */}
        <div className="p-4 border-t border-slate-800/80 light:border-slate-200 space-y-3">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/settings"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 light:text-slate-600 light:hover:bg-slate-100"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt hệ thống</span>
          </Link>

          {/* Theme Switcher */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 light:bg-slate-100 border border-slate-800/80 light:border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 light:text-slate-600 px-2">
              Giao diện {theme === "dark" ? "Tối" : "Sáng"}
            </span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-800 light:bg-white text-indigo-400 hover:text-indigo-300 shadow-sm transition-all flex items-center justify-center"
              title="Chuyển chế độ Dark/Light"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Create Group Dialog Modal */}
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSuccess={loadGroups}
      />

      {/* Create Tag Dialog Modal */}
      <CreateTagModal
        isOpen={isTagModalOpen}
        groups={groups}
        defaultGroupId={targetGroupIdForTag}
        onClose={() => {
          setIsTagModalOpen(false);
          setTargetGroupIdForTag(null);
        }}
        onSuccess={loadGroups}
      />
    </>
  );
}
