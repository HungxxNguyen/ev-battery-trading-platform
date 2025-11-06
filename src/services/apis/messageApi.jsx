// src/services/apis/messageApi.jsx
import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_MESSAGE } from "../../constants/apiEndPoint";

const messageService = {
  /**
   * Start a chat thread between two users
   * Body: { id: Guid, userId: Guid, participantId: Guid }
   */
  async startThread({ id, userId, participantId }) {
    if (!id || !userId || !participantId) {
      return {
        success: false,
        error: "id, userId and participantId are required",
        status: null,
      };
    }
    return performApiRequest(API_ENDPOINTS_MESSAGE.START_THREAD, {
      method: "post",
      data: { id, userId, participantId },
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain",
      },
    });
  },

  /**
   * Send a message in a chat thread
   * FormData: ChatThreadId, SenderId, MessageText
   */
  async sendMessage({ chatThreadId, senderId, messageText }) {
    if (!chatThreadId || !senderId || !messageText?.trim()) {
      return {
        success: false,
        error: "chatThreadId, senderId and messageText are required",
        status: null,
      };
    }
    const form = new FormData();
    form.append("ChatThreadId", String(chatThreadId));
    form.append("SenderId", String(senderId));
    form.append("MessageText", String(messageText));

    return performApiRequest(API_ENDPOINTS_MESSAGE.SEND_MESSAGE, {
      method: "post",
      data: form,
      headers: {
        // Let Axios set multipart boundary automatically
        "Content-Type": "multipart/form-data",
        Accept: "*/*",
      },
    });
  },

  /** Get thread details (messages included) by id */
  async getThreadById(threadId) {
    if (!threadId) {
      return { success: false, error: "threadId is required", status: null };
    }
    return performApiRequest(API_ENDPOINTS_MESSAGE.GET_THREAD_BY_ID(threadId), {
      method: "get",
    });
  },

  /** List threads for a userId */
  async getThreadsByUserId(userId) {
    if (!userId) {
      return { success: false, error: "userId is required", status: null };
    }
    return performApiRequest(
      API_ENDPOINTS_MESSAGE.GET_THREADS_BY_USER_ID(userId),
      { method: "get" }
    );
  },

  /** Soft-delete a message by id */
  async softDeleteMessage(messageId) {
    if (!messageId) {
      return { success: false, error: "messageId is required", status: null };
    }
    return performApiRequest(
      API_ENDPOINTS_MESSAGE.SOFT_DELETE_MESSAGE(messageId),
      { method: "delete" }
    );
  },

  /** Soft-delete a chat thread by id */
  async softDeleteThread(threadId) {
    if (!threadId) {
      return { success: false, error: "threadId is required", status: null };
    }
    return performApiRequest(
      API_ENDPOINTS_MESSAGE.SOFT_DELETE_THREAD(threadId),
      { method: "delete" }
    );
  },
};

export default messageService;
