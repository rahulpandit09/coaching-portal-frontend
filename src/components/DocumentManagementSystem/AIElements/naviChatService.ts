/**
 * Navi AI Assistant Chat Service
 * Handles API contracts specified in dms_navi_chatbot_api_integration_guide.md
 */

import api from "@/api/axiosInstance";

export interface NaviChatThread {
  thread_id: number;
  user_id?: number;
  thread_title: string;
  document_id?: number | null;
  document_title?: string | null;
  document_number?: string | null;
  message_count: number;
  last_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NaviChatCitation {
  document_id: number;
  document_title: string;
  document_number?: string;
  page_number?: number;
  snippet?: string;
}

export interface NaviChatMessage {
  message_id: number;
  thread_id: number;
  sender: "user" | "navi";
  content: string;
  document_references?: NaviChatCitation[] | null;
  model_used?: string | null;
  tokens_used?: number | null;
  created_at?: string;
}

export type NaviSummaryType = "brief" | "detailed" | "key_points" | "executive";

export interface NaviDocumentSummary {
  document_id: number;
  document_title: string;
  document_number?: string;
  page_count?: number;
  summary_type: NaviSummaryType;
  summary: string;
  thread_id?: number | null;
  created_at?: string;
  ocr_status?: string;
  tokens_used?: number;
  model?: string;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface SendMessageParams {
  threadId: number;
  question: string;
  documentId?: number | null;
  folderId?: number | null;
  subFolderId?: number | null;
  subSubFolderId?: number | null;
}

export const naviChatService = {
  /**
   * 1. Fetch chat history / threads list
   * GET /dms-chat/threads
   */
  getThreads: async (documentId?: number | null): Promise<NaviChatThread[]> => {
    const params = documentId ? { document_id: documentId } : {};
    const res = await api.get<ApiResponse<NaviChatThread[]>>("/dms-chat/threads", { params });
    return res.data?.data || [];
  },

  /**
   * 2. Create a new chat thread
   * POST /dms-chat/thread/create
   */
  createThread: async (
    threadTitle: string = "New Chat",
    documentId?: number | null
  ): Promise<NaviChatThread> => {
    const safeTitle =
      typeof threadTitle === "string" && threadTitle.trim()
        ? threadTitle.trim()
        : "New Chat";
    const safeDocId =
      typeof documentId === "number" && !Number.isNaN(documentId)
        ? documentId
        : null;

    const res = await api.post<ApiResponse<NaviChatThread>>("/dms-chat/thread/create", {
      thread_title: safeTitle,
      document_id: safeDocId,
    });
    return res.data?.data;
  },

  /**
   * 3. Load full message history of a thread
   * GET /dms-chat/thread/{thread_id}/messages
   */
  getMessages: async (threadId: number): Promise<NaviChatMessage[]> => {
    const res = await api.get<ApiResponse<NaviChatMessage[]>>(`/dms-chat/thread/${threadId}/messages`);
    return res.data?.data || [];
  },

  /**
   * 4. Send question to Navi (Grounded Chat)
   * POST /dms-chat/send
   */
  sendMessage: async ({
    threadId,
    question,
    documentId = null,
    folderId = null,
    subFolderId = null,
    subSubFolderId = null,
  }: SendMessageParams): Promise<NaviChatMessage> => {
    const res = await api.post<ApiResponse<NaviChatMessage>>("/dms-chat/send", {
      thread_id: threadId,
      question,
      document_id: documentId,
      folder_id: folderId,
      sub_folder_id: subFolderId,
      sub_sub_folder_id: subSubFolderId,
    });
    return res.data?.data;
  },

  /**
   * 5. One-Click AI Document Summary
   * POST /dms-chat/summarize/{document_id}
   */
  summarizeDocument: async (
    documentId: number,
    summaryType: NaviSummaryType = "detailed",
    threadId: number | null = null,
    customInstructions: string | null = null
  ): Promise<NaviDocumentSummary> => {
    const res = await api.post<ApiResponse<NaviDocumentSummary>>(`/dms-chat/summarize/${documentId}`, {
      summary_type: summaryType,
      thread_id: threadId,
      custom_instructions: customInstructions,
    });
    return res.data?.data;
  },

  /**
   * 6. Delete a chat thread
   * DELETE /dms-chat/thread/{thread_id}
   */
  deleteThread: async (threadId: number): Promise<{ thread_id: number; is_deleted?: boolean }> => {
    const res = await api.delete<ApiResponse<{ thread_id: number; is_deleted?: boolean }>>(
      `/dms-chat/thread/${threadId}`
    );
    return res.data?.data;
  },
};

export default naviChatService;
