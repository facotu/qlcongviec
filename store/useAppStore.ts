import { create } from "zustand";
import { UserProfile, FilterSettings, TaskStatus } from "@/types";
import { apiClient } from "@/lib/frontend/api-client";

interface TimerState {
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  seconds: number;
  isRunning: boolean;
}

interface AppState {
  // 1. Active Timer State
  timer: TimerState;
  startTimer: (taskId?: string, taskTitle?: string) => void;
  stopTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;

  // Realtime API Timer Actions
  startTimerApi: (taskId: string, taskTitle: string) => Promise<void>;
  stopTimerApi: () => Promise<void>;

  // 2. Selected Filter State (Group & Tag & Search)
  selectedGroupId: string | null;
  selectedTagId: string | null;
  filterSettings: FilterSettings;
  setSelectedGroup: (groupId: string | null) => void;
  setSelectedTag: (tagId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: FilterSettings["statusFilter"]) => void;
  setSortBy: (sortBy: FilterSettings["sortBy"]) => void;
  clearGroupTagFilters: () => void;
  resetFilters: () => void;

  // 3. User State
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;

  // 4. Theme State (Dark / Light)
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

const initialFilterSettings: FilterSettings = {
  searchQuery: "",
  statusFilter: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
  dateRange: {
    startDate: null,
    endDate: null,
  },
};

export const useAppStore = create<AppState>((set, get) => ({
  // Timer State Implementation
  timer: {
    activeTaskId: "task-103",
    activeTaskTitle: "Xây dựng Dashboard Layout & Active Timer Widget",
    seconds: 145,
    isRunning: true,
  },
  startTimer: (taskId, taskTitle) =>
    set((state) => ({
      timer: {
        activeTaskId: taskId || state.timer.activeTaskId || "custom-task",
        activeTaskTitle: taskTitle || state.timer.activeTaskTitle || "Công việc tự do",
        seconds: state.timer.seconds,
        isRunning: true,
      },
    })),
  stopTimer: () =>
    set((state) => ({
      timer: { ...state.timer, isRunning: false },
    })),
  resetTimer: () =>
    set((state) => ({
      timer: { ...state.timer, seconds: 0, isRunning: false },
    })),
  tickTimer: () =>
    set((state) => ({
      timer: { ...state.timer, seconds: state.timer.seconds + 1 },
    })),

  // API Integrated Timer Actions
  startTimerApi: async (taskId: string, taskTitle: string) => {
    // 1. Call POST /api/timer/start backend
    await apiClient("/api/timer/start", {
      method: "POST",
      body: JSON.stringify({ task_id: taskId }),
    });

    // 2. Update Zustand store
    set({
      timer: {
        activeTaskId: taskId,
        activeTaskTitle: taskTitle,
        seconds: 0,
        isRunning: true,
      },
    });
  },

  stopTimerApi: async () => {
    const currentTaskId = get().timer.activeTaskId;

    // 1. Call POST /api/timer/stop backend
    await apiClient("/api/timer/stop", {
      method: "POST",
      body: JSON.stringify({ task_id: currentTaskId }),
    });

    // 2. Update Zustand store
    set((state) => ({
      timer: { ...state.timer, isRunning: false },
    }));
  },

  // Selected Group & Tag & Search Filters
  selectedGroupId: null,
  selectedTagId: null,
  filterSettings: initialFilterSettings,
  setSelectedGroup: (groupId) =>
    set((state) => ({
      selectedGroupId: state.selectedGroupId === groupId ? null : groupId,
      selectedTagId: null,
    })),
  setSelectedTag: (tagId) =>
    set((state) => ({
      selectedTagId: state.selectedTagId === tagId ? null : tagId,
    })),
  setSearchQuery: (query) =>
    set((state) => ({
      filterSettings: { ...state.filterSettings, searchQuery: query },
    })),
  setStatusFilter: (status) =>
    set((state) => ({
      filterSettings: { ...state.filterSettings, statusFilter: status },
    })),
  setSortBy: (sortBy) =>
    set((state) => ({
      filterSettings: { ...state.filterSettings, sortBy: sortBy },
    })),
  clearGroupTagFilters: () => set({ selectedGroupId: null, selectedTagId: null }),
  resetFilters: () =>
    set({
      selectedGroupId: null,
      selectedTagId: null,
      filterSettings: initialFilterSettings,
    }),

  // User State
  currentUser: {
    id: "user-admin-01",
    email: "architect@qlcongviec.vn",
    fullName: "Nguyễn Văn Admin",
    role: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  setCurrentUser: (user) => set({ currentUser: user }),

  // Theme Implementation
  theme: "dark",
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        }
      }
      return { theme: nextTheme };
    }),
  setTheme: (theme) =>
    set(() => {
      if (typeof window !== "undefined") {
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        }
      }
      return { theme };
    }),
}));
