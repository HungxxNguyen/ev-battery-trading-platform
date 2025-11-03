// /srv/services/apis/userApi.jsx
import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_USER } from "../../constants/apiEndPoint";

const userService = {
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise<{success: boolean, data?: any, error?: string, status?: number}>}
   */
  async getCurrentUser() {
    return performApiRequest(API_ENDPOINTS_USER.GET_USER, { method: "get" });
  },

  /**
   * Cập nhật thông tin người dùng
   * @param {Object} userData - Dữ liệu người dùng cần cập nhật
   * @returns {Promise<{success: boolean, data?: any, error?: string, status?: number}>}
   */
  async updateUser(userData) {
    return performApiRequest(API_ENDPOINTS_USER.UPDATE_INFORMATION_USER, {
      method: "put",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: userData,
    });
  },

  /**
   * Lấy thông tin người dùng theo Id
   */
  async getById(id) {
    if (!id) {
      return { success: false, error: "User id is required", status: null };
    }
    return performApiRequest(API_ENDPOINTS_USER.GET_BY_ID(id), { method: "get" });
  },
};

export default userService;
