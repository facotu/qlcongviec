"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChatChannel, ChatMessage, NotificationItem } from "@/types";
import { apiClient } from "@/lib/frontend/api-client";
import {
  MessageSquare,
  Search,
  PenSquare,
  Users,
  Bot,
  Newspaper,
  Bookmark,
  Send,
  Paperclip,
  Smile,
  Bell,
  Sparkles,
  Phone,
  Video,
  UserPlus,
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

type TopTabMode = "chat" | "task_chat" | "copilot" | "projects" | "channels" | "open_channels" | "notifications";

export default function Bitrix24MessengerPage() {
  const [activeTopTab, setActiveTopTab] = useState<TopTabMode>("chat");
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Notifications State for "Thông báo" tab
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat feed to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load Channels List
  const loadChannels = useCallback(async () => {
    const res = await apiClient<ChatChannel[]>("/api/chat/channels");
    if (res.data) setChannels(res.data);
  }, []);

  // Load Messages for Selected Channel
  const loadMessages = useCallback(async (channelId: string) => {
    setIsLoadingMessages(true);
    const res = await apiClient<ChatMessage[]>(`/api/chat/messages?channel_id=${channelId}`);
    if (res.data) setMessages(res.data);
    setIsLoadingMessages(false);
    setTimeout(scrollToBottom, 100);
  }, []);

  // Load System Notifications for Notifications Tab
  const loadNotifications = useCallback(async () => {
    const res = await apiClient<NotificationItem[]>("/api/notifications");
    if (res.data) setNotifications(res.data);
  }, []);

  useEffect(() => {
    loadChannels();
    loadNotifications();
  }, [loadChannels, loadNotifications]);

  useEffect(() => {
    if (selectedChannelId) {
      loadMessages(selectedChannelId);
    }
  }, [selectedChannelId, loadMessages]);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  // Handle Sending New Message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChannelId || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    // Optimistic local update
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      channelId: selectedChannelId,
      senderName: "Tôi",
      content: userText,
      isAi: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsSending(true);
    setTimeout(scrollToBottom, 50);

    // Read stored Custom API Key & System Prompt from LocalStorage
    const customApiKey = typeof window !== "undefined" ? localStorage.getItem("ql_custom_api_key") || "" : "";
    const customPrompt = typeof window !== "undefined" ? localStorage.getItem("ql_system_prompt") || "" : "";

    const res = await apiClient<{
      userMessage: ChatMessage;
      aiMessage?: ChatMessage;
    }>("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify({
        channelId: selectedChannelId,
        senderName: "Người dùng",
        content: userText,
        customApiKey,
        customSystemPrompt: customPrompt,
      }),
    });

    setIsSending(false);

    if (res.data) {
      if (res.data.aiMessage) {
        const aiMsg = res.data.aiMessage;
        setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), res.data.userMessage, aiMsg]);
      } else {
        setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), res.data.userMessage]);
      }
      setTimeout(scrollToBottom, 100);
    }
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.latestMessage && c.latestMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-950 light:bg-slate-50 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 light:border-slate-200 shadow-2xl transition-colors">
      {/* 1. TOP BITRIX24 SUB-NAVIGATION BAR */}
      <div className="bg-slate-900/90 light:bg-indigo-900 text-white px-4 py-2.5 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-4 text-xs font-medium scrollbar-none select-none">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Trò chuyện Tab */}
          <button
            onClick={() => setActiveTopTab("chat")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTopTab === "chat"
                ? "bg-white/20 text-white font-bold shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>Trò chuyện</span>
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
              1
            </span>
          </button>

          {/* Cuộc trò chuyện tác vụ Tab */}
          <button
            onClick={() => setActiveTopTab("task_chat")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTopTab === "task_chat"
                ? "bg-white/20 text-white font-bold"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            Cuộc trò chuyện tác vụ
          </button>

          {/* CoPilot Tab */}
          <button
            onClick={() => {
              setActiveTopTab("copilot");
              setSelectedChannelId("chan-support-bot");
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTopTab === "copilot"
                ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30"
                : "text-purple-300 hover:bg-purple-500/20"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>CoPilot</span>
          </button>

          {/* Dự án hợp tác Tab */}
          <button
            onClick={() => setActiveTopTab("projects")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTopTab === "projects"
                ? "bg-white/20 text-white font-bold"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            Dự án hợp tác
          </button>

          {/* Kênh Tab */}
          <button
            onClick={() => setActiveTopTab("channels")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTopTab === "channels"
                ? "bg-white/20 text-white font-bold"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            Kênh
          </button>

          {/* Kênh Mở Tab */}
          <button
            onClick={() => setActiveTopTab("open_channels")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTopTab === "open_channels"
                ? "bg-white/20 text-white font-bold"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            Kênh Mở
          </button>

          {/* Thông báo Tab */}
          <button
            onClick={() => setActiveTopTab("notifications")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTopTab === "notifications"
                ? "bg-white/20 text-white font-bold"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Thông báo</span>
          </button>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-3 flex-shrink-0 text-[11px]">
          <span className="hidden md:inline px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
            Bitrix24 24/7 Active
          </span>
          <button className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md">
            Mua ngay
          </button>
        </div>
      </div>

      {/* 2. MAIN MESSENGER BODY (LEFT CHAT CONVERSATIONS LIST & RIGHT CHAT WINDOW) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: CONVERSATION & CHANNELS LIST */}
        <aside className="w-80 sm:w-88 bg-slate-900/80 light:bg-white border-r border-slate-800 light:border-slate-200 flex flex-col flex-shrink-0">
          {/* Search Bar & New Chat Button */}
          <div className="p-3 border-b border-slate-800 light:border-slate-200 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhân viên hoặc cuộc trò chuyện"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-xs text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setSelectedChannelId("chan-support-bot")}
              className="p-2 rounded-xl bg-indigo-600/20 light:bg-indigo-100 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
              title="Tạo cuộc trò chuyện mới"
            >
              <PenSquare className="w-4 h-4" />
            </button>
          </div>

          {/* Conversations Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 light:divide-slate-100">
            {filteredChannels.map((c) => {
              const isSelected = selectedChannelId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedChannelId(c.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-950/40 light:bg-indigo-50 border-l-4 border-indigo-500"
                      : "hover:bg-slate-800/40 light:hover:bg-slate-100"
                  }`}
                >
                  {/* Channel Avatar */}
                  <div className="relative flex-shrink-0">
                    {c.type === "bot" ? (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                        <Bot className="w-5 h-5" />
                      </div>
                    ) : c.type === "news" ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <Newspaper className="w-5 h-5" />
                      </div>
                    ) : c.type === "general" ? (
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                        <Bookmark className="w-5 h-5" />
                      </div>
                    )}

                    {c.type === "bot" && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[9px] font-bold border-2 border-slate-900">
                        i
                      </span>
                    )}
                  </div>

                  {/* Channel Meta */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-slate-100 light:text-slate-900 truncate">
                        {c.name}
                      </h2>
                      {c.latestTime && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {c.latestTime}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 light:text-slate-600 truncate leading-snug">
                      {c.latestMessage}
                    </p>
                  </div>

                  {/* Unread Counter Badge */}
                  {c.unreadCount && c.unreadCount > 0 ? (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-1">
                      {c.unreadCount}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT MAIN AREA: EMPTY STATE OR ACTIVE CHAT VIEW */}
        <main className="flex-1 bg-slate-950 light:bg-slate-50 flex flex-col justify-between overflow-hidden">
          {activeTopTab === "notifications" ? (
            /* TAB THÔNG BÁO HOẠT ĐỘNG (NOTIFICATIONS VIEW) */
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" /> Thông Báo Hoạt Động Hệ Thống ({notifications.length})
                </h2>
                <button
                  onClick={async () => {
                    await apiClient("/api/notifications/all", { method: "PATCH" });
                    loadNotifications();
                  }}
                  className="text-xs text-indigo-400 hover:underline font-medium"
                >
                  Đánh dấu tất cả là đã đọc
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border transition-colors flex items-start gap-3 ${
                      !n.isRead
                        ? "bg-indigo-950/30 border-indigo-500/40 text-slate-100"
                        : "bg-slate-900/40 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-800 text-amber-400 flex-shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs text-slate-200">{n.title}</h3>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{n.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !selectedChannelId ? (
            /* EMPTY STATE BITRIX24 SCREEN (3D GRAPHICS ILLUSTRATION) */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              {/* Bitrix24 Modern Illustration Card */}
              <div className="relative">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-500/20 border border-indigo-500/20 flex items-center justify-center p-6 shadow-2xl backdrop-blur-md">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center mx-auto shadow-lg">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-indigo-300 font-mono">
                      📅 Lịch họp & Tác vụ
                    </div>
                  </div>
                </div>

                {/* Cute Character Mascot Badge */}
                <div className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-lg animate-bounce">
                  ✨ CoPilot AI Ready
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h2 className="text-base font-bold text-slate-100 light:text-slate-900">
                  Chọn một cuộc trò chuyện để bắt đầu giao tiếp
                </h2>
                <p className="text-xs text-slate-400 light:text-slate-600">
                  hoặc mở trò chuyện chung để làm việc cùng toàn bộ đồng nghiệp trong công ty.
                </p>
              </div>

              <button
                onClick={() => setSelectedChannelId("chan-support-bot")}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Mời người dùng / Bắt đầu Chat</span>
              </button>
            </div>
          ) : (
            /* ACTIVE CHAT WINDOW FEED & INPUT BAR */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Active Chat Header */}
              <div className="p-4 border-b border-slate-800 light:border-slate-200 bg-slate-900/60 light:bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {selectedChannel?.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-100 light:text-slate-900">
                      {selectedChannel?.name}
                    </h2>
                    <p className="text-[11px] text-slate-400 light:text-slate-500">
                      {selectedChannel?.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <button className="p-2 rounded-lg hover:bg-slate-800 light:hover:bg-slate-100 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-800 light:hover:bg-slate-100 transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-800 light:hover:bg-slate-100 transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Feed Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="text-center py-12 text-xs text-slate-500 animate-pulse">
                    Đang tải lịch sử cuộc trò chuyện...
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${
                        msg.isAi || msg.senderName.includes("Bot") || msg.senderName.includes("CoPilot")
                          ? ""
                          : "flex-row-reverse"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {msg.isAi ? <Bot className="w-4 h-4 text-purple-400" /> : msg.senderName.slice(0, 1)}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-1 max-w-lg">
                        <span className="text-[10px] text-slate-500 block font-semibold px-1">
                          {msg.senderName}
                        </span>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-md ${
                            msg.isAi
                              ? "bg-slate-900 border border-purple-500/30 text-purple-100 rounded-tl-none"
                              : "bg-indigo-600 text-white rounded-tr-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono block px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {isSending && (
                  <div className="flex items-center gap-2 text-xs text-purple-400 italic animate-pulse">
                    <Bot className="w-4 h-4" />
                    <span>Bitrix24 CoPilot AI đang soạn phản hồi...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-slate-800 light:border-slate-200 bg-slate-900/80 light:bg-white flex items-center gap-2">
                <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Gửi tin nhắn hoặc lệnh / để gọi CoPilot..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-xs text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
