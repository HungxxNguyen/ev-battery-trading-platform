import React, { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import logo3 from "./../../assets/logo3.png";
import backgroundImg from "./../../assets/background.png";
import { motion } from "framer-motion";
import { validateLoginForm } from "../../utils/validationUtils";
import { useNotification } from "../../contexts/NotificationContext";
import { decodeToken } from "../../utils/tokenUtils";
import { MESSAGES } from "../../constants/messages";
import authService from "../../services/apis/authApi";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ Email: "", PasswordHash: "" });
  const { showNotification } = useNotification();
  const [errors, setErrors] = useState({ email: "", passwordHash: "" });

  const location = useLocation();

  const handleAuthSuccess = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    showNotification(MESSAGES.AUTH.LOGIN_SUCCESS, "success");

    let target = "/";
    try {
      if (role === "Admin") {
        target = "/admin";
      } else {
        const params = new URLSearchParams(window.location.search);
        const qsRedirect = params.get("redirect");
        if (qsRedirect && typeof qsRedirect === "string" && qsRedirect.startsWith("/") && !qsRedirect.startsWith("//")) {
          target = qsRedirect;
        } else if (location?.state?.from) {
          const from = location.state.from;
          const fromPath = (from.pathname || "/") + (from.search || "");
          if (fromPath.startsWith("/")) target = fromPath;
        }
      }
    } catch (e) {
      target = role === "Admin" ? "/admin" : "/";
    }

    setTimeout(() => {
      window.location.href = target;
    }, 500);
  };

  const validateToken = (token) => {
    const tokenInfo = decodeToken(token);
    if (!tokenInfo) {
      showNotification("Token không hợp lệ");
      return null;
    }

    const currentTime = Date.now() / 1000;
    if (tokenInfo.exp < currentTime) {
      showNotification("Token đã hết hạn");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return null;
    }

    return tokenInfo;
  };

  const validateForm = useCallback(() => {
    const { errors, isValid } = validateLoginForm(form);
    setErrors(errors);
    return isValid;
  }, [form]);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      if (!validateForm()) return;

      try {
        const result = await authService.login(form);
        if (!result.success) {
          throw new Error(result.error || MESSAGES.AUTH.LOGIN_FAILED);
        }

        const tokenInfo = validateToken(result.data.data.accessToken);
        if (!tokenInfo) return;

        handleAuthSuccess(result.data.data.accessToken, tokenInfo.role);
      } catch (error) {
        console.error("Login error:", error);
        showNotification(error.message);
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <motion.main
      className="min-h-screen relative flex items-center justify-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <BackgroundImage />

      <div className="bg-gray-800/95 backdrop-blur-md shadow-2xl shadow-cyan-500/20 rounded-2xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-cyan-500/30">
        <LoginBanner />

        <div className="p-8 md:p-12">
          <LoginHeader />

          <form onSubmit={handleLogin} className="space-y-4">
            <FormInput
              label="Email"
              type="email"
              name="Email"
              value={form.Email}
              onChange={handleInputChange}
              icon={<FaUser />}
              placeholder="Email"
              autoComplete="username"
              error={errors.email}
            />

            <FormInput
              label="Mật khẩu"
              type="password"
              name="PasswordHash"
              value={form.PasswordHash}
              onChange={handleInputChange}
              icon={<FaLock />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
              error={errors.passwordHash}
            />

            <div className="flex justify-between text-sm text-blue-200 font-bold">
              <Link
                to="/forgetpassword"
                className="hover:text-cyan-300 transition-colors duration-200 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <SubmitButton loading={loading} text="Đăng nhập" />

            <RegisterLink />
          </form>

          <Footer />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .hover\\:shadow-glow-cyan {
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3);
        }
      `}</style>
    </motion.main>
  );
};

// Extracted Components
const BackgroundImage = () => (
  <div
    style={{
      backgroundImage: `url(${backgroundImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "blur(4px) brightness(0.5)",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
    }}
  />
);

const LoginBanner = () => (
  <div className="bg-transparent text-blue-200 flex flex-col justify-center items-center p-8 space-y-4">
    <Link to="/">
      <img
        src={logo3}
        alt="VoltX Exchange Logo"
        className="w-40 h-40 object-contain rounded-full shadow-md shadow-cyan-500/50 animate-pulse"
        crossOrigin="anonymous"
      />
    </Link>
    <h2 className="text-2xl font-bold text-center text-cyan-300">
      VoltX Exchange
    </h2>
    <p className="text-center text-sm text-blue-300 opacity-90">
      Kết nối người mua và bán xe điện & pin đã qua sử dụng
    </p>
  </div>
);

const LoginHeader = () => (
  <>
    <h2 className="text-2xl font-bold text-cyan-300">Đăng nhập</h2>
    <p className="text-sm text-blue-200 mb-6">Vui lòng đăng nhập để tiếp tục</p>
  </>
);

const FormInput = ({ label, icon, error, ...props }) => (
  <div>
    <label className="block text-sm text-blue-200 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
        {icon}
      </span>
      <input
        className="w-full pl-10 pr-4 py-2 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none bg-gray-800/50 text-white placeholder-blue-300 transition-all duration-300"
        required
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  </div>
);

const SubmitButton = ({ loading, text }) => (
  <button
    type="submit"
    disabled={loading}
    className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${
      loading
        ? "bg-cyan-700/50 cursor-not-allowed"
        : "bg-cyan-600 hover:bg-cyan-500 hover:shadow-glow-cyan"
    }`}
  >
    {loading ? "Đang xử lý..." : text}
  </button>
);

const RegisterLink = () => (
  <p className="text-sm text-center text-blue-200">
    Bạn chưa có tài khoản?{" "}
    <Link
      to="/register"
      className="text-cyan-300 font-medium hover:underline transition-all duration-300"
    >
      Đăng ký ngay
    </Link>
  </p>
);

const Footer = () => (
  <p className="mt-8 text-xs text-center text-blue-300">
    © {new Date().getFullYear()} VoltX Exchange. All rights reserved.
  </p>
);

export default Login;


