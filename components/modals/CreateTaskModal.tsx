"use client";

import { useState, useEffect } from "react";
import { X, CheckSquare, Layers, Tag as TagIcon, Calendar, BookOpen, Check } from "lucide-react";
import { Group, Tag } from "@/types";
import { apiClient } from "@/lib/frontend/api-client";

interface CreateTaskModalProps {
  isOpen: boolean;
  groups: (Group & { tags: Tag[] })[];
  defaultGroupId?: string | null;
  defaultTagId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTaskModal({
  isOpen,
  groups,
  defaultGroupId,
  defaultTagId,
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>("");
  const [isKnowledgeNote, setIsKnowledgeNote] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultGroupId) {
      setSelectedGroupId(defaultGroupId);
    } else if (groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
  }, [defaultGroupId, groups]);

  useEffect(() => {
    if (defaultTagId) {
      setSelectedTagIds([defaultTagId]);
    }
  }, [defaultTagId]);

  if (!isOpen) return null;

  // Available tags under the currently selected group
  const activeGroup = groups.find((g) => g.id === selectedGroupId);
  const availableTags = activeGroup ? activeGroup.tags : [];

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tên công việc");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await apiClient("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        group_id: selectedGroupId || null,
        tag_ids: selectedTagIds,
        due_date: dueDate || null,
        is_knowledge_note: isKnowledgeNote,
      }),
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setTitle("");
      setSelectedTagIds([]);
      setDueDate("");
      setIsKnowledgeNote(false);
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold">Thêm Công Việc Mới (Quick Create)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Tên Công Việc (*)</label>
            <input
              type="text"
              placeholder="VD: Viết API route /api/tasks & hoàn thiện UI Filter..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Select Group */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Thuộc Nhóm Công Việc</span>
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                setSelectedTagIds([]); // reset selected tags when group changes
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">-- Không chọn Nhóm --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Selection */}
          {availableTags.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Chọn Thẻ Tag (Thuộc nhóm {activeGroup?.name})</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTagSelection(tag.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <span>#{tag.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Due Date & Knowledge Note Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Hạn chót (Due Date)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 mt-auto">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200">Ghi Chú Tri Thức</span>
              </div>
              <input
                type="checkbox"
                checked={isKnowledgeNote}
                onChange={(e) => setIsKnowledgeNote(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Tạo Công Việc"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
