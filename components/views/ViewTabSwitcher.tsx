"use client";

import { LayoutList, Kanban, Calendar } from "lucide-react";

export type ViewMode = "list" | "kanban" | "calendar";

interface ViewTabSwitcherProps {
  currentView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export function ViewTabSwitcher({ currentView, onViewChange }: ViewTabSwitcherProps) {
  const views = [
    { id: "list" as const, label: "View List", icon: LayoutList },
    { id: "kanban" as const, label: "View Kanban", icon: Kanban },
    { id: "calendar" as const, label: "View Calendar", icon: Calendar },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 light:bg-slate-100 border border-slate-800/80 light:border-slate-200">
      {views.map((v) => {
        const Icon = v.icon;
        const isActive = currentView === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:bg-slate-200"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
