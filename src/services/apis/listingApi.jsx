import {
  API_ENDPOINTS_LISTING,
  API_ENDPOINTS_ADMIN,
} from "../../constants/apiEndPoint";
import { performApiRequest } from "../../utils/apiUtils";

const listingService = {
  async getListings(params = {}) {
    return await performApiRequest(API_ENDPOINTS_LISTING.GET_ALL, {
      method: "get",
      params,
    });
  },

  async getById(id) {
    if (!id) {
      return {
        success: false,
        error: "Listing id is required",
        status: null,
      };
    }
    return await performApiRequest(API_ENDPOINTS_LISTING.GET_BY_ID(id), {
      method: "get",
    });
  },

  async getByStatus({
    pageIndex = 1,
    pageSize = 10,
    from = 0,
    to = 1000000000,
    status = "Pending",
  } = {}) {
    return await performApiRequest(API_ENDPOINTS_LISTING.GET_BY_STATUS, {
      method: "get",
      params: { pageIndex, pageSize, from, to, status },
    });
  },

  async getListingDetail(id) {
    if (!id) {
      return {
        success: false,
        error: "Listing id is required",
        status: null,
      };
    }

    return await performApiRequest(API_ENDPOINTS_LISTING.GET_DETAIL, {
      method: "get",
      params: { id },
    });
  },

  async getMyListings(pageIndex = 1, pageSize = 1000) {
    return await performApiRequest(
      API_ENDPOINTS_LISTING.GET_MY_LISTINGS(pageIndex, pageSize),
      {
        method: "get",
      }
    );
  },

  async createListing(data) {
    return await performApiRequest(API_ENDPOINTS_LISTING.CREATE_LISTING, {
      method: "post",
      data,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async updateListing(data) {
    return await performApiRequest(API_ENDPOINTS_LISTING.UPDATE_LISTING, {
      method: "put",
      data,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async acceptListing(id) {
    if (!id) {
      return { success: false, error: "Listing id is required", status: null };
    }
    return await performApiRequest(API_ENDPOINTS_ADMIN.ACCEPT_LISTING(id), {
      method: "post",
    });
  },

  async rejectListing(id, reason = "") {
    if (!id) {
      return { success: false, error: "Listing id is required", status: null };
    }
    // Backend expects reason as query param
    return await performApiRequest(
      `${API_ENDPOINTS_ADMIN.REJECT_LISTING(id)}?reason=${encodeURIComponent(
        reason || ""
      )}`,
      {
        method: "post",
      }
    );
  },
  async getVnPayUrl(id) {
    if (!id) {
      return {
        success: false,
        error: "Listing id is required",
        status: null,
      };
    }
    return await performApiRequest(API_ENDPOINTS_LISTING.LISTING_VNPAY(id), {
      method: "get",
    });
  },
};

export default listingService;
