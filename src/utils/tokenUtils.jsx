// src/utils/tokenUtils.js
import { jwtDecode } from "jwt-decode";

/**
 * Decode token và lấy thông tin từ token
 * @param {string} token - Token dưới dạng chuỗi
 * @returns {Object} - Đối tượng chứa email, role, userName, userId, và exp
 */
export const decodeToken = (token) => {
  try {
    const decodedToken = jwtDecode(token);

    const email =
      decodedToken.sub ||
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ];
    const role =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    const userName =
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ];
    const userId = decodedToken.id;
    const exp = decodedToken.exp;

    return { email, role, userName, userId, exp };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
