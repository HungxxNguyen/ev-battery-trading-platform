// ===============================
// File: src/services/apis/dashboardApi.jsx
// ===============================
import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_ADMIN } from "../../constants/apiEndPoint";

const dashboardService = {
  // GET /api/Admin/Listing-Dashboard
  async getListingDashboard() {
    return performApiRequest(API_ENDPOINTS_ADMIN.LISTING_DASHBOARD, {
      method: "get",
    });
  },
};

export default dashboardService;
