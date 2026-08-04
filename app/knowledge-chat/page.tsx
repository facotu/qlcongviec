"use client";

import { useState, useEffect, useCallback } from "react";
import { Group, Tag } from "@/types";
import { apiClient } from "@/lib/frontend/api-client";
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Database,
  Bot,
  User,
  Tag as TagIcon,
  Layers,
  FileText,
  Bookmark,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface Citation {
  id: string;
  sourceNumber: number;
  snippet: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

interface MessageItem {
  id: string;
  sender: "user" | "bot";
  text: string;
  citations?: Citation[];
  timestamp: string;
}

export default function KnowledgeChatPage() {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "msg-init",
      sender: "bot",
      text: "Xin chào! Tôi là AI Assistant tích hợp RAG Search & pgvector. Hãy đặt câu hỏi hoặc tra cứu các quy trình, ghi chú tri thức đã lưu trong hệ thống.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  // Group & Tag Context Filter State
  const [groups, setGroups] = useState<(Group & { tags: Tag[] })[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>("all");

  const loadGroups = useCallback(async () => {
    const res = await apiClient<(Group & { tags: Tag[] })[]>("/api/groups");
    if (res.data) setGroups(res.data);
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const allTags = groups.flatMap((g) => g.tags);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userQuery = input.trim();
    setInput("");

    const userMessage: MessageItem = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    // Read stored API Key & System Prompt from LocalStorage
    const customApiKey = typeof window !== "undefined" ? localStorage.getItem("ql_custom_api_key") || "" : "";
    const customPrompt = typeof window !== "undefined" ? localStorage.getItem("ql_system_prompt") || "" : "";

    // Call Backend API Endpoint POST /api/ai/chat
    const res = await apiClient<{
      reply: string;
      citations: Citation[];
    }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        message: userQuery,
        selected_tag_id: selectedTagId,
        custom_api_key: customApiKey,
        custom_system_prompt: customPrompt,
      }),
    });

    setIsSending(false);

    if (res.error) {
      const errorMessage: MessageItem = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: `Rất tiếc, đã xảy ra lỗi khi kết nối với AI Service: ${res.error}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } else if (res.data) {
      const botMessage: MessageItem = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: res.data.reply,
        citations: res.data.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header & Context Selector Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-indigo-400" />
            AI Knowledge Chatbot (RAG Vector Search)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hỏi đáp thông minh kết hợp Supabase pgvector 1536d & RAG Citations Footnote
          </p>
        </div>

        {/* Tag Context Selector */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <TagIcon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="text-slate-400 font-medium">Phạm vi Ngữ cảnh:</span>
          <select
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả Tri Thức</option>
            {allTags.map((t) => (
              <option key={t.id} value={t.id}>
                #{t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Sender Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble & Citations */}
            <div className={`space-y-2 max-w-2xl ${msg.sender === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block p-4 rounded-2xl text-xs leading-relaxed shadow-lg whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-500 font-mono block px-1">
                {msg.timestamp}
              </span>

              {/* Citations Footnote section for AI responses */}
              {msg.sender === "bot" && msg.citations && msg.citations.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-left animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    <Bookmark className="w-3 h-3 text-purple-400" />
                    <span>Nguồn Trích Dẫn Tri Thức (RAG Citations Footnote)</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {msg.citations.map((c) => (
                      <div
                        key={c.id}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] space-y-1 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-mono text-[10px] text-indigo-300 font-bold">
                            [{c.sourceNumber}] Match {c.similarity}%
                          </span>
                          {Boolean(c.metadata?.taskId) && (
                            <span className="font-mono text-[9px] text-slate-500">
                              Task ID: {String(c.metadata?.taskId).slice(0, 8)}...
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-tight italic">
                          &quot;{c.snippet}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-3 text-xs text-indigo-400 animate-pulse">
            <Bot className="w-4 h-4" />
            <span>AI đang truy vấn Vector Embeddings và tổng hợp phản hồi...</span>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Nhập thắc mắc hoặc câu hỏi tra cứu tri thức..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Gửi</span>
        </button>
      </div>
    </div>
  );
}
