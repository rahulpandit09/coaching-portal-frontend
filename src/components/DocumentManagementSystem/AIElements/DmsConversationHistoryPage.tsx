import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  LoaderCircle,
  MessageSquare,
  MessagesSquare,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import naviChatService, { NaviChatThread } from "./naviChatService";

interface DmsConversationHistoryPageProps {
  onBack?: () => void;
  onOpenConversation?: (threadId: number) => void;
  onCreateConversation?: (threadId: number) => void;
}

export default function DmsConversationHistoryPage({
  onBack,
  onOpenConversation,
  onCreateConversation,
}: DmsConversationHistoryPageProps) {
  const [threads, setThreads] = useState<NaviChatThread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingThreadId, setDeletingThreadId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NaviChatThread | null>(null);

  // Load conversations from the DMS chatbot API.
  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const threadData = await naviChatService.getThreads();

      const threadList = Array.isArray(threadData)
        ? [...threadData].sort(
            (a, b) =>
              new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
              new Date(a.updated_at ?? a.created_at ?? 0).getTime()
          )
        : [];

      setThreads(threadList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversation history."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchThreads();
  }, [fetchThreads]);

  // Filter conversations by title and last message.
  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return threads;

    return threads.filter(
      (thread) =>
        thread.thread_title?.toLowerCase().includes(query) ||
        thread.last_message?.toLowerCase().includes(query)
    );
  }, [threads, searchQuery]);

  // Create a new conversation.
  const handleCreateConversation = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      const newThread = await naviChatService.createThread("New Conversation");

      if (!newThread || typeof newThread.thread_id !== "number") {
        throw new Error("The server did not return a valid conversation.");
      }

      setThreads((previous) => [
        newThread,
        ...previous.filter(
          (thread) => thread.thread_id !== newThread.thread_id
        ),
      ]);

      onCreateConversation?.(newThread.thread_id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create a new conversation."
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Delete a conversation after confirmation.
  const handleDeleteConversation = async () => {
    if (!deleteTarget || deletingThreadId !== null) return;

    const threadId = deleteTarget.thread_id;

    setDeletingThreadId(threadId);
    setError(null);

    try {
      await naviChatService.deleteThread(threadId);

      setThreads((previous) =>
        previous.filter((thread) => thread.thread_id !== threadId)
      );

      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the conversation."
      );
    } finally {
      setDeletingThreadId(null);
    }
  };

  // Format dates for the conversation list.
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (first: Date, second: Date) =>
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate();

    if (isSameDay(date, today)) {
      return `Today, ${date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    if (isSameDay(date, yesterday)) {
      return `Yesterday, ${date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
      {/* History header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Back to conversation"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#1E6FBF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}

          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1E6FBF]">
            <MessagesSquare className="size-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Conversation History
            </h2>
            <p className="text-[11px] text-slate-500">
              {isLoading
                ? "Loading..."
                : `${filteredThreads.length} ${
                    filteredThreads.length === 1 ? "chat" : "chats"
                  }`}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void fetchThreads()}
          disabled={isLoading}
          className="h-8 w-8 p-0 text-slate-500 hover:text-[#1E6FBF] cursor-pointer"
          title="Refresh conversations"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Search and new conversation */}
      <div className="shrink-0 space-y-2.5 border-b border-slate-200 bg-white p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-8 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1E6FBF] focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              title="Clear search"
              className="absolute right-2 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <Button
          type="button"
          onClick={handleCreateConversation}
          disabled={isCreating}
          className="h-9 w-full gap-2 rounded-lg bg-[#1E6FBF] text-xs font-medium text-white shadow-xs hover:bg-[#165b9e] cursor-pointer"
        >
          {isCreating ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5" />
          )}
          New Conversation
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="m-3 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <div className="min-w-0 flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError(null)}
            title="Dismiss error"
            className="rounded p-0.5 hover:bg-red-100 cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Scrollable conversation list */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-xs text-slate-500">
            <LoaderCircle className="size-5 animate-spin text-[#1E6FBF]" />
            Loading conversations...
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center p-4">
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#1E6FBF]">
              {searchQuery ? (
                <Search className="size-5" />
              ) : (
                <MessageSquare className="size-5" />
              )}
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {searchQuery ? "No matching chats" : "No conversations yet"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 max-w-[220px]">
              {searchQuery
                ? "Try a different search term"
                : "Start a conversation to see your history here."}
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <div
              key={thread.thread_id}
              className="group flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm"
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#1E6FBF]">
                <MessageSquare className="size-3.5" />
              </div>

              <button
                type="button"
                onClick={() => onOpenConversation?.(thread.thread_id)}
                className="min-w-0 flex-1 text-left cursor-pointer focus-visible:outline-none"
                title="Open conversation"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <h3 className="truncate text-xs font-semibold text-slate-800 group-hover:text-[#1E6FBF]">
                    {thread.thread_title || "New Conversation"}
                  </h3>
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                    {thread.message_count ?? 0} msgs
                  </span>
                </div>

                <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                  {thread.last_message?.trim() || "No messages yet"}
                </p>

                <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3" />
                    {formatDate(thread.updated_at ?? thread.created_at)}
                  </span>
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onOpenConversation?.(thread.thread_id)}
                  title="Open conversation"
                  className="inline-flex size-7 items-center justify-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-[#1E6FBF] cursor-pointer"
                >
                  <ChevronRight className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(thread)}
                  disabled={deletingThreadId === thread.thread_id}
                  title="Delete conversation"
                  className="inline-flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                >
                  {deletingThreadId === thread.thread_id ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-conversation-title"
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Trash2 className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id="delete-conversation-title"
                  className="text-sm font-semibold text-slate-900"
                >
                  Delete conversation?
                </h2>

                <p className="mt-1.5 break-words text-xs leading-relaxed text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-700">
                    "{deleteTarget.thread_title || "New Conversation"}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingThreadId !== null}
                title="Close confirmation"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingThreadId !== null}
                className="h-8 border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => void handleDeleteConversation()}
                disabled={deletingThreadId !== null}
                className="h-8 gap-1.5 bg-red-600 text-xs text-white hover:bg-red-700 cursor-pointer"
              >
                {deletingThreadId !== null ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}