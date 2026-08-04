import { Group, Tag, Task } from "@/types";

export const MOCK_GROUPS: (Group & { tags: Tag[] })[] = [
  {
    id: "group-1",
    name: "Phát triển Sản phẩm",
    color: "#6366f1", // Indigo
    createdAt: new Date().toISOString(),
    tags: [
      { id: "tag-1", name: "Frontend", groupId: "group-1" },
      { id: "tag-2", name: "Backend", groupId: "group-1" },
      { id: "tag-3", name: "UI/UX", groupId: "group-1" },
    ],
  },
  {
    id: "group-2",
    name: "Quản lý Dự án",
    color: "#10b981", // Emerald
    createdAt: new Date().toISOString(),
    tags: [
      { id: "tag-4", name: "Sprint 1", groupId: "group-2" },
      { id: "tag-5", name: "Họp Team", groupId: "group-2" },
      { id: "tag-6", name: "Báo cáo", groupId: "group-2" },
    ],
  },
  {
    id: "group-3",
    name: "Ghi chú & Tri thức",
    color: "#f59e0b", // Amber
    createdAt: new Date().toISOString(),
    tags: [
      { id: "tag-7", name: "RAG AI", groupId: "group-3" },
      { id: "tag-8", name: "Supabase DB", groupId: "group-3" },
    ],
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "task-101",
    title: "Khởi tạo Clean Architecture Next.js 14 App Router",
    status: "done",
    groupId: "group-1",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    isKnowledgeNote: false,
    createdAt: new Date().toISOString(),
    tags: [{ id: "tag-1", name: "Frontend", groupId: "group-1" }],
  },
  {
    id: "task-102",
    title: "Viết Migration SQL cho Supabase PostgreSQL & pgvector",
    status: "done",
    groupId: "group-1",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    isKnowledgeNote: true,
    createdAt: new Date().toISOString(),
    tags: [{ id: "tag-2", name: "Backend", groupId: "group-1" }],
  },
  {
    id: "task-103",
    title: "Xây dựng Dashboard Layout, Sidebar & Active Timer Widget",
    status: "in_progress",
    groupId: "group-1",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    isKnowledgeNote: false,
    createdAt: new Date().toISOString(),
    tags: [{ id: "tag-1", name: "Frontend", groupId: "group-1" }],
  },
  {
    id: "task-104",
    title: "Triển khai RAG Embedding Pipeline với Vector Search",
    status: "todo",
    groupId: "group-3",
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    isKnowledgeNote: true,
    createdAt: new Date().toISOString(),
    tags: [{ id: "tag-7", name: "RAG AI", groupId: "group-3" }],
  },
];
