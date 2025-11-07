import { performApiRequest } from "../../utils/apiUtils";

// Report reasons available from backend
export const REPORT_REASONS = [
  "Scam",
  "Duplicate",
  "Sold",
  "UnableToContact",
  "IncorrectInformation",
  "Other",
];

// Try to reuse base URL from environment if present; otherwise rely on same-origin proxy
const BASE_PATH = "/api/Report";

// Create a report (multipart/form-data as per backend contract)
export const createReport = async (formData) => {
  const res = await performApiRequest(`${BASE_PATH}`, {
    method: "post",
    data: formData,
  });
  return res.data;
};

export const getReportById = async (id) => {
  const res = await performApiRequest(`${BASE_PATH}/${id}`, {
    method: "get",
  });
  return res.data;
};

export const getReportsByUser = async (
  userId,
  { pageIndex = 1, pageSize = 20 } = {},
) => {
  const res = await performApiRequest(
    `${BASE_PATH}/user/${userId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    {
      method: "get",
    }
  );
  return res.data;
};

export const getReportsByListing = async (
  listingId,
  { pageIndex = 1, pageSize = 20 } = {},
) => {
  const res = await performApiRequest(
    `${BASE_PATH}/listing/${listingId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    {
      method: "get",
    }
  );
  return res.data;
};

// Admin: get all reports
export const getAllReports = async (
  { pageIndex = 1, pageSize = 20 } = {},
) => {
  const res = await performApiRequest(
    `${BASE_PATH}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    {
      method: "get",
    }
  );
  return res.data;
};

export default {
  REPORT_REASONS,
  createReport,
  getReportById,
  getReportsByUser,
  getReportsByListing,
  getAllReports,
};
