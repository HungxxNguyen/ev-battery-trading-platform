// ===============================
// File: src/services/apis/adminApi.jsx
// ===============================
import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_ADMIN } from "../../constants/apiEndPoint";

// Chuẩn hoá mảng item từ các kiểu payload khác nhau
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

const adminService = {
  // Giữ lại để không phá chỗ cũ đang dùng
  async getCountUser() {
    return performApiRequest(API_ENDPOINTS_ADMIN.GET_ALL_USERS, {
      method: "GET",
    });
  },

  async getUsersPage(pageIndex = 1, pageSize = 100) {
    return performApiRequest(API_ENDPOINTS_ADMIN.GET_ALL_USERS, {
      method: "GET",
      params: { pageIndex, pageSize },
    });
  },

  // Lấy toàn bộ users (gom trang, dừng khi ít hơn pageSize)
  async getAllUsersAllPages({ pageSize = 200, maxPages = 20 } = {}) {
    const all = [];
    for (let page = 1; page <= maxPages; page++) {
      try {
        const res = await this.getUsersPage(page, pageSize);
        const items = extractItems(res);
        all.push(...items);
        if (!items || items.length < pageSize) break;
      } catch {
        break;
      }
    }
    return all;
  },
};

export default adminService;

