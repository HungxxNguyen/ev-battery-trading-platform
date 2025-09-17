import axiosInstance from "../services/axiosInstance";

export const performApiRequest = async (
  endpoint,
  { data = {}, method = "post", params, headers = {} } = {}
) => {
  try {
    let response;
    method = method.toLowerCase(); // Chuẩn hóa method

    // Cấu hình request
    const config = {
      params,
      headers: {
        ...headers, // Kết hợp headers từ tham số truyền vào
      },
      data,
    };

    // Nếu dữ liệu là FormData, xóa Content-Type để Axios tự đặt multipart/form-data
    if (data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (method === "get" && params) {
      response = await axiosInstance.get(endpoint, config);
    } else if (method === "put") {
      response = await axiosInstance.put(endpoint, data, config);
    } else if (method === "delete") {
      // Cho phép cả data (nếu API yêu cầu) và params
      response = params
        ? await axiosInstance.delete(endpoint, config)
        : await axiosInstance.delete(endpoint, { ...config, data });
    } else {
      // Mặc định cho post và các phương thức khác
      response = await axiosInstance[method](endpoint, data, config);
    }

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const handleError = (error) => {
  if (error.response) {
    console.error(`API Error [${error.response.status}]:`, error.response.data);
    const errorMessage = error.response.data?.errors
      ? Object.values(error.response.data.errors).join(", ")
      : error.response.data?.message || error.response.data || "Lỗi server";
    return {
      success: false,
      error: errorMessage,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    console.error("Network Error:", error.message);
    return {
      success: false,
      error: "Không thể kết nối tới server",
      status: null,
    };
  } else {
    console.error("Request Error:", error.message);
    return {
      success: false,
      error: error.message || "Lỗi khi gửi yêu cầu",
      status: null,
    };
  }
};