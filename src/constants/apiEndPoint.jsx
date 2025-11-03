export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Các endpoint cho xác thực
export const API_ENDPOINTS_AUTH = {
  LOGIN: "/api/Auth/user/login",
  REGISTER: "/api/Auth/user/register/user",
  VERIFY_EMAIL: "/api/Auth/user/otp/verify",
  LOGOUT: "/auth/logout",
  CHANGE_PASSWORD: "/api/Auth/user/password/change",
  FORGOT_PASSWORD: "/api/Auth/user/password/forgot",
  RESET_PASSWORD: "/api/Auth/user/password/reset",
  RESEND_OTP: (email) => `/api/Auth/user/otp/resend?email=${email}`,
  // Thêm các endpoint khác
};

// Các endpoint cho sản phẩm
export const API_ENDPOINTS_LISTING = {
  GET_ALL: "/api/Listing/GetAll",
  GET_DETAIL: "/api/Listing/GetDetail",
  // Backend detail by id (per provided cURL)
  GET_BY_ID: (id) => `/api/Listing/GetById/${id}`,
  GET_MY_LISTINGS: (pageIndex, pageSize) =>
    `/api/Listing/MyListings?pageIndex=${pageIndex}&pageSize=${pageSize}`,
  CREATE_LISTING: "/api/Listing/CreateListing",
  // Update existing listing (multipart form)
  UPDATE_LISTING: "/api/Listing/UpdateListing",
  // Admin: get listings filtered by status/price range/pagination
  GET_BY_STATUS: (pageIndex, pageSize, status) =>
    `/api/Listing/GetByStatus?pageIndex=${pageIndex}&pageSize=${pageSize}&status=${status}`,
  // VNPAY payment URL
  LISTING_VNPAY: (id) => `/api/Listing/VnpayUrl/${id}`,
};

// Admin endpoints for listing moderation
export const API_ENDPOINTS_ADMIN = {
  ACCEPT_LISTING: (id) => `/api/Admin/Accept-Listing/${id}`,
  REJECT_LISTING: (id) => `/api/Admin/Reject-Listing/${id}`,
  // Admin: users management
  GET_ALL_USERS: "/api/Admin/Get-All-Users",
};

// Các endpoint cho user
export const API_ENDPOINTS_USER = {
  GET_USER: "/api/User/GetCurrentUser",
  UPDATE_INFORMATION_USER: "/api/User/UpdateInfoUser",
};

export const API_ENDPOINTS_BRAND = {
  GET_BRANDS: "/api/Brand/GetAll",
  GET_BY_ID: (id) => `/api/Brand/GetById/id?id=${id}`,
  CREATE: "/api/Brand/Create",
  UPDATE: "/api/Brand/Update",
  DELETE: (id) => `/api/Brand/Delete/id?id=${id}`,
};

export const API_ENDPOINTS_PACKAGE = {
  GET_ALL: "/api/Package/GetAll",
  // Backend expects '/GetById/id?id={id}' per provided cURL
  GET_BY_ID: (id) => `/api/Package/GetById/id?id=${id}`,
  CREATE_PACKAGE: "/api/Package/Create",
  // Backend uses '/api/Package/Update' (multipart form)
  UPDATE_PACKAGE: "/api/Package/Update",
  DELETE_PACKAGE: (id) => `/api/Package/Delete/id?id=${id}`,
};
