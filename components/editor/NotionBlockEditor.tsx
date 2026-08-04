"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Code,
  Quote,
  Sparkles,
  Check,
  Save,
  Command,
} from "lucide-react";

interface NotionBlockEditorProps {
  initialContent?: Record<string, unknown> | string;
  onSave: (content: Record<string, unknown>) => Promise<void>;
}

export function NotionBlockEditor({ initialContent, onSave }: NotionBlockEditorProps) {
  // Extract initial text or stringify json content
  const getInitialText = () => {
    if (!initialContent) return "";
    if (typeof initialContent === "string") return initialContent;
    if (typeof initialContent === "object" && "text" in initialContent) {
      return String(initialContent.text);
    }
    return JSON.stringify(initialContent, null, 2);
  };

  const [text, setText] = useState<string>(getInitialText());
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
  const [slashQuery, setSlashQuery] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced auto-save handler (1.5 seconds)
  useEffect(() => {
    setSaveStatus("unsaved");
    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      await onSave({ text, type: "notion-doc", updatedAt: new Date().toISOString() });
      setSaveStatus("saved");
    }, 1500);

    return () => clearTimeout(timer);
  }, [text, onSave]);

  // Handle Slash Command Trigger
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastLine = textBeforeCursor.split("\n").pop() || "";

    if (lastLine.startsWith("/")) {
      setShowSlashMenu(true);
      setSlashQuery(lastLine.slice(1).toLowerCase());
    } else {
      setShowSlashMenu(false);
    }
  };

  // Slash Menu Items
  const slashItems = [
    {
      id: "h1",
      label: "Heading 1",
      snippet: "# ",
      icon: Heading1,
      desc: "Tiêu đề lớn",
    },
    {
      id: "h2",
      label: "Heading 2",
      snippet: "## ",
      icon: Heading2,
      desc: "Tiêu đề vừa",
    },
    {
      id: "h3",
      label: "Heading 3",
      snippet: "### ",
      icon: Heading3,
      desc: "Tiêu đề nhỏ",
    },
    {
      id: "bullet",
      label: "Bullet List",
      snippet: "- ",
      icon: List,
      desc: "Danh sách dạng chấm",
    },
    {
      id: "todo",
      label: "Task List",
      snippet: "[ ] ",
      icon: CheckSquare,
      desc: "Danh sách công việc checkbox",
    },
    {
      id: "code",
      label: "Code Block",
      snippet: "```\n\n```",
      icon: Code,
      desc: "Khối mã lập trình",
    },
    {
      id: "quote",
      label: "Quote",
      snippet: "> ",
      icon: Quote,
      desc: "Trích dẫn",
    },
  ];

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastLineIndex = textBeforeCursor.lastIndexOf("\n");
    const lineStart = lastLineIndex === -1 ? 0 : lastLineIndex + 1;

    const newText = text.slice(0, lineStart) + snippet + text.slice(cursorPos);
    setText(newText);
    setShowSlashMenu(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + snippet.length, lineStart + snippet.length);
    }, 50);
  };

  const filteredItems = slashItems.filter((item) =>
    item.label.toLowerCase().includes(slashQuery)
  );

  return (
    <div className="space-y-3 relative">
      {/* Editor Header Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Command className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gõ <code className="px-1 rounded bg-slate-800 text-indigo-300 font-mono">/</code> để mở Slash Command</span>
        </div>

        {/* Auto-save Status Indicator */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          {saveStatus === "saving" ? (
            <span className="text-amber-400 flex items-center gap-1">
              <Save className="w-3 h-3 animate-spin" /> Đang tự động lưu...
            </span>
          ) : saveStatus === "saved" ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Đã lưu (Auto-save 1.5s)
            </span>
          ) : (
            <span className="text-slate-500">Đang chỉnh sửa...</span>
          )}
        </div>
      </div>

      {/* Main Textarea Block Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder="Nhập nội dung ghi chú chi tiết theo phong cách Notion... (Gõ / để chèn H1-H3, bullet points, task list, code block)"
          rows={14}
          className="w-full p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/80 leading-relaxed font-mono resize-y shadow-inner"
        />

        {/* Slash Command Dropdown Menu */}
        {showSlashMenu && (
          <div className="absolute left-4 top-12 z-50 w-64 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800">
              CHÈN KHỐI NOTION BLOCK
            </div>
            {filteredItems.length === 0 ? (
              <div className="p-2 text-xs text-slate-500">Không tìm thấy lệnh phù hợp</div>
            ) : (
              filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => insertSnippet(item.snippet)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left hover:bg-indigo-600 hover:text-white text-slate-200 transition-colors group"
                  >
                    <div className="p-1 rounded bg-slate-800 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 group-hover:text-indigo-100">{item.desc}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
