// src/pages/VerifyOtp/VerifyOtp.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import authService from "../../services/apis/authApi";
import { MESSAGES } from "../../constants/messages";
import backgroundImg from "../../assets/background.png";
import { useNotification } from "../../contexts/NotificationContext"; // dùng context mới

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification(); // dùng context mới

  useEffect(() => {
    // Lấy email từ state navigation hoặc localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem("registerEmail");

    if (!emailFromState && !emailFromStorage) {
      navigate("/register");
      return;
    }

    setEmail(emailFromState || emailFromStorage);
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.verifyOtp({
        email: email,
        otp: otp,
      });

      if (response.success) {
        localStorage.removeItem("registerEmail");
        showNotification(MESSAGES.AUTH.VERIFY_EMAIL_SUCCESS, "success");
        navigate("/login");
      } else {
        setError(response.error || MESSAGES.AUTH.OTP_VERIFICATION_FAILED);
      }
    } catch (err) {
      setError(MESSAGES.AUTH.OTP_VERIFICATION_FAILED);
      console.error("OTP verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await authService.resendOtp({ email });
      if (response.success) {
        setCountdown(60);
        showNotification(MESSAGES.AUTH.OTP_RESENT, "success");
      } else {
        setError(response.error || MESSAGES.AUTH.OTP_RESEND_FAILED);
      }
    } catch (err) {
      setError(MESSAGES.AUTH.OTP_RESEND_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Background (blur + darken) */}
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

      {/* Card glass theo concept VoltX */}
      <div className="bg-gray-800/95 backdrop-blur-md shadow-2xl shadow-cyan-500/20 rounded-2xl w-full max-w-lg overflow-hidden border border-cyan-500/30">
        {/* Back */}
        <div className="px-6 pt-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Quay lại
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-cyan-300">Xác thực OTP</h2>
            <p className="text-sm text-blue-200 mt-2">
              Mã OTP đã được gửi đến{" "}
              <span className="font-semibold">{email}</span>
            </p>
          </div>

          {/* Form (logic giữ nguyên) */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1">Mã OTP</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type="text"
                  placeholder="Nhập mã OTP 6 chữ số"
                  className="w-full pl-10 pr-4 py-2 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none bg-gray-800/50 text-white placeholder-blue-300 transition-all duration-300"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${
                loading
                  ? "bg-cyan-700/50 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-500 hover:shadow-[0_0_10px_rgba(6,182,212,0.5),_0_0_20px_rgba(6,182,212,0.3)]"
              }`}
            >
              {loading ? "Đang xác thực..." : "Xác thực"}
            </button>

            <div className="text-center text-sm text-blue-200">
              {countdown > 0 ? (
                <p>Gửi lại mã sau {countdown} giây</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className={`font-semibold transition-colors duration-200 ${
                    loading
                      ? "text-cyan-300/60 cursor-not-allowed"
                      : "text-cyan-300 hover:underline"
                  }`}
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>
          </form>

          <p className="mt-8 text-xs text-center text-blue-300">
            © {new Date().getFullYear()} VoltX Exchange. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
