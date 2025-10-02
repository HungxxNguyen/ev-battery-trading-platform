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

  async checkSendRequestArtisan(userId) {
    return performApiRequest(
      API_ENDPOINTS_USER.CHECK_SEND_REQUEST_UPGRADE_ARTISAN(userId),
      {
        method: "get",
      }
    );
  },

  async getSentRequestByUserId(userId) {
    return performApiRequest(
      API_ENDPOINTS_USER.GET_SEND_REQUEST_UPGRADE_ARTISAN(userId),
      {
        method: "get",
      }
    );
  },

  async upgradeToArtisan(formData) {
    return performApiRequest(API_ENDPOINTS_USER.SEND_REQUEST_UPGRADE_ARTISAN, {
      method: "post",
      data: formData,
    });
  },

  async cancelArtisanRequest(userId) {
    return performApiRequest(
      API_ENDPOINTS_USER.CANCEL_REQUEST_UPGRADE_ARTISAN(userId),
      {
        method: "put",
      }
    );
  },

  async resendRequest(userId, requestId) {
    return performApiRequest(
      API_ENDPOINTS_USER.RESEND_SEND_REQUEST_UPGRADE_ARTISAN(userId, requestId),
      {
        method: "put",
      }
    );
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

  async updateArtisan(artisanData) {
    return performApiRequest(API_ENDPOINTS_USER.UPDATE_INFORMATION_ARTISAN, {
      method: "put",
      data: artisanData,
    });
  },
  async getCurrentArtisan(artisanId) {
    return performApiRequest(
      API_ENDPOINTS_USER.GET_CURRENT_ARTISAN(artisanId),
      {
        method: "get",
      }
    );
  },
};

export default userService;
