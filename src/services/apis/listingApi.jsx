import { API_ENDPOINTS_LISTING } from "../../constants/apiEndPoint";
import { performApiRequest } from "../../utils/apiUtils";

const listingService = {
  async getListings() {
    return await performApiRequest(API_ENDPOINTS_LISTING.GET_LISTING, {
      method: "get",
    });
  },
};

export default listingService;
