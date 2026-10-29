import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  FileText,
  ExternalLink,
  Trash2,
  MessageSquare,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import DmsConversationHistoryPage from "./DmsConversationHistoryPage";
import { FormattedMarkdown } from "./FormattedMarkdown";
import type { DmsOcrResult, DmsOcrStatus } from "./useDmsAssistant";

interface AssistantCitation {
  document_id: number;
  document_title: string;
  document_number?: string;
  page_number?: number;
  snippet?: string;
}

interface AssistantThread {
  thread_id: number;
  thread_title: string;
  message_count: number;
  last_message?: string | null;
  updated_at?: string;
}

export function DmsAiAssistant({
  threadId = "home",
  showAssistant,
  onClose,
  onToggle,
  onCreateThread,
  messages = [],
  status = "ready",
  stop,
  error,
  onSubmitAssistant,
  threads = [],
  activeThreadId = null,
  onSelectThread,
  onDeleteThread,
  isLoadingThreads = false,
  isLoadingMessages = false,
  isCreatingThread = false,
  isSummarizingDocument = false,
  onOpenCitation,
  // OCR state
  ocrResult,
  isProcessingOcr,
  isLoadingOcr,
  ocrError,
  // OCR handlers
  onGetDocumentOcr,
  onProcessDocumentOcr,
}: {
  threadId?: string;
  showAssistant: boolean;
  onClose: () => void;
  onToggle: () => void;
  onCreateThread: () => void | Promise<unknown>;
  messages: any[];
  status: string;
  stop?: () => void;
  error?: Error | null | undefined;
  onSubmitAssistant: (text: string) => Promise<void>;
  threads?: AssistantThread[];
  activeThreadId?: number | null;
  onSelectThread: (threadId: number) => void;
  onDeleteThread: (threadId: number) => Promise<void>;
  isLoadingThreads?: boolean;
  isLoadingMessages?: boolean;
  isCreatingThread?: boolean;
  isSummarizingDocument?: boolean;
  onOpenCitation?: (documentId: number) => void;
  // OCR state
  ocrResult?: DmsOcrResult | null;
  isProcessingOcr?: boolean;
  isLoadingOcr?: boolean;
  ocrError?: Error | null;
  // OCR handlers
  onGetDocumentOcr?: (
    documentId: number,
    includeFullText?: boolean
  ) => Promise<DmsOcrResult>;
  onProcessDocumentOcr?: (
    documentId: number,
    forceReprocess?: boolean,
    customSummaryPrompt?: string | null
  ) => Promise<DmsOcrResult>;
}) {
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [showOcrDetails, setShowOcrDetails] = useState(false);
  const [ocrDocumentId, setOcrDocumentId] = useState<number | null>(null);
  const [ocrTab, setOcrTab] = useState<"summary" | "text">("summary");
  const [ocrActionError, setOcrActionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleLoadOcr = async (documentId: number) => {
    if (!onGetDocumentOcr) return;

    setOcrDocumentId(documentId);
    setShowOcrDetails(true);
    setOcrTab("summary");
    setOcrActionError(null);

    try {
      await onGetDocumentOcr(documentId, true);
    } catch (error) {
      setOcrActionError(
        error instanceof Error
          ? error.message
          : "Failed to retrieve OCR details."
      );
    }
  };

  const handleProcessOcr = async (
    documentId: number,
    forceReprocess = false
  ) => {
    if (!onProcessDocumentOcr) return;

    setOcrDocumentId(documentId);
    setShowOcrDetails(true);
    setOcrActionError(null);

    try {
      await onProcessDocumentOcr(documentId, forceReprocess);
    } catch (error) {
      setOcrActionError(
        error instanceof Error
          ? error.message
          : "OCR processing failed."
      );
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const question = inputVal.trim();

    if (!question || status === "streaming") return;

    setInputVal("");
    await onSubmitAssistant(question);
  };

  const getMessageText = (msg: any): string => {
    if (typeof msg === "string") return msg;
    if (msg.content) return String(msg.content);
    if (Array.isArray(msg.parts)) {
      return msg.parts.map((p: any) => p.text || "").join(" ");
    }
    return "";
  };

  const getUniqueCitations = (
    citations: AssistantCitation[]
  ): AssistantCitation[] => {
    const unique = new Map<string, AssistantCitation>();

    citations.forEach((citation: any) => {
      const docId =
        citation.document_id ??
        citation.id ??
        citation.documentId ??
        citation.document_number ??
        citation.document_title;
      const page =
        citation.page_number ??
        citation.page ??
        citation.pageNumber ??
        "doc";
      const key = `${docId}-${page}`;

      if (!unique.has(key)) {
        unique.set(key, citation);
      }
    });

    return Array.from(unique.values());
  };

  const renderCitations = (citations: AssistantCitation[]) => {
    if (!citations.length) return null;

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {citations.map((citation, index) => (
          <button
            key={`${citation.document_id}-${citation.page_number ?? "doc"}-${index}`}
            type="button"
            title={
              citation.snippet ||
              citation.document_number ||
              citation.document_title
            }
            onClick={() => {
              const documentId = citation.document_id;

              // Close the assistant first.
              onClose();

              // Open the document preview after the assistant closes.
              window.setTimeout(() => {
                onOpenCitation?.(documentId);
              }, 0);
            }}
            className="group inline-flex max-w-full items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
          >
            <FileText className="size-4 shrink-0 text-[#1E6FBF]" />

            <span className="min-w-0 truncate font-medium">
              {citation.document_title}
            </span>

            {citation.page_number != null && (
              <span className="shrink-0 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-[#1E6FBF]">
                Page {citation.page_number}
              </span>
            )}

            <ExternalLink className="size-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-[#1E6FBF]" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {showAssistant && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(560px,calc(100dvh-40px))] w-[min(400px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03] animate-in fade-in zoom-in-95 duration-200 max-sm:bottom-2 max-sm:right-2 max-sm:h-[calc(100dvh-16px)] max-sm:w-[calc(100vw-16px)] max-sm:rounded-xl">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-blue-700/20 bg-gradient-to-r from-[#1765AE] to-[#287CC7] px-4 py-3.5 text-white">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold tracking-tight">
                Navi AI Assistant
              </p>
              <p className="mt-0.5 text-[11px] text-blue-100">
                Petronet Document Intelligence
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHistoryPage(true)}
              title="Toggle conversations"
              className="inline-flex size-9 items-center justify-center rounded-lg text-blue-50 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <MessageSquare className="size-4" />
            </button>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg text-blue-50 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              title="New chat"
              onClick={() => void onCreateThread()}
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg text-blue-50 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              title="Close assistant"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>
          </div>

          {showHistoryPage ? (
            <DmsConversationHistoryPage
              onBack={() => setShowHistoryPage(false)}
              onOpenConversation={(selectedThreadId) => {
                onSelectThread(selectedThreadId);
                setShowHistoryPage(false);
              }}
              onCreateConversation={(newThreadId) => {
                if (typeof newThreadId === "number") {
                  onSelectThread(newThreadId);
                } else {
                  void onCreateThread();
                }
                setShowHistoryPage(false);
              }}
            />
          ) : (
            <>
              {/* Conversation Area */}
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-slate-50/70 px-4 py-5 scroll-smooth">
                {showOcrDetails && (
                  <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          OCR & AI Summary
                        </h3>

                        <p className="text-xs text-slate-500">
                          Document ID: {ocrDocumentId}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowOcrDetails(false)}
                        className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                      >
                        Close
                      </button>
                    </div>

                    {ocrActionError || ocrError ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {ocrActionError || ocrError?.message}
                      </div>
                    ) : isProcessingOcr || isLoadingOcr ? (
                      <div className="flex items-center gap-2 py-5 text-xs text-slate-600">
                        <LoaderCircle className="size-4 animate-spin text-[#1E6FBF]" />
                        Processing OCR or retrieving document details...
                      </div>
                    ) : ocrResult && ocrResult.document_id === ocrDocumentId ? (
                      <>
                        <div className="mb-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">
                            Status: {ocrResult.ocr_status}
                          </span>

                          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                            Pages: {ocrResult.page_count}
                          </span>

                          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                            Words: {ocrResult.word_count}
                          </span>

                          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                            Characters: {ocrResult.character_count}
                          </span>
                        </div>

                        <div className="mb-3 flex gap-2 border-b border-slate-200">
                          <button
                            type="button"
                            onClick={() => setOcrTab("summary")}
                            className={`border-b-2 px-3 py-2 text-xs font-medium ${
                              ocrTab === "summary"
                                ? "border-[#1E6FBF] text-[#1E6FBF]"
                                : "border-transparent text-slate-500"
                            }`}
                          >
                            AI Summary
                          </button>

                          <button
                            type="button"
                            onClick={() => setOcrTab("text")}
                            className={`border-b-2 px-3 py-2 text-xs font-medium ${
                              ocrTab === "text"
                                ? "border-[#1E6FBF] text-[#1E6FBF]"
                                : "border-transparent text-slate-500"
                            }`}
                          >
                            Extracted Text
                          </button>
                        </div>

                        <div className="max-h-64 overflow-y-auto break-words text-xs leading-5 text-slate-700">
                          {ocrTab === "summary" ? (
                            <FormattedMarkdown
                              content={
                                ocrResult.document_summary || "No summary available."
                              }
                            />
                          ) : (
                            <div className="whitespace-pre-wrap">
                              {ocrResult.extracted_text || "No extracted text available."}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap justify-end gap-2">
                          {ocrResult.ocr_status === "FAILED" && (
                            <button
                              type="button"
                              disabled={isProcessingOcr}
                              onClick={() =>
                                handleProcessOcr(ocrResult.document_id, true)
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs text-white disabled:opacity-50"
                            >
                              Retry OCR
                            </button>
                          )}

                          {ocrResult.ocr_status === "COMPLETED" && (
                            <button
                              type="button"
                              disabled={isProcessingOcr}
                              onClick={() =>
                                handleProcessOcr(ocrResult.document_id, true)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 disabled:opacity-50"
                            >
                              Regenerate OCR
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-xs text-slate-500">
                        No OCR result is available for this document.
                      </div>
                    )}
                  </div>
                )}

                {isLoadingMessages && (
                  <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500">
                    <LoaderCircle className="size-4 animate-spin text-[#1E6FBF]" />
                    Loading conversation...
                  </div>
                )}

                {messages.length === 0 && !isLoadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="size-12 rounded-2xl bg-blue-50 text-[#1E6FBF] flex items-center justify-center mb-3 shadow-xs">
                      <Sparkles className="size-6" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Ask Navi about records
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[260px]">
                      Search across OISD codes, PNGRB compliance, and pipeline drawings
                    </p>
                    <div className="mt-4 flex flex-col gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={() => {
                          onSubmitAssistant("Show all controlled documents for OISD");
                        }}
                        className="text-left text-xs text-gray-700 bg-white border border-gray-200 rounded-lg p-2.5 hover:border-[#1E6FBF] hover:text-[#1E6FBF] transition-all shadow-2xs cursor-pointer"
                      >
                        🔍 "Show all controlled documents for OISD"
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSubmitAssistant("Which publishers are assigned to PNGRB?");
                        }}
                        className="text-left text-xs text-gray-700 bg-white border border-gray-200 rounded-lg p-2.5 hover:border-[#1E6FBF] hover:text-[#1E6FBF] transition-all shadow-2xs cursor-pointer"
                      >
                        👥 "Which publishers are assigned to PNGRB?"
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isUser = msg.role === "user" || msg.from === "user";
                    return (
                      <div
                        key={msg.id || index}
                        className={`flex items-end gap-2.5 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="size-7 rounded-full bg-[#1E6FBF] text-white flex items-center justify-center shrink-0 shadow-xs mb-1">
                            <Bot className="size-3.5" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-[88%] sm:max-w-[90%]">
                          <div
                            className={`rounded-2xl px-4 py-3 text-[13px] leading-6 break-words ${
                              isUser
                                ? "rounded-br-md bg-[#1E6FBF] text-white shadow-sm whitespace-pre-wrap"
                                : "rounded-bl-md border border-slate-200/80 bg-white text-slate-700 shadow-sm"
                            }`}
                          >
                            {isUser ? (
                              getMessageText(msg)
                            ) : (
                              <FormattedMarkdown content={getMessageText(msg)} />
                            )}
                          </div>

                          {!isUser &&
                            Array.isArray(msg.citations) &&
                            renderCitations(getUniqueCitations(msg.citations))}
                        </div>
                        {isUser && (
                          <div className="size-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mb-1">
                            <User className="size-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {(status === "submitted" ||
                  status === "streaming" ||
                  isSummarizingDocument) && (
                  <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
                    <LoaderCircle className="size-5 shrink-0 animate-spin text-[#1E6FBF]" />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {isSummarizingDocument
                          ? "Generating document summary..."
                          : "Navi is reviewing document database..."}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Please wait while Navi processes your request.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                    {error.message}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form
                onSubmit={handleSubmit}
                className="shrink-0 border-t border-slate-200 bg-white p-3.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Ask Navi about documents, access, or versions…"
                    className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1E6FBF] focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputVal.trim() || status === "streaming"}
                    className="size-10 shrink-0 rounded-xl bg-[#1E6FBF] text-white shadow-sm transition-all hover:bg-[#165b9e] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="size-3.5" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default DmsAiAssistant;
