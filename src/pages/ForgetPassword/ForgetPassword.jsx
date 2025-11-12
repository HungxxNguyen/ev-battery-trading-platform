import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaLock, FaKey } from "react-icons/fa";
import logo3 from "./../../assets/logo3.png";
import backgroundImg from "./../../assets/background.png";
import authService from "../../services/apis/authApi";
import { MESSAGES } from "../../constants/messages";
import { motion } from "framer-motion";
import { useNotification } from "../../contexts/NotificationContext";

const ForgetPassword = () => {
  const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { showNotification } = useNotification();

  const handleSendToken = useCallback(async () => {
    if (!emailOrPhoneNumber) {
      showNotification(MESSAGES.AUTH.FORGET_FAILED, "error");
      return;
    }
    setSending(true);
    try {
      const res = await authService.forgotPassword(emailOrPhoneNumber);
      if (res?.success) {
        showNotification("Mã xác nhận đã được gửi đến email.", "success");
      } else {
        showNotification(res?.error || MESSAGES.COMMON.SERVER_ERROR, "error");
      }
    } catch (err) {
      console.error("Send token error:", err);
      showNotification(MESSAGES.COMMON.SERVER_ERROR, "error");
    } finally {
      setSending(false);
    }
  }, [emailOrPhoneNumber, showNotification]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (newPassword !== confirmNewPassword) {
        showNotification("Mật khẩu xác nhận không trùng khớp.", "error");
        return;
      }
      setLoading(true);
      try {
        const res = await authService.resetPassword(token, newPassword);
        if (res?.success) {
          showNotification("Đặt lại mật khẩu thành công!", "success");
          // Chuyển hướng về trang đăng nhập sau khi đặt lại mật khẩu thành công
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        } else {
          showNotification(
            res?.error || "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
            "error"
          );
        }
      } catch (error) {
        console.error("Reset password error:", error);
        showNotification("Lỗi hệ thống. Vui lòng thử lại sau.", "error");
      } finally {
        setLoading(false);
      }
    },
    [token, newPassword, confirmNewPassword, showNotification]
  );

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
        {/* Banner trái — giống Login */}
        <LeftBanner />

        {/* Form phải — style khớp Login */}
        <div className="p-8 md:p-12">
          <HeaderBlock
            title="Quên mật khẩu"
            subtitle="Nhập thông tin để đặt lại mật khẩu"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <FormInput
              label="Email"
              type="email"
              placeholder="Email"
              value={emailOrPhoneNumber}
              onChange={(e) => setEmailOrPhoneNumber(e.target.value)}
              icon={<FaUser />}
              rightAdornment={
                <button
                  type="button"
                  onClick={handleSendToken}
                  disabled={sending || !emailOrPhoneNumber}
                  className={`text-xs px-3 py-1 rounded font-medium transition-all duration-300 cursor-pointer
                  ${
                    sending || !emailOrPhoneNumber
                      ? "bg-cyan-700/50 cursor-not-allowed text-white/70"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-glow-cyan"
                  }`}
                >
                  {sending ? "Đang gửi..." : "Gửi mã"}
                </button>
              }
              autoComplete="username"
            />

            {/* Token */}
            <FormInput
              label="Mã xác nhận"
              type="text"
              placeholder="Mã xác nhận"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              icon={<FaKey />}
              autoComplete="one-time-code"
            />

            {/* Mật khẩu mới */}
            <FormInput
              label="Mật khẩu mới"
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<FaLock />}
              autoComplete="new-password"
            />

            {/* Xác nhận mật khẩu */}
            <FormInput
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              icon={<FaLock />}
              autoComplete="new-password"
            />

            {/* Submit */}
            <SubmitButton loading={loading} text="Đặt lại mật khẩu" />

            <p className="text-sm text-center text-blue-200">
              Quay lại{" "}
              <Link
                to="/login"
                className="text-cyan-300 font-medium hover:underline transition-all duration-300"
              >
                Đăng nhập
              </Link>
            </p>
          </form>

          <Footer />
        </div>
      </div>

      {/* hiệu ứng glow cho nút giống Login */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .hover\\:shadow-glow-cyan {
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3);
        }
      `}</style>
    </motion.main>
  );
};

/* ==== Sub-components (đồng bộ với Login) ==== */
const BackgroundImage = () => (
  <div
    style={{
      backgroundImage: `url(${backgroundImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "blur(4px) brightness(0.5)",
      position: "absolute",
      inset: 0,
      zIndex: -1,
    }}
  />
);

const LeftBanner = () => (
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

const HeaderBlock = ({ title, subtitle }) => (
  <>
    <h2 className="text-2xl font-bold text-cyan-300">{title}</h2>
    <p className="text-sm text-blue-200 mb-6">{subtitle}</p>
  </>
);

const FormInput = ({ label, icon, rightAdornment, ...props }) => (
  <div>
    <label className="block text-sm text-blue-200 mb-1">{label}</label>
    <div className="relative flex items-center">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300">
        {icon}
      </span>
      <input
        className={`w-full pl-10 ${
          rightAdornment ? "pr-28" : "pr-4"
        } py-2 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none bg-gray-800/50 text-white placeholder-blue-300 transition-all duration-300`}
        required
        {...props}
      />
      {rightAdornment && (
        <div className="absolute right-2">{rightAdornment}</div>
      )}
    </div>
  </div>
);

const SubmitButton = ({ loading, text }) => (
  <button
    type="submit"
    disabled={loading}
    className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-all duration-300 cursor-pointer ${
      loading
        ? "bg-cyan-700/50 cursor-not-allowed"
        : "bg-cyan-600 hover:bg-cyan-500 hover:shadow-glow-cyan"
    }`}
  >
    {loading ? "Đang xử lý..." : text}
  </button>
);

const Footer = () => (
  <p className="mt-8 text-xs text-center text-blue-300">
    © {new Date().getFullYear()} VoltX Exchange. All rights reserved.
  </p>
);

export default ForgetPassword;
