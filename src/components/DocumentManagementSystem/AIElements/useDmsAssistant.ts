// AI Assistant state and handlers.
// Integrates DMS chatbot thread management APIs.

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/api/axiosInstance";
import type { DocumentRecord } from "../types";
import naviChatService, {
  NaviChatMessage,
  NaviChatThread,
  NaviChatCitation,
  NaviDocumentSummary,
  NaviSummaryType,
} from "./naviChatService";

export type DmsChatThread = NaviChatThread;
export type DmsChatCitation = NaviChatCitation;
export type DmsChatMessage = NaviChatMessage;
export type DmsSummaryType = NaviSummaryType;
export type DmsDocumentSummary = NaviDocumentSummary;

export type DmsOcrStatus =
  | "NOT_PROCESSED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface DmsOcrResult {
  ocr_id: number | null;
  document_id: number;
  ocr_status: DmsOcrStatus;
  page_count: number;
  character_count: number;
  word_count: number;
  document_summary: string | null;
  metadata_info: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  document_title: string;
  document_number: string;
  file_name: string;
  file_type: string;
  file_size: string;
  extracted_text: string | null;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

type OcrIntent = "summarize" | "extract_text" | "status" | "reprocess";

interface OcrCommand {
  intent: OcrIntent;
  documentId: number;
}

function detectOcrCommand(input: string): OcrCommand | null {
  const text = input.trim();

  const documentIdMatch = text.match(
    /\bdocument\s*(?:id\s*)?#?\s*(\d+)\b/i
  );

  if (!documentIdMatch) {
    return null;
  }

  const documentId = Number(documentIdMatch[1]);

  if (!Number.isSafeInteger(documentId) || documentId <= 0) {
    return null;
  }

  if (/\b(regenerate|reprocess|force\s+reprocess|rerun|re-run)\b/i.test(text)) {
    return { intent: "reprocess", documentId };
  }

  if (/\b(extracted\s+text|extract\s+text|full\s+text|raw\s+text)\b/i.test(text)) {
    return { intent: "extract_text", documentId };
  }

  if (/\b(ocr\s+status|processing\s+status|status\s+of\s+(?:the\s+)?ocr)\b/i.test(text)) {
    return { intent: "status", documentId };
  }

  if (/\b(summarize|summarise|summary|key\s+findings|executive\s+summary)\b/i.test(text)) {
    return { intent: "summarize", documentId };
  }

  return null;
}

export function useDmsAssistant({
  threadId,
  showAssistant,
  documents,
  activeDocumentId = null,
  activeFolderId = null,
  activeSubFolderId = null,
  activeSubSubFolderId = null,
}: {
  threadId: string;
  showAssistant: boolean;
  documents: DocumentRecord[];
  activeDocumentId?: number | string | null;
  activeFolderId?: number | string | null;
  activeSubFolderId?: number | string | null;
  activeSubSubFolderId?: number | string | null;
}) {
  const numericDocumentId =
    activeDocumentId != null && !Number.isNaN(Number(activeDocumentId))
      ? Number(activeDocumentId)
      : null;
  const numericFolderId =
    activeFolderId != null && !Number.isNaN(Number(activeFolderId))
      ? Number(activeFolderId)
      : null;
  const numericSubFolderId =
    activeSubFolderId != null && !Number.isNaN(Number(activeSubFolderId))
      ? Number(activeSubFolderId)
      : null;
  const numericSubSubFolderId =
    activeSubSubFolderId != null && !Number.isNaN(Number(activeSubSubFolderId))
      ? Number(activeSubSubFolderId)
      : null;

  const [messages, setMessages] = useState<any[]>([]);
  const [threads, setThreads] = useState<DmsChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);

  const [assistantStatus, setAssistantStatus] = useState<string>("ready");
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [documentSummary, setDocumentSummary] =
    useState<DmsDocumentSummary | null>(null);
  const [isSummarizingDocument, setIsSummarizingDocument] = useState(false);
  const [summaryError, setSummaryError] = useState<Error | null>(null);

  // OCR state
  const [ocrResult, setOcrResult] = useState<DmsOcrResult | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isLoadingOcr, setIsLoadingOcr] = useState(false);
  const [ocrError, setOcrError] = useState<Error | null>(null);

  const assistantInput = useRef<HTMLTextAreaElement>(null);
  const [assistantError, setAssistantError] = useState<Error | null>(null);

  // Fetch existing conversations.
  const fetchThreads = useCallback(async (filterDocId?: number | null) => {
    setIsLoadingThreads(true);
    setAssistantError(null);

    try {
      const docIdToFilter =
        filterDocId !== undefined ? filterDocId : numericDocumentId;
      const threadData = await naviChatService.getThreads(docIdToFilter);

      const threadList = Array.isArray(threadData)
        ? [...threadData].sort(
            (a, b) =>
              new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
              new Date(a.updated_at ?? a.created_at ?? 0).getTime()
          )
        : [];

      setThreads(threadList);

      // Select the most recently updated conversation when no thread is active.
      setActiveThreadId((currentId) => {
        if (
          currentId !== null &&
          threadList.some((thread) => thread.thread_id === currentId)
        ) {
          return currentId;
        }

        const latestThread = threadList[0];

        return latestThread?.thread_id ?? null;
      });
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error("Failed to load chat conversations.");

      setAssistantError(err);
    } finally {
      setIsLoadingThreads(false);
    }
  }, [activeDocumentId]);

  // Load conversations whenever the assistant panel opens.
  useEffect(() => {
    if (showAssistant) {
      void fetchThreads();
    }
  }, [showAssistant, fetchThreads]);

  // Focus the input when the assistant opens.
  useEffect(() => {
    if (showAssistant) {
      assistantInput.current?.focus();
    }
  }, [showAssistant, activeThreadId]);

  // Automatically load history when the active thread changes.
  useEffect(() => {
    if (!showAssistant || activeThreadId === null) {
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      setAssistantError(null);
      setMessages([]);

      try {
        const history = await naviChatService.getMessages(activeThreadId);

        if (cancelled) return;

        setMessages(
          (history || []).map((message) => ({
            id: String(message.message_id),
            role: message.sender === "user" ? "user" : "assistant",
            parts: [
              {
                type: "text",
                text: message.content,
              },
            ],
            citations: message.document_references ?? [],
            model: message.model_used,
            tokensUsed: message.tokens_used,
            createdAt: message.created_at,
          }))
        );
      } catch (error) {
        if (cancelled) return;

        setAssistantError(
          error instanceof Error
            ? error
            : new Error("Failed to load conversation history.")
        );
      } finally {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      }
    };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeThreadId, showAssistant]);

  // Create a conversation through the backend.
  const createThread = useCallback(
    async (threadTitle: string = "New Chat", customDocId?: number | null) => {
      if (isCreatingThread) return;

      setIsCreatingThread(true);
      setAssistantError(null);

      const safeTitle =
        typeof threadTitle === "string" && threadTitle.trim()
          ? threadTitle.trim()
          : "New Chat";

      const targetDocId =
        typeof customDocId === "number" ? customDocId : numericDocumentId;

      try {
        const newThread = await naviChatService.createThread(
          safeTitle,
          targetDocId ?? null
        );

        if (!newThread || typeof newThread.thread_id !== "number") {
          throw new Error("The server did not return a valid chat thread ID.");
        }

        setThreads((previousThreads) => [
          newThread,
          ...previousThreads.filter(
            (thread) => thread.thread_id !== newThread.thread_id
          ),
        ]);

        setActiveThreadId(newThread.thread_id);
        setMessages([]);
        setAssistantStatus("ready");

        return newThread;
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to create a new conversation.");

        setAssistantError(err);
        throw err;
      } finally {
        setIsCreatingThread(false);
      }
    },
    [isCreatingThread, numericDocumentId]
  );

  // Fetch existing OCR details for a document.
  const getDocumentOcr = useCallback(
    async (
      documentId: number,
      includeFullText: boolean = true
    ): Promise<DmsOcrResult> => {
      setIsLoadingOcr(true);
      setOcrError(null);

      try {
        const response = await api.get<ApiResponse<DmsOcrResult>>(
          `/dms-ocr/get/${documentId}`,
          {
            params: {
              include_full_text: includeFullText,
            },
          }
        );

        const result = response.data?.data;

        if (!result || typeof result.document_id !== "number") {
          throw new Error("The server returned invalid OCR details.");
        }

        setOcrResult(result);

        return result;
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to retrieve OCR details.");

        setOcrError(err);

        throw err;
      } finally {
        setIsLoadingOcr(false);
      }
    },
    []
  );

  // Trigger OCR processing or force reprocessing.
  const processDocumentOcr = useCallback(
    async (
      documentId: number,
      forceReprocess: boolean = false,
      customSummaryPrompt: string | null = null
    ): Promise<DmsOcrResult> => {
      setIsProcessingOcr(true);
      setOcrError(null);

      try {
        const response = await api.post<ApiResponse<DmsOcrResult>>(
          `/dms-ocr/process/${documentId}`,
          {
            force_reprocess: forceReprocess,
            custom_summary_prompt: customSummaryPrompt,
          }
        );

        const result = response.data?.data;

        if (!result || typeof result.document_id !== "number") {
          throw new Error("The server returned an invalid OCR response.");
        }

        setOcrResult(result);

        return result;
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to process the document OCR.");

        setOcrError(err);

        throw err;
      } finally {
        setIsProcessingOcr(false);
      }
    },
    []
  );

  const executeOcrCommand = useCallback(
    async (command: OcrCommand): Promise<string> => {
      const { intent, documentId } = command;

      switch (intent) {
        case "summarize": {
          const result = await getDocumentOcr(documentId, true);

          if (result.ocr_status === "NOT_PROCESSED") {
            const processed = await processDocumentOcr(documentId);

            return [
              `OCR status: ${processed.ocr_status}`,
              "",
              processed.document_summary || "No summary is available yet.",
            ].join("\n");
          }

          return [
            `OCR status: ${result.ocr_status}`,
            "",
            result.document_summary || "No summary is available.",
          ].join("\n");
        }

        case "extract_text": {
          const result = await getDocumentOcr(documentId, true);

          return [
            `OCR status: ${result.ocr_status}`,
            "",
            result.extracted_text || "No extracted text is available.",
          ].join("\n");
        }

        case "status": {
          const result = await getDocumentOcr(documentId, false);

          return [
            `Document: ${result.document_title || documentId}`,
            `OCR status: ${result.ocr_status}`,
            `Pages: ${result.page_count ?? "—"}`,
            `Words: ${result.word_count ?? "—"}`,
            `Characters: ${result.character_count ?? "—"}`,
            result.error_message
              ? `Error: ${result.error_message}`
              : "",
          ]
            .filter(Boolean)
            .join("\n");
        }

        case "reprocess": {
          const result = await processDocumentOcr(documentId, true);

          return [
            `OCR reprocessing status: ${result.ocr_status}`,
            "",
            result.document_summary || "No summary is available yet.",
          ].join("\n");
        }
      }
    },
    [getDocumentOcr, processDocumentOcr]
  );

  const submitAssistant = async (
    text: string,
    options?: {
      documentId?: number | null;
      folderId?: number | null;
      subFolderId?: number | null;
      subSubFolderId?: number | null;
    }
  ) => {
    const question = text.trim();

    if (!question || assistantStatus === "streaming") {
      return;
    }

    const ocrCommand = detectOcrCommand(question);

    if (ocrCommand) {
      setAssistantStatus("streaming");
      setAssistantError(null);

      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        parts: [{ type: "text", text: question }],
        createdAt: new Date().toISOString(),
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        userMessage,
      ]);

      try {
        const content = await executeOcrCommand(ocrCommand);

        setMessages((previousMessages) => [
          ...previousMessages,
          {
            id: `ocr-${Date.now()}`,
            role: "assistant",
            parts: [{ type: "text", text: content }],
            citations: [],
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("The OCR request failed.");

        setAssistantError(err);
      } finally {
        setAssistantStatus("ready");
      }

      return;
    }

    if (activeThreadId === null) {
      setAssistantError(
        new Error(
          "Please create or select a conversation before sending a message."
        )
      );
      return;
    }

    setAssistantStatus("streaming");
    setAssistantError(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      parts: [{ type: "text", text: question }],
      createdAt: new Date().toISOString(),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    try {
      const docId =
        options?.documentId !== undefined
          ? options.documentId
          : numericDocumentId;
      const fId =
        options?.folderId !== undefined ? options.folderId : numericFolderId;
      const sfId =
        options?.subFolderId !== undefined
          ? options.subFolderId
          : numericSubFolderId;
      const ssfId =
        options?.subSubFolderId !== undefined
          ? options.subSubFolderId
          : numericSubSubFolderId;

      const result = await naviChatService.sendMessage({
        threadId: activeThreadId,
        question,
        documentId: docId ?? null,
        folderId: fId ?? null,
        subFolderId: sfId ?? null,
        subSubFolderId: ssfId ?? null,
      });

      if (!result || typeof result.content !== "string") {
        throw new Error("The server returned an invalid AI response.");
      }

      const assistantMessage = {
        id: String(result.message_id),
        role: "assistant",
        parts: [
          {
            type: "text",
            text: result.content,
          },
        ],
        citations: result.document_references ?? [],
        model: result.model_used,
        tokensUsed: result.tokens_used,
        createdAt: result.created_at,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);

      // Refresh thread metadata after the conversation changes.
      void fetchThreads();
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error("Navi is unavailable. Please try again.");

      setAssistantError(err);
    } finally {
      setAssistantStatus("ready");
    }
  };

  const deleteThread = useCallback(
    async (selectedThreadId: number) => {
      setAssistantError(null);

      try {
        await naviChatService.deleteThread(selectedThreadId);

        const remainingThreads = threads.filter(
          (thread) => thread.thread_id !== selectedThreadId
        );

        setThreads(remainingThreads);

        if (activeThreadId === selectedThreadId) {
          setMessages([]);
          setActiveThreadId(null);

          // Select another conversation if one remains.
          if (remainingThreads.length > 0) {
            setActiveThreadId(remainingThreads[0].thread_id);
          }
        }
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to delete the conversation.");

        setAssistantError(err);
        throw err;
      }
    },
    [threads, activeThreadId]
  );

  const summarizeDocument = useCallback(
    async (
      documentId: number,
      summaryType: DmsSummaryType = "detailed",
      threadIdForSummary: number | null = null,
      customInstructions: string | null = null
    ): Promise<DmsDocumentSummary> => {
      setIsSummarizingDocument(true);
      setSummaryError(null);
      setDocumentSummary(null);

      try {
        const result = await naviChatService.summarizeDocument(
          documentId,
          summaryType,
          threadIdForSummary,
          customInstructions
        );

        if (!result || typeof result.summary !== "string") {
          throw new Error("The server returned an invalid document summary.");
        }

        setDocumentSummary(result);

        const summaryMessage = {
          id: `summary-${Date.now()}`,
          role: "assistant",
          parts: [
            {
              type: "text",
              text: `### 📄 Summary: ${result.document_title || `Document #${documentId}`}\n\n${result.summary}`,
            },
          ],
          citations: [
            {
              document_id: result.document_id,
              document_title: result.document_title,
              document_number: result.document_number,
            },
          ],
          createdAt: result.created_at || new Date().toISOString(),
        };

        setMessages((previousMessages) => [
          ...previousMessages,
          summaryMessage,
        ]);

        return result;
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to generate the document summary.");

        setSummaryError(err);
        throw err;
      } finally {
        setIsSummarizingDocument(false);
      }
    },
    []
  );


  const stop = () => {
    setAssistantStatus("ready");
  };

  return {
    messages,
    threads,
    activeThreadId,
    setActiveThreadId,
    assistantStatus,
    assistantInput,
    createThread,
    fetchThreads,
    submitAssistant,
    stop,
    error: assistantError,
    isLoadingThreads,
    isCreatingThread,
    isLoadingMessages,
    deleteThread,
    documentSummary,
    isSummarizingDocument,
    summaryError,
    summarizeDocument,
    setDocumentSummary,
    // OCR state and handlers
    ocrResult,
    isProcessingOcr,
    isLoadingOcr,
    ocrError,
    getDocumentOcr,
    processDocumentOcr,
    setOcrResult,
  };
}
