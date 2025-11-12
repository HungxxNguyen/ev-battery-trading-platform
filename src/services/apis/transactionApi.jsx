// ===============================
// File: src/services/apis/transactionApi.jsx
// ===============================
import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_TRANSACTION } from "../../constants/apiEndPoint";

// Chuẩn hoá mảng items từ nhiều dạng payload khác nhau
function extractItems(payload) {
  const p = payload?.data ?? payload;
  if (Array.isArray(p)) return p;
  if (Array.isArray(p?.items)) return p.items;
  if (Array.isArray(p?.data)) return p.data;
  if (p && typeof p === "object") {
    for (const k of Object.keys(p)) {
      if (Array.isArray(p[k])) return p[k];
    }
  }
  return [];
}

// Build URL + query an toàn cho mọi kiểu định nghĩa GET_BY_USER_ID
function buildRequest(userId, pageIndex, pageSize) {
  const fn = API_ENDPOINTS_TRANSACTION?.GET_BY_USER_ID;
  let url = typeof fn === "function" ? fn(userId, pageIndex, pageSize) : fn;

  // Nếu URL chưa có pageIndex/pageSize thì gắn qua params
  const needQueryParams = typeof url === "string" && !/[?&](pageIndex|pageSize)=/.test(url);
  const reqInit = { method: "get" };
  if (needQueryParams) {
    reqInit.params = { pageIndex, pageSize };
  }
  return { url, reqInit };
}

const transactionService = {
  /**
   * Get 1 trang giao dịch theo userId (giữ nguyên chữ ký cũ)
   */
  async getByUserId(userId, pageIndex = 1, pageSize = 10) {
    if (!userId) {
      return { success: false, error: "userId is required", status: null };
    }
    const { url, reqInit } = buildRequest(userId, pageIndex, pageSize);
    return performApiRequest(url, reqInit);
  },

  /**
   * NEW: Lấy *toàn bộ* giao dịch của user (lặp trang đến khi hết)
   */
  async getAllByUserId(
    userId,
    { pageSize = 200, maxPages = 10, startPage = 1, delayMs = 0, onProgress } = {}
  ) {
    if (!userId) return [];
    const all = [];

    for (let page = startPage; page < startPage + maxPages; page++) {
      try {
        const res = await this.getByUserId(userId, page, pageSize);
        const items = extractItems(res);
        all.push(...items);
        onProgress?.({ total: all.length, page, received: items.length });
        if (!items || items.length < pageSize) break; // hết trang
        if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
      } catch {
        break; // lỗi 1 trang ⇒ dừng an toàn
      }
    }
    return all;
  },
};

// Alias để không phải sửa các nơi đang gọi tên cũ
transactionService.getAllTransactionsByUserId = transactionService.getAllByUserId;

export default transactionService;
