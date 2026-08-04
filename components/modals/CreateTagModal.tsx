"use client";

import { useState, useEffect } from "react";
import { X, Tag as TagIcon, Layers } from "lucide-react";
import { Group } from "@/types";
import { apiClient } from "@/lib/frontend/api-client";

interface CreateTagModalProps {
  isOpen: boolean;
  groups: Group[];
  defaultGroupId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTagModal({
  isOpen,
  groups,
  defaultGroupId,
  onClose,
  onSuccess,
}: CreateTagModalProps) {
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultGroupId) {
      setGroupId(defaultGroupId);
    } else if (groups.length > 0) {
      setGroupId(groups[0].id);
    }
  }, [defaultGroupId, groups]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên thẻ Tag");
      return;
    }
    if (!groupId) {
      setError("Vui lòng chọn Nhóm công việc cho Tag này (1 Tag chỉ thuộc 1 Group)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await apiClient("/api/tags", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), group_id: groupId }),
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setName("");
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TagIcon className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold">Thêm Thẻ Tag Mới</h2>
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

          {/* Select Parent Group */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Thuộc Nhóm Công Việc (*)</span>
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="" disabled>-- Chọn Nhóm --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Tên Thẻ Tag (*)</label>
            <input
              type="text"
              placeholder="VD: Frontend, Urgent, Database, Bug..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
            />
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
              {isSubmitting ? "Đang tạo..." : "Tạo Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
