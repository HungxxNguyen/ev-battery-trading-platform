import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_ADMIN } from "../../constants/apiEndPoint";

const adminService = {
  async getCountUser() {
    return performApiRequest(API_ENDPOINTS_ADMIN.GET_ALL_USERS, {
      method: "GET",
    });
  },
};

export default adminService;
