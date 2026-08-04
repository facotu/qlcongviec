# 🚀 QLCôngViệc - Full-Stack Clean Architecture Task & Knowledge Platform

Dự án Quản lý công việc và cơ sở tri thức thông minh (Task Management & AI Knowledge Base Platform) được thiết kế theo chuẩn kiến trúc **Clean Architecture** sử dụng Next.js 14 App Router, TypeScript, Zustand, Tailwind CSS, Supabase SSR & PostgreSQL pgvector.

---

## 🌟 Tính Năng Nổi Bật

- **Clean Architecture & App Router**: Phân chia các tầng UI, Backend Services, Custom Hooks, Zustand Store & Types rõ ràng.
- **3 Chế Độ Xem Công Việc**:
  - **View List**: Dạng bảng chi tiết với Status Checkbox, Timer Control, Total Duration tích lũy và Hạn chót.
  - **View Kanban**: Bảng kéo-thả 3 cột (To Do, In Progress, Done) với cơ chế **Optimistic Update** tức thì (`@hello-pangea/dnd`).
  - **View Calendar**: Giao diện Lịch biểu tự động sắp xếp công việc theo Hạn chót (Due Date).
- **Time Tracking Engine**: Tự động chốt phiên làm việc cũ, tạo phiên đếm mới, chuyển trạng thái Task thành `in_progress` và nhảy đồng hồ `hh:mm:ss` thời gian thực trên Sidebar Widget.
- **Full-Stack Groups & Tags**: Quản lý Nhóm và Thẻ Tag con với ràng buộc 1 Tag chỉ thuộc 1 Group duy nhất, kèm Dialog Modals và Realtime Revalidation.
- **Slide-Over Task Detail Drawer & Notion Block Editor**: Drawer trượt từ cạnh phải màn hình với Editor dạng Block hỗ trợ Slash Command (`/` chèn H1-H3, bullet points, task list, code block) và **Tự động lưu (Auto-save 1.5s)**.
- **RAG AI Knowledge Engine**: Chunking văn bản (300-500 words, 50 overlap), Vector Embedding 1536 chiều, Supabase `pgvector` HNSW Index & PostgreSQL RPC Function `match_knowledge` hỗ trợ lọc theo Thẻ Tag.
- **AI Chatbot Streaming & Citations Footnote**: Khung hỏi đáp AI thông minh với Tag Context Selector và Footnote hiển thị nguồn trích dẫn tri thức minh bạch.

---

## 🛠 Cấu Trúc Thư Mục Clean Architecture

```text
qlcongviec/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── api/                    # Backend API Routes (/health, /groups, /tags, /tasks, /timer, /rag, /ai)
│   ├── (routes)/               # Pages (tasks, calendar, knowledge-chat, settings)
│   ├── globals.css             # Tailwind CSS Base & Theme Variables
│   ├── layout.tsx              # Root Layout bọc ThemeProvider, Sidebar, Header
│   └── page.tsx                # Main Landing Page
├── components/                 # UI Components System
│   ├── editor/                 # NotionBlockEditor component với Slash Commands
│   ├── layout/                 # Sidebar, Header, ActiveTimerWidget
│   ├── modals/                 # CreateGroupModal, CreateTagModal, CreateTaskModal
│   ├── providers/              # ThemeProvider (Dark / Light mode)
│   ├── tasks/                  # TaskDetailDrawer, TopFilterBar
│   └── views/                  # TaskListView, TaskKanbanView, TaskCalendarView, ViewTabSwitcher
├── lib/                        # Core Application Libraries & Layer Separation
│   ├── backend/                # Server-Only: Supabase Admin Client, DB Queries, RAG Engine
│   ├── frontend/               # Client-Only: Fetch API Client, Custom Hooks
│   ├── mock-data.ts            # Local Development Mock Data
│   └── utils.ts                # Tailwind class merging helper (cn)
├── store/                      # Zustand Global State Management (Timer, User, Filters, Theme)
├── supabase/                   # Database Schema DDL & Migration Scripts
│   ├── migrations/             # SQL Migrations (Init schema, Vector search, RLS policies)
│   ├── schema.sql              # Single-file Consolidated Schema DDL for SQL Editor
│   └── seed.sql                # Seed Data for quick Database testing
├── types/                      # Shared TypeScript Interfaces (Frontend & Backend)
├── .env.local                  # Environment Variables Template
├── package.json                # Project Dependencies & Scripts
├── tailwind.config.ts          # Tailwind Configuration
└── tsconfig.json               # TypeScript Configuration
```

---

## 🔑 Sơ Đồ Biến Môi Trường (Environment Variables)

File `.env.local` mẫu hỗ trợ cả môi trường Client-side và Server-side:

```env
# ==========================================
# PUBLIC CLIENT-SIDE ENVIRONMENT VARIABLES
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==========================================
# PRIVATE SERVER-SIDE ENVIRONMENT VARIABLES (NEVER EXPOSE TO BROWSER)
# ==========================================
# Supabase Admin Service Role Key (Bypass RLS for Backend Server-side Ops)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# AI Service Keys (Server-side Embeddings & LLM Generation)
OPENAI_API_KEY=your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### Bảng Tra Cứu Biến Môi Trường:

| Biến Môi Trường | Môi Trường | Mục Đích Sử Dụng |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client/Server) | Đường dẫn Endpoint dự án Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client/Server) | Khóa Public Anonymous Key khởi tạo Supabase Client phía Frontend. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Private (Server-Only)** | Khóa đặc quyền Service Role Admin cho Backend API bypass RLS. |
| `OPENAI_API_KEY` | **Private (Server-Only)** | Khóa API OpenAI tạo 1536d Vector Embeddings (`text-embedding-3-small`). |
| `GEMINI_API_KEY` | **Private (Server-Only)** | Khóa API Google Gemini 2.5 Flash / Embeddings (`text-embedding-004`). |

---

## 🗄️ Hướng Dẫn Nạp SQL Migration Trên Supabase

Bạn chỉ cần thực hiện 3 bước đơn giản để nạp toàn bộ cấu trúc Database vào Supabase:

1. **Sao chép nội dung SQL**:
   Mở file [supabase/schema.sql](file:///m:/GitHub/qlcongviec/supabase/schema.sql) và chọn **Copy toàn bộ nội dung**.

2. **Mở Supabase SQL Editor**:
   Truy cập [Supabase Dashboard](https://supabase.com/dashboard) -> Chọn dự án của bạn -> Mở thanh điều hướng bên trái -> Chọn **SQL Editor**.

3. **Thực thi SQL Script**:
   Tạo mới một tab SQL Query, dán toàn bộ nội dung đã copy và bấm nút **Run** (Ctrl + Enter).
   > **Kết quả thu được**: Hệ thống sẽ kích hoạt extension `vector`, tạo 6 bảng dữ liệu (`groups`, `tags`, `tasks`, `task_tags`, `time_trackings`, `vector_embeddings`), khởi tạo HNSW Vector Index, tạo RPC Function `match_knowledge` và bật Row Level Security (RLS).

*(Tùy chọn)*: Bạn có thể copy tiếp file [supabase/seed.sql](file:///m:/GitHub/qlcongviec/supabase/seed.sql) dán vào SQL Editor và chạy để nạp ngay dữ liệu thử nghiệm!

---

## ☁️ Hướng Dẫn Deploy 1-Click Lên Vercel

### Bước 1: Push Mã Nguồn Lên GitHub
```bash
git init
git add .
git commit -m "Feat: Complete QLCongViec Full-Stack Clean Architecture"
git branch -M main
git remote add origin https://github.com/your-username/qlcongviec.git
git push -u origin main
```

### Bước 2: Import Dự Án Trên Vercel
1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard) và bấm **Add New...** -> **Project**.
2. Chọn Repository `qlcongviec` từ tài khoản GitHub của bạn.
3. Chọn **Framework Preset**: Next.js.

### Bước 3: Cấu Hình Biến Môi Trường (Environment Variables)
Tại mục **Environment Variables** trên giao diện Vercel Deployment, thêm các biến sau:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY` = `your-supabase-service-role-key`
- `GEMINI_API_KEY` = `your-gemini-api-key`
- `OPENAI_API_KEY` = `your-openai-api-key`

### Bước 4: Kích Hoạt Deploy
Bấm nút **Deploy**. Vercel sẽ tự động build và cung cấp cho bạn một tên miền Production chuyên nghiệp (Ví dụ: `https://qlcongviec.vercel.app`)!

---

## 💻 Hướng Dẫn Chạy Cục Bộ (Local Development)

```bash
# 1. Cài đặt các thư viện
npm install

# 2. Khởi chạy server phát triển
npm run dev

# 3. Mở trình duyệt và truy cập
http://localhost:3000
```

---

## 📄 Giấy Phép (License)
Dự án được phát triển dưới giấy phép MIT License.
