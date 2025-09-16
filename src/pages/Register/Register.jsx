import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaQuestionCircle } from "react-icons/fa";
import logo3 from './../../assets/logo3.png';
import backgroundImg from './../../assets/background.png';
import { MESSAGES } from "../../constants/messages";
// import { decodeToken } from "../../utils/tokenUtils";
import { useNotification } from "../../contexts/NotificationContext";
import { motion } from "framer-motion";
import { validatePhoneNumber, validateRegisterForm } from "../../utils/validationUtils";

// Tách các thành phần nhỏ thành component riêng
const Tooltip = ({ content }) => (
  <span className="inline-flex items-center align-middle ml-1 group relative">
    <FaQuestionCircle className="text-blue-300 cursor-help text-sm align-middle" />
    <div className="absolute z-10 hidden group-hover:block w-64 p-2 text-xs bg-gray-800 text-white rounded shadow-lg top-full left-0 mt-1">
      {content}
    </div>
  </span>
);

const InputField = ({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  tooltipContent,
  ...props
}) => (
  <div>
    <label className="block text-sm text-blue-200 mb-1">
      {props.label}
      {tooltipContent && <Tooltip content={tooltipContent} />}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2 border ${
          error ? "border-red-500" : "border-cyan-500/30"
        } rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none bg-gray-800/50 text-white placeholder-blue-300 transition-all duration-300`}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    userName: "",
    phoneNo: "",
    passwordHash: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    UserName: "",
    Email: "",
    PhoneNo: "",
    PasswordHash: "",
  });

  const handleAuthSuccess = useCallback((token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    showNotification(MESSAGES.AUTH.REGISTER_SUCCESS, "success");

    const redirectPaths = {
      Artisan: "/profile-user/profile",
      default: "/",
    };

    window.location.href = redirectPaths[role] || redirectPaths.default;
  }, []);

  const validateToken = useCallback((token) => {
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
  }, []);

  const validateForm = useCallback(() => {
    const { errors, isValid } = validateRegisterForm(form, confirmPassword);
    setErrors(errors);
    return isValid;
  }, [form, confirmPassword]);

  const handlePhoneChange = useCallback((e) => {
    const value = e.target.value;
    setErrors((prev) => ({
      ...prev,
      PhoneNo: validatePhoneNumber(value),
    }));
    setForm((prev) => ({ ...prev, PhoneNo: value }));
  }, []);

  const handleRegister = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.register(form);

        if (response.success) {
          showNotification(MESSAGES.AUTH.REGISTER_SUCCESS, "success");
          localStorage.setItem("registerEmail", form.Email);

          navigate("/verify-otp", { state: { Email: form.Email } });
        } else {
          showNotification(response.error || MESSAGES.AUTH.REGISTER_FAILED);
        }
      } catch (error) {
        console.error("Registration error:", error);
        showNotification(MESSAGES.AUTH.REGISTER_FAILED);
      } finally {
        setLoading(false);
      }
    },
    [form, confirmPassword, navigate, validateForm]
  );

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const tooltips = {
    userName: (
      <>
        Tên người dùng bao gồm:
        <ul className="list-disc pl-4 mt-1">
          <li>Ít nhất 6 ký tự.</li>
          <li>Không ký tự đặc biệt.</li>
        </ul>
      </>
    ),
    phone: (
      <>
        Số điện thoại bao gồm:
        <ul className="list-disc pl-4 mt-1">
          <li>10 chữ số.</li>
          <li>Không có chữ hoặc ký tự đặc biệt.</li>
          <li>Bắt đầu bằng số 0.</li>
          <li>Không chứa khoảng trắng hoặc ký tự khác ngoài số.</li>
        </ul>
      </>
    ),
    password: (
      <>
        Mật khẩu từ 8-20 ký tự, bao gồm:
        <ul className="list-disc pl-4 mt-1">
          <li>Chữ hoa (A-Z)</li>
          <li>Chữ thường (a-z)</li>
          <li>Số (0-9)</li>
          <li>Ký tự đặc biệt (!@#$%^&*)</li>
          <li>Ví dụ: Abc1234!</li>
        </ul>
      </>
    ),
  };

  return (
    <motion.main
      className="min-h-screen relative flex items-center justify-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={backgroundImg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover blur-md brightness-75 z-[-1]"
        crossOrigin="anonymous"
      />

      <div className="bg-gray-800/95 backdrop-blur-md shadow-2xl shadow-cyan-500/20 rounded-2xl max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-cyan-500/30">
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

        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-cyan-300">Đăng ký</h2>
          <p className="text-sm text-blue-200 mb-6">
            Vui lòng điền thông tin để tạo tài khoản
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <InputField
              icon={FaUser}
              label="Tên người dùng"
              name="UserName"
              placeholder="Tên người dùng"
              value={form.UserName}
              onChange={handleInputChange}
              error={errors.userName}
              tooltipContent={tooltips.userName}
            />

            <InputField
              icon={FaEnvelope}
              type="email"
              label="Email"
              name="Email"
              placeholder="Email"
              autoComplete="username"
              value={form.Email}
              onChange={handleInputChange}
              error={errors.email}
            />

            <InputField
              icon={FaPhone}
              type="tel"
              label="Số điện thoại"
              name="PhoneNo"
              placeholder="Số điện thoại ít nhất 10 số"
              value={form.PhoneNo}
              onChange={handlePhoneChange}
              error={errors.phoneNo}
              maxLength={10}
              tooltipContent={tooltips.phone}
            />

            <InputField
              icon={FaLock}
              type="password"
              label="Mật khẩu"
              name="PasswordHash"
              placeholder="Mật khẩu"
              autoComplete="new-password"
              value={form.PasswordHash}
              onChange={handleInputChange}
              error={errors.passwordHash}
              tooltipContent={tooltips.password}
            />

            <InputField
              icon={FaLock}
              type="password"
              label="Xác nhận mật khẩu"
              placeholder="Xác nhận mật khẩu"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${
                loading
                  ? "bg-cyan-700/50 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-500 hover:shadow-glow-cyan"
              }`}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>

            <p className="text-sm text-center text-blue-200">
              Bạn đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-cyan-300 font-medium hover:underline transition-all duration-300"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </form>

          <p className="mt-8 text-xs text-center text-blue-300">
            © {new Date().getFullYear()} VoltX Exchange. All rights reserved.
          </p>
        </div>
      </div>
    </motion.main>
  );
};

export default Register;