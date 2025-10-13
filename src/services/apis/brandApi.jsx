import { API_ENDPOINTS_BRAND } from "../../constants/apiEndPoint";
import { performApiRequest } from "../../utils/apiUtils";

const brandService = {
  async getBrands() {
    return await performApiRequest(API_ENDPOINTS_BRAND.GET_BRANDS, {
      method: "get",
    });
  },
};

export default brandService;
