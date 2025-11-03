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
          // Save role for later use
          localStorage.setItem("role", tokenInfo.role);
          setIsAuthenticated(true);
          try {
            const response = await userService.getCurrentUser();
            if (response.success) {
              setUser(response.data?.data);
            } else {
              console.error("Failed to fetch user data:", response.error);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [isUpdate]);

  const login = async (userData, token) => {
    if (!userData || !token) {
      console.error("Invalid userData or token");
      return;
    }

    const tokenInfo = decodeToken(token);
    if (!tokenInfo || tokenInfo.exp <= Date.now() / 1000) {
      alert("Token khong hop le hoac da het han");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", tokenInfo.role);
    setIsAuthenticated(true);

    // Fetch user info
    try {
      const response = await userService.getCurrentUser();
      if (response.success) {
        setUser(response.data?.data);
      } else {
        console.error("Failed to fetch user data:", response.error);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const logout = () => {
    localStorage.clear();
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

