import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_REPORT } from "../../constants/apiEndPoint";

// Danh sách lý do (theo BE)
export const REPORT_REASONS = [
  "Scam",
  "Duplicate",
  "Sold",
  "UnableToContact",
  "IncorrectInformation",
  "Other",
];

/**
 * Lưu ý: các hàm bên dưới trả về payload JSON từ BE
 * (đồng nhất với cách bạn đang dùng trong UI: res?.error === 0)
 */

// Tạo report (multipart/form-data)
export const createReport = async (formData) => {
  const res = await performApiRequest(API_ENDPOINTS_REPORT.CREATE, {
    method: "post",
    data: formData,
  });
  return res.data;
};

// Lấy report theo id
export const getReportById = async (id) => {
  const res = await performApiRequest(API_ENDPOINTS_REPORT.GET_BY_ID(id), {
    method: "get",
  });
  return res.data;
};

// Xóa report theo id (nếu cần)
export const deleteReport = async (id) => {
  const res = await performApiRequest(API_ENDPOINTS_REPORT.DELETE(id), {
    method: "delete",
  });
  return res.data;
};

// Lấy report theo user (phân trang)
export const getReportsByUser = async (userId, { pageIndex = 1, pageSize = 20 } = {}) => {
  const res = await performApiRequest(
    API_ENDPOINTS_REPORT.GET_BY_USER(userId, pageIndex, pageSize),
    { method: "get" }
  );
  return res.data;
};

// Lấy report theo listing (phân trang)
export const getReportsByListing = async (listingId, { pageIndex = 1, pageSize = 20 } = {}) => {
  const res = await performApiRequest(
    API_ENDPOINTS_REPORT.GET_BY_LISTING(listingId, pageIndex, pageSize),
    { method: "get" }
  );
  return res.data;
};

// Staff: lấy tất cả report (phân trang)
export const getAllReports = async ({ pageIndex = 1, pageSize = 20 } = {}) => {
  const res = await performApiRequest(
    API_ENDPOINTS_REPORT.GET_ALL(pageIndex, pageSize),
    { method: "get" }
  );
  return res.data;
};

/**
 * Helper: Lấy URL ảnh bằng chứng từ reportId.
 * Trả về string URL | null (tùy thuộc field tên gì ở BE).
 */
export const getReportEvidenceUrl = async (reportId) => {
  const payload = await getReportById(reportId); // { error, message, data }
  const d = payload?.data || payload;
  if (!d) return null;

  // BE đang trả "imageReport" (theo swagger bạn chụp)
  return (
    d.imageReport ||
    d.imageReports ||          // fallback nếu BE đổi tên
    d.evidenceUrl || null
  );
};

export default {
  REPORT_REASONS,
  createReport,
  getReportById,
  deleteReport,
  getReportsByUser,
  getReportsByListing,
  getAllReports,
  getReportEvidenceUrl,
};
