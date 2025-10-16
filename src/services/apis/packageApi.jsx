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
  async updatePackage(data) {
    return await performApiRequest(API_ENDPOINTS_PACKAGE.UPDATE_PACKAGE, {
      method: "put",
      data,
    });
  },
  async deletePackage(id) {
    if (!id) throw new Error("Thiếu id gói");
    return await performApiRequest(API_ENDPOINTS_PACKAGE.DELETE_PACKAGE(id), {
      method: "delete",
    });
  },
};
export default packageService;
