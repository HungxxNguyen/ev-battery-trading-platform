import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_PACKAGE } from "../../constants/apiEndPoint";

const packageService = {
  async getAllPackages() {
    return await performApiRequest(API_ENDPOINTS_PACKAGE.GET_ALL, {
      method: "get",
    });
  },
  async getPackageById(id) {
    return await performApiRequest(API_ENDPOINTS_PACKAGE.GET_BY_ID(id), {
      method: "get",
    });
  },
  async createPackage(data) {
    return await performApiRequest(API_ENDPOINTS_PACKAGE.CREATE_PACKAGE, {
      method: "post",
      data,
    });
  },
};
export default packageService;
