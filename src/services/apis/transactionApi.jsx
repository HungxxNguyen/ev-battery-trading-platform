import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_TRANSACTION } from "../../constants/apiEndPoint";

const transactionService = {
  /**
   * Get paginated transactions by userId
   */
  async getByUserId(userId, pageIndex = 1, pageSize = 10) {
    if (!userId) {
      return { success: false, error: "userId is required", status: null };
    }
    return performApiRequest(
      API_ENDPOINTS_TRANSACTION.GET_BY_USER_ID(userId, pageIndex, pageSize),
      { method: "get" }
    );
  },
};

export default transactionService;

