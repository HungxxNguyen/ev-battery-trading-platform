import { createContext, useState, useEffect } from "react";
import { decodeToken } from "../utils/tokenUtils";
import userService from "../services/apis/userApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const tokenInfo = decodeToken(token);
        if (tokenInfo && tokenInfo.exp > Date.now() / 1000) {
          // Lưu role vào localStorage
          localStorage.setItem("role", tokenInfo.role);
          setIsAuthenticated(true);
          try {
            const response = await userService.getCurrentUser();
            if (response.success) {
              setUser(response.data.data); // Cập nhật user từ API
              console.log("Data: ", response.data.data);
            } else {
              console.error("Failed to fetch user data:", response.error);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("role"); // Xóa role nếu token hết hạn
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [isUpdate]); // Chỉ chạy một lần khi component mount

  const login = async (userData, token) => {
    if (!userData || !token) {
      console.error("Invalid userData or token");
      return;
    }

    const tokenInfo = decodeToken(token);
    if (!tokenInfo || tokenInfo.exp <= Date.now() / 1000) {
      alert("Token không hợp lệ hoặc đã hết hạn");
      return;
    }

    localStorage.setItem("token", token); // Chỉ lưu token
    localStorage.setItem("role", tokenInfo.role); // Lưu role từ token
    setIsAuthenticated(true);

    // Gọi API để lấy thông tin user
    try {
      const response = await userService.getCurrentUser();
      if (response.success) {
        setUser(response.data); // Cập nhật user từ API
      } else {
        console.error("Failed to fetch user data:", response.error);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const logout = () => {
    localStorage.clear(); // Xóa toàn bộ localStorage (token và role)
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        setIsUpdate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
