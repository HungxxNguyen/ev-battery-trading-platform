import axios from 'axios';
import { API_BASE_URL } from '../constants/apiEndPoint';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
  // Thêm cấu hình để xử lý HTTP/HTTPS
  httpsAgent: false,
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để log lệnh curl và xử lý Content-Type
axiosInstance.interceptors.request.use(
  (config) => {
    const method = config.method.toUpperCase();
    let curlCommand = `curl -X '${method}' '${config.url}'`;

    // Thêm headers
    for (const [key, value] of Object.entries(config.headers)) {
      if (value && key !== 'Content-Type') {
        curlCommand += ` -H '${key}: ${value}'`;
      }
    }

    // Xử lý data
    if (config.data) {
      if (config.data instanceof FormData) {
        // Xóa Content-Type nếu là FormData
        delete config.headers['Content-Type'];
        // Thêm các field từ FormData
        for (let [key, value] of config.data.entries()) {
          if (value instanceof File) {
            curlCommand += ` -F '${key}=@${value.name}'`;
          } else {
            curlCommand += ` -F '${key}=${value}'`;
          }
        }
      } else {
        // Xử lý JSON hoặc dữ liệu khác
        curlCommand += ` -d '${JSON.stringify(config.data)}'`;
      }
    }

    console.log('Generated cURL command:', curlCommand);
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi 401 (Unauthorized) và các lỗi khác
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios Error:', error); // Thêm log để debug
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;