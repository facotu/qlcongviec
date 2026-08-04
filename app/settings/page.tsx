"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Settings as SettingsIcon, Sun, Moon, Key, Database, User, Save, Check, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme, currentUser } = useAppStore();

  const [apiKey, setApiKey] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("ql_custom_api_key") || "";
      const savedPrompt =
        localStorage.getItem("ql_system_prompt") ||
        "Bạn là AI Assistant thông minh của hệ thống QLCôngViệc. Hãy dựa vào ngữ cảnh RAG trích dẫn để trả lời chính xác, hữu ích.";
      setApiKey(savedKey);
      setSystemPrompt(savedPrompt);
    }
  }, []);

  const handleSaveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ql_custom_api_key", apiKey.trim());
      localStorage.setItem("ql_system_prompt", systemPrompt.trim());
      setSaveStatus("Đã lưu cấu hình vào LocalStorage thành công!");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800/60 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          Cài Đặt Hệ Thống & AI Chatbot Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Quản lý API Key cá nhân, Custom System Prompt và lưu trữ vào LocalStorage
        </p>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Card 1: User Profile Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" /> Thông Tin Người Dùng
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Họ & Tên</label>
              <input
                type="text"
                readOnly
                value={currentUser?.fullName || ""}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Email</label>
              <input
                type="text"
                readOnly
                value={currentUser?.email || ""}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Card 2: AI Key & Custom System Prompt Configuration */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" /> AI Service & System Prompt (LocalStorage)
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
              Encrypted Local Storage
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Custom Gemini / OpenAI API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy... hoặc sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Khóa API sẽ được lưu trực tiếp tại Browser LocalStorage và chỉ gửi khi thực hiện truy vấn AI Chat.
              </p>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Custom System Instruction Prompt</span>
              </label>
              <textarea
                rows={4}
                placeholder="Nhập câu lệnh định hướng phong cách trả lời cho AI Assistant..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cấu Hình AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Theme Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" /> Giao Diện Hệ Thống (Theme Mode)
          </h2>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-300 font-medium">Chế độ hiển thị</p>
              <p className="text-[11px] text-slate-500">Đang sử dụng: {theme.toUpperCase()} MODE</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>Chuyển thành Mode {theme === "dark" ? "Sáng" : "Tối"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
