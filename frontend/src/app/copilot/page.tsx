"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface SessionDetail extends Session {
  messages: Message[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CopilotPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<SessionDetail | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch sessions on mount
  useEffect(() => {
    apiGet<Session[]>("/api/v1/copilot/sessions").then(setSessions).catch(console.error);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, loading]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px"; // max 4 rows ~96px
  };

  const selectSession = useCallback(async (id: string) => {
    try {
      const detail = await apiGet<SessionDetail>(`/api/v1/copilot/sessions/${id}`);
      setActiveSession(detail);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const createSession = async () => {
    try {
      const session = await apiPost<Session>("/api/v1/copilot/sessions", {
        title: "New session",
      });
      setSessions((prev) => [session, ...prev]);
      const detail = await apiGet<SessionDetail>(`/api/v1/copilot/sessions/${session.id}`);
      setActiveSession(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiDelete(`/api/v1/copilot/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) setActiveSession(null);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !activeSession || loading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    // Optimistically append the user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setActiveSession((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempUserMsg] } : prev
    );

    try {
      const { user_message, assistant_message } = await apiPost<{
        user_message: Message;
        assistant_message: Message;
      }>(`/api/v1/copilot/sessions/${activeSession.id}/messages`, { content });

      setActiveSession((prev) => {
        if (!prev) return prev;
        // Replace temp message with real one, append assistant
        const msgs = prev.messages.filter((m) => m.id !== tempUserMsg.id);
        return { ...prev, messages: [...msgs, user_message, assistant_message] };
      });

      // Update session list message count + updated_at
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, message_count: s.message_count + 2, updated_at: new Date().toISOString() }
            : s
        )
      );
    } catch (err) {
      console.error(err);
      // Remove temp optimistic message on error
      setActiveSession((prev) =>
        prev
          ? { ...prev, messages: prev.messages.filter((m) => m.id !== tempUserMsg.id) }
          : prev
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Session List ── */}
      <div className="flex w-1/3 min-w-[240px] flex-col border-r border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
          <h1 className="text-lg font-bold text-[var(--foreground)]">AI Copilot</h1>
          <Button
            size="sm"
            className="bg-brand-pink hover:opacity-90 text-white"
            onClick={createSession}
          >
            New Session
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
              No sessions yet
            </p>
          ) : (
            sessions.map((session) => {
              const isActive = activeSession?.id === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => selectSession(session.id)}
                  onMouseEnter={() => setHoveredSessionId(session.id)}
                  onMouseLeave={() => setHoveredSessionId(null)}
                  className={`relative flex cursor-pointer flex-col gap-0.5 px-4 py-3 border-l-2 transition-colors ${
                    isActive
                      ? "border-l-brand-pink bg-[var(--muted)]"
                      : "border-l-transparent hover:bg-[var(--muted)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-medium text-[var(--foreground)]">
                      {session.title}
                    </span>
                    {hoveredSessionId === session.id && (
                      <button
                        onClick={(e) => deleteSession(e, session.id)}
                        className="shrink-0 text-[var(--muted-foreground)] hover:text-red-500 text-base leading-none"
                        aria-label="Delete session"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <span>{session.message_count} msg{session.message_count !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{relativeTime(session.updated_at)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: Chat Interface ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!activeSession ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[var(--muted-foreground)]">
              Select or create a session to start
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-[var(--border)] px-6 py-4">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                {activeSession.title}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {activeSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-brand-pink text-white rounded-2xl rounded-br-sm"
                        : "bg-[var(--muted)] text-[var(--foreground)] rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start">
                  <div className="bg-[var(--muted)] text-[var(--muted-foreground)] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm italic">
                    thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-[var(--border)] px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message the copilot… (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  className="flex-1 resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 overflow-hidden"
                  disabled={loading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-brand-pink hover:opacity-90 text-white shrink-0"
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
