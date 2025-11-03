import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_FAVOURITE } from "../../constants/apiEndPoint";

const favouriteService = {
  async addFavourite({ userId, listingId }) {
    if (!userId || !listingId) {
      return { success: false, error: "userId and listingId are required", status: null };
    }
    return performApiRequest(API_ENDPOINTS_FAVOURITE.ADD, {
      method: "post",
      data: { userId, listingId },
    });
  },

  async checkFavourite({ userId, listingId }) {
    if (!userId || !listingId) {
      return { success: false, error: "userId and listingId are required", status: null };
    }
    return performApiRequest(
      API_ENDPOINTS_FAVOURITE.CHECK(userId, listingId),
      { method: "get" }
    );
  },

  async getFavourites(userId) {
    if (!userId) {
      return { success: false, error: "userId is required", status: null };
    }
    return performApiRequest(API_ENDPOINTS_FAVOURITE.LIST(userId), { method: "get" });
  },

  async deleteFavourite({ userId, listingId }) {
    if (!userId || !listingId) {
      return { success: false, error: "userId and listingId are required", status: null };
    }
    return performApiRequest(
      API_ENDPOINTS_FAVOURITE.DELETE(userId, listingId),
      { method: "delete" }
    );
  },
};

export default favouriteService;

