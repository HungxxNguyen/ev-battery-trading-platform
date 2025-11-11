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
  // Repayment URL for extending expired listings
  LISTING_REPAYMENT: (id) => `/api/Listing/Repayment/${id}`,
};

// Admin endpoints for listing moderation
export const API_ENDPOINTS_ADMIN = {
  GET_ALL_USERS: "api/Admin/Get-All-Users",
};

// Staff endpoints for listing moderation
export const API_ENDPOINTS_STAFF = {
  ACCEPT_LISTING: (id) => `/api/Staff/Accept-Listing/${id}`,
  REJECT_LISTING: (id, reason, descriptionReject) =>
    `/api/Staff/Reject-Listing/${id}?resonReject=${reason}&reason=${descriptionReject}`,
  // Staff: users management
  BAN_USER: (id, descriptionBan) => `/api/Staff/Ban-User/${id}?banDescription=${descriptionBan}`,
  UNBAN_USER: (id) => `/api/Staff/UbBan-User/${id}`
};

// Các endpoint cho user
export const API_ENDPOINTS_USER = {
  GET_USER: "/api/User/GetCurrentUser",
  UPDATE_INFORMATION_USER: "/api/User/UpdateInfoUser",
  // Get user by id (per backend): /api/User/GetUserById?userId={id}
  GET_BY_ID: (id) => `/api/User/GetUserById?userId=${id}`,
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

// Favourite endpoints (per provided backend)
export const API_ENDPOINTS_FAVOURITE = {
  ADD: "/api/Favourite/AddFavourite",
  CHECK: (userId, listingId) =>
    `/api/Favourite/CheckFavourite?userId=${userId}&listingId=${listingId}`,
  LIST: (userId) => `/api/Favourite/GetFavourites/${userId}`,
  DELETE: (userId, listingId) =>
    `/api/Favourite/DeleteFavourite?userId=${userId}&listingId=${listingId}`,
};

// Message/chat endpoints (per provided backend cURL)
export const API_ENDPOINTS_MESSAGE = {
  START_THREAD: "/api/Message/start-thread",
  SEND_MESSAGE: "/api/Message/send-message",
  GET_THREAD_BY_ID: (id) => `/api/Message/get-chat-thread-by-id/${id}`,
  // Fetch a single chat thread by listing id (for pin-based discovery)
  GET_THREAD_BY_LISTING_ID: (listingId) =>
    `/api/Message/get-chat-thread-by-listing-id/${listingId}`,
  GET_THREADS_BY_USER_ID: (userId) =>
    `/api/Message/get-chat-thread-by-user-id/${userId}`,
  SOFT_DELETE_MESSAGE: (messageId) =>
    `/api/Message/soft-delete-message/${messageId}`,
  SOFT_DELETE_THREAD: (threadId) =>
    `/api/Message/soft-delete-chat-thread/${threadId}`,
};

// Report
export const API_ENDPOINTS_REPORT = {
  // List tất cả report (phân trang)
  GET_ALL: (pageIndex = 1, pageSize = 20) =>
    `/api/Report?pageIndex=${pageIndex}&pageSize=${pageSize}`,

  // Tạo report
  CREATE: `/api/Report`,

  // Lấy/xóa report theo id
  GET_BY_ID: (id) => `/api/Report/${id}`,
  DELETE:      (id) => `/api/Report/${id}`,

  // Lấy report theo user và listing (phân trang)
  GET_BY_USER: (userId, pageIndex = 1, pageSize = 20) =>
    `/api/Report/user/${userId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
  GET_BY_LISTING: (listingId, pageIndex = 1, pageSize = 20) =>
    `/api/Report/listing/${listingId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
};

// Transaction endpoints
export const API_ENDPOINTS_TRANSACTION = {
  // Get transactions by userId with pagination
  GET_BY_USER_ID: (userId, pageIndex = 1, pageSize = 10) =>
    `/api/Transaction/GetTransactionsByUserId/${userId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
};
