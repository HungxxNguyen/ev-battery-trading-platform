// src/services/apis/userManagementApi.jsx
import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_STAFF } from "../../constants/apiEndPoint";

/**
 * Service chuẩn hóa trả về:
 * { success: boolean, data?: any, error?: string, status?: number }
 */
const userManagementService = {
  /**
   * Ban user với lý do bắt buộc
   * @param {string} userId
   * @param {string} banDescription
   */
  async banUser(userId, banDescription) {
    if (!userId) return { success: false, error: "User id is required" };
    if (!banDescription?.trim())
      return { success: false, error: "Ban description is required" };

    return performApiRequest(API_ENDPOINTS_STAFF.BAN_USER(userId), {
      method: "put",
      // để axios tự encode query
      params: { banDescription },
    });
  },

  /**
   * Unban user
   * @param {string} userId
   */
  async unbanUser(userId) {
    if (!userId) return { success: false, error: "User id is required" };
    return performApiRequest(API_ENDPOINTS_STAFF.UNBAN_USER(userId), {
      method: "put",
    });
  },
};

export default userManagementService;
