import { API_ENDPOINTS_LISTING } from "../../constants/apiEndPoint";
import { performApiRequest } from "../../utils/apiUtils";

const listingService = {
  async getListings(params = {}) {
    return await performApiRequest(API_ENDPOINTS_LISTING.GET_ALL, {
      method: "get",
      params,
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
};

export default listingService;
