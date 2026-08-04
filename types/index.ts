/**
 * Common TypeScript interfaces shared between Frontend and Backend
 */

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Group {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  groupId: string;
  createdAt?: string;
  group?: Group;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  groupId?: string | null;
  dueDate?: string | null;
  notionContent?: Record<string, unknown>;
  isKnowledgeNote: boolean;
  createdAt: string;
  group?: Group;
  tags?: Tag[];
  totalDurationSeconds?: number;
}

export interface TaskFilterOptions {
  groupId?: string | null;
  tagId?: string | null;
  status?: TaskStatus | 'all';
  search?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
}

export interface TimeTracking {
  id: string;
  taskId: string;
  startAt: string;
  endAt?: string | null;
  durationSeconds?: number;
  createdAt: string;
  task?: Task;
}

export interface VectorEmbedding {
  id: string;
  taskId?: string | null;
  tagId?: string | null;
  content: string;
  embedding?: number[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'member' | 'guest';
  avatarUrl?: string;
  createdAt: string;
}

export interface ApiHealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  service: string;
  environment: string;
  uptime: number;
  checks: {
    database: 'connected' | 'disconnected' | 'pending';
    storage: 'available' | 'unavailable';
    ragService: 'ready' | 'standby';
  };
}

export interface FilterSettings {
  searchQuery: string;
  statusFilter: 'all' | TaskStatus;
  sortBy: 'createdAt' | 'dueDate' | 'title';
  sortOrder: 'asc' | 'desc';
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

export interface RagQueryOptions {
  query: string;
  topK?: number;
  threshold?: number;
  category?: string;
}

export interface RagQueryResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}
