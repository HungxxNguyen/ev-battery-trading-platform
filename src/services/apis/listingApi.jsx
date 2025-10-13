import { API_ENDPOINTS_LISTING } from "../../constants/apiEndPoint";
import { performApiRequest } from "../../utils/apiUtils";

const listingService = {
  async getListings() {
    return await performApiRequest(API_ENDPOINTS_LISTING.GET_LISTING, {
      method: "get",
    });
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
