import {
  API_ENDPOINTS_LISTING,
  API_ENDPOINTS_STAFF,
} from "../../constants/apiEndPoint";
import { performApiRequest } from "../../utils/apiUtils";

// Chuẩn hoá mảng items từ nhiều dạng payload khác nhau
function extractItems(payload) {
  const p = payload?.data ?? payload;
  if (Array.isArray(p)) return p;
  if (Array.isArray(p?.items)) return p.items;
  if (Array.isArray(p?.data)) return p.data;
  if (p && typeof p === "object") {
    for (const k of Object.keys(p)) if (Array.isArray(p[k])) return p[k];
  }
  return [];
}

const listingService = {
  // (GIỮ NGUYÊN) — gọi GetAll mặc định (BE thường mặc định pageIndex=1,pageSize=10)
  async getListings(pageIndex = 1, pageSize = 10) {
    return await performApiRequest(
      API_ENDPOINTS_LISTING.GET_ALL(pageIndex, pageSize),
      {
        method: "get",
      }
    );
  },

  // ✅ MỚI — lấy 1 trang GetAll với tham số phân trang rõ ràng
  async getListingsPage(pageIndex = 1, pageSize = 10) {
    return await performApiRequest(
      API_ENDPOINTS_LISTING.GET_ALL(pageIndex, pageSize),
      {
        method: "get",
      }
    );
  },

  // ✅ MỚI — gom toàn bộ listing (lặp trang cho tới khi hết)
  async getAllListingsAllPages({ pageSize = 200, maxPages = 30 } = {}) {
    const all = [];
    for (let page = 1; page <= maxPages; page++) {
      const res = await this.getListingsPage(page, pageSize);
      const items = extractItems(res);
      all.push(...items);
      if (!items || items.length < pageSize) break; // hết dữ liệu
    }
    return all;
  },

  async getById(id) {
    if (!id) {
      return { success: false, error: "Listing id is required", status: null };
    }
    return await performApiRequest(API_ENDPOINTS_LISTING.GET_BY_ID(id), {
      method: "get",
    });
  },

  async getByStatus(pageIndex = 1, pageSize = 10, status = "Pending") {
    return await performApiRequest(
      API_ENDPOINTS_LISTING.GET_BY_STATUS(pageIndex, pageSize, status),
      { method: "get" }
    );
  },

  async getMyListings(pageIndex = 1, pageSize = 1000) {
    return await performApiRequest(
      API_ENDPOINTS_LISTING.GET_MY_LISTINGS(pageIndex, pageSize),
      { method: "get" }
    );
  },

  async createListing(data) {
    // Gợi ý: khi gửi FormData có thể KHÔNG set Content-Type để axios tự gắn boundary
    return await performApiRequest(API_ENDPOINTS_LISTING.CREATE_LISTING, {
      method: "post",
      data,
      // headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async updateListing(data) {
    return await performApiRequest(API_ENDPOINTS_LISTING.UPDATE_LISTING, {
      method: "put",
      data,
      // headers: { "Content-Type": "multipart/form-data" },
    });
  },
  async deleteListing(id) {
    if (!id)
      return { success: false, error: "Listing id is required", status: null };
    return await performApiRequest(API_ENDPOINTS_LISTING.DELETE_LISTING(id), {
      method: "delete",
    });
  },
  async confirmSoldListing(listingId) {
    return await performApiRequest(
      API_ENDPOINTS_LISTING.CONFIRM_SOLD_LISTING(listingId),
      { method: "put" }
    );
  },

  async acceptListing(id) {
    if (!id)
      return { success: false, error: "Listing id is required", status: null };
    return await performApiRequest(API_ENDPOINTS_STAFF.ACCEPT_LISTING(id), {
      method: "post",
    });
  },

  async rejectListing(id, reason = "", descriptionReject = "") {
    if (!id)
      return { success: false, error: "Listing id is required", status: null };
    return await performApiRequest(
      API_ENDPOINTS_STAFF.REJECT_LISTING(id, reason, descriptionReject),
      { method: "post" }
    );
  },

  async getVnPayUrl(id) {
    if (!id)
      return { success: false, error: "Listing id is required", status: null };
    return await performApiRequest(API_ENDPOINTS_LISTING.LISTING_VNPAY(id), {
      method: "get",
    });
  },

  async buyListing(id) {
    if (!id)
      return { success: false, error: "Listing id is required", status: null };
    return await performApiRequest(API_ENDPOINTS_LISTING.BUY_LISTING(id), {
      method: "get",
    });
  },

  async getRepaymentUrl(id) {
    if (!id)
      return { success: false, error: "Listing id is required", status: null };
    return await performApiRequest(
      API_ENDPOINTS_LISTING.LISTING_REPAYMENT(id),
      { method: "get" }
    );
  },
};

export default listingService;
