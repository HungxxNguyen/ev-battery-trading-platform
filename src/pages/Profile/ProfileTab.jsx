// src/pages/Profile/components/ProfileTab.jsx
import { useState, useRef, useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import userService from "../../services/apis/userApi";
import { useNotification } from "../../contexts/NotificationContext";
import authService from "../../services/apis/authApi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

/* ====================== NEW: small UI helpers ====================== */
const Spinner = ({ className = "h-5 w-5" }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    role="status"
    aria-label="loading"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const LoadingOverlay = ({ show, label = "Đang xử lý..." }) => {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[1px] flex items-center justify-center"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="bg-white rounded-xl shadow-xl px-6 py-5 flex items-center gap-3">
        <Spinner />
        <span className="font-medium text-gray-800">{label}</span>
      </div>
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
        </div>
        <div className="h-9 w-36 bg-gray-200 rounded-md" />
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-gray-200" />
        <div className="h-5 w-40 bg-gray-200 rounded mt-4" />
        <div className="h-4 w-56 bg-gray-200 rounded mt-2" />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-5 w-44 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="py-3 border-b border-gray-100">
              <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="h-9 w-32 bg-gray-200 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-10 w-full bg-gray-100 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  </div>
);
/* ================================================================== */

const defaultUser = {
  id: "demo-user-1",
  userName: "Nguyễn Văn A",
  email: "user@example.com",
  phoneNumber: "0900000000",
  gender: "other",
  dateOfBirth: "1999-01-01T00:00:00Z",
  thumbnail: "https://placehold.co/200x200?text=Avatar",
  avatar: "",
};

const ProfileTab = () => {
  const auth = useContext(AuthContext) || {};
  const userFromCtx =
    auth.user && typeof auth.user === "object" ? auth.user : null;
  const logout = auth.logout || (() => {});
  const setIsUpdate = auth.setIsUpdate || (() => {});
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // ===== NEW: Page-level loading =====
  const [pageLoading, setPageLoading] = useState(true);
  const initialTimerRef = useRef(null);

  const [safeUser, setSafeUser] = useState(defaultUser);

  useEffect(() => {
    // Khi context đổi, đồng bộ và kết thúc skeleton sau 300ms (đỡ nháy)
    setSafeUser(userFromCtx || defaultUser);
    if (initialTimerRef.current) clearTimeout(initialTimerRef.current);
    initialTimerRef.current = setTimeout(() => setPageLoading(false), 300);
    return () => {
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current);
    };
  }, [userFromCtx]);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // dùng cho overlay
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const [formData, setFormData] = useState({
    ...safeUser,
    userName: safeUser.userName || "Nguyễn Văn A",
    email: safeUser.email || "user@example.com",
    phoneNumber: safeUser.phoneNumber || "Chưa cập nhật",
    gender: safeUser.gender || "other",
    dateOfBirth: safeUser.dateOfBirth || "Chưa cập nhật",
    thumbnail:
      safeUser.thumbnail ||
      "https://th.bing.com/th/id/OIP.PwEh4SGekpMaWT2d5GWw0wHaHt?rs=1&pid=ImgDetMain",
  });

  const [avatarPreview, setAvatarPreview] = useState(safeUser.avatar || "");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData({
      ...safeUser,
      userName: safeUser.userName || "Nguyễn Văn A",
      email: safeUser.email || "user@example.com",
      phoneNumber: safeUser.phoneNumber || "Chưa cập nhật",
      gender: safeUser.gender || "other",
      dateOfBirth: safeUser.dateOfBirth || "Chưa cập nhật",
      thumbnail:
        safeUser.thumbnail ||
        "https://th.bing.com/th/id/OIP.PwEh4SGekpMaWT2d5GWw0wHaHt?rs=1&pid=ImgDetMain",
    });
    setAvatarPreview(safeUser.avatar || "");
  }, [safeUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const triggerFileInput = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, thumbnailFile: file }));
    }
  };

  const formatBirthdayForDisplay = (birthday) => {
    if (!birthday || birthday === "Chưa cập nhật") return "Chưa cập nhật";
    const date = new Date(birthday);
    if (isNaN(date)) return "Chưa cập nhật";
    const dd = `${date.getDate()}`.padStart(2, "0");
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const yy = date.getFullYear();
    return `${dd}-${mm}-${yy}`;
  };

  // Định dạng ngày sinh cho API (yyyy-mm-dd)
  const formatBirthdayForAPI = (birthday) => {
    if (!birthday || birthday === "Chưa cập nhật") return null;
    const date = new Date(birthday);
    if (isNaN(date)) return null;
    const yyyy = date.getFullYear();
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const dd = `${date.getDate()}`.padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updateData = new FormData();

      // Chỉ gửi các field mà API yêu cầu
      updateData.append("Id", safeUser.id);
      updateData.append("UserName", formData.userName);
      updateData.append("Email", formData.email);
      updateData.append(
        "PhoneNumber",
        formData.phoneNumber === "Chưa cập nhật" ? "" : formData.phoneNumber
      );

      // Xử lý ngày sinh
      const formattedDateOfBirth = formatBirthdayForAPI(formData.dateOfBirth);
      if (formattedDateOfBirth) {
        updateData.append("DateOfBirth", formattedDateOfBirth);
      } else {
        updateData.append("DateOfBirth", "");
      }

      // Xử lý ảnh đại diện
      if (formData.thumbnailFile) {
        updateData.append("Thumbnail", formData.thumbnailFile);
      } else if (formData.thumbnail && !formData.thumbnail.startsWith("http")) {
        // Nếu có thumbnail nhưng không phải là URL (có thể là base64 hoặc path)
        // Tạo Blob từ thumbnail nếu cần
        // Ở đây giả sử thumbnailFile đã được xử lý ở trên
      }

      console.log("Sending update data:");
      for (let [key, value] of updateData.entries()) {
        console.log(key, value);
      }

      const response = await userService.updateUser(updateData);

      if (response.success) {
        setIsUpdate((prev) => !prev);
        setIsEditing(false);
        showNotification("Cập nhật thông tin thành công!", "success");
      } else {
        throw new Error(
          response.error || "Có lỗi xảy ra khi cập nhật thông tin"
        );
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi kết nối với server");
      showNotification(
        err.message || "Có lỗi xảy ra khi kết nối với server",
        "error"
      );
      console.error("Update profile error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError(null);
  };

  const handlePasswordSubmit = async () => {
    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const fd = new FormData();
      fd.append("OldPassword", passwordData.oldPassword);
      fd.append("NewPassword", passwordData.newPassword);

      const response = await authService.changePassword(fd);

      if (response.success) {
        setPasswordSuccess("Đổi mật khẩu thành công!");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsChangingPassword(false);
        showNotification("Đổi mật khẩu thành công!", "success");
        logout();
        navigate("/login");
      } else {
        throw new Error(response.error || "Có lỗi xảy ra khi đổi mật khẩu");
      }
    } catch (err) {
      showNotification(
        err.message || "Có lỗi xảy ra khi kết nối với server",
        "error"
      );
      console.error("Change password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const InfoField = ({ label, value }) => (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  );

  /* =============== Render =============== */
  if (pageLoading) {
    return (
      <MainLayout>
        <ProfileSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* NEW: full-screen overlay when isLoading */}
      <LoadingOverlay show={isLoading} label="Đang xử lý..." />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Thông tin cá nhân
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                👤 Người dùng
              </span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-md font-medium transition cursor-pointer ${
                isEditing
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="h-4 w-4" /> Đang xử lý...
                </span>
              ) : isEditing ? (
                "Hủy chỉnh sửa"
              ) : (
                "Chỉnh sửa hồ sơ"
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            <p>{success}</p>
          </div>
        )}

        {/* Avatar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={
                  avatarPreview ||
                  formData.thumbnail ||
                  "https://th.bing.com/th/id/OIP.PwEh4SGekpMaWT2d5GWw0wHaHt?rs=1&pid=ImgDetMain"
                }
                alt="Avatar"
                className={`w-32 h-32 rounded-full object-cover border-4 border-blue-200 ${
                  isEditing ? "cursor-pointer" : ""
                }`}
                onClick={triggerFileInput}
                crossOrigin="anonymous"
              />
              {isEditing && (
                <div
                  className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <span className="text-white text-sm font-medium">
                    Đổi ảnh
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
              disabled={isLoading}
            />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              {formData.userName || "Nguyễn Văn A"}
            </h3>
            <p className="text-gray-600">
              {formData.email || "user@example.com"}
            </p>
          </div>
        </div>

        {/* Content */}
        {!isEditing ? (
          // --------- Display Mode ---------
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Thông tin cơ bản
              </h3>
              <dl className="space-y-1">
                <InfoField
                  label="Họ và tên"
                  value={formData.userName || "Nguyễn Văn A"}
                />
                <InfoField
                  label="Email"
                  value={formData.email || "user@example.com"}
                />
                <InfoField label="Số điện thoại" value={formData.phoneNumber} />
                <InfoField
                  label="Ngày sinh"
                  value={formatBirthdayForDisplay(formData.dateOfBirth)}
                />
                <InfoField
                  label="Giới tính"
                  value={
                    formData.gender === "male"
                      ? "Nam"
                      : formData.gender === "female"
                      ? "Nữ"
                      : "Khác"
                  }
                />
              </dl>
            </div>

            {/* Đổi mật khẩu */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Đổi mật khẩu
                </h3>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className={`px-4 py-2 rounded-md font-medium transition cursor-pointer ${
                    isChangingPassword
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  disabled={isLoading}
                >
                  {isChangingPassword ? "Hủy" : "Đổi mật khẩu"}
                </button>
              </div>

              {isChangingPassword ? (
                <div className="space-y-4">
                  {passwordError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                      <p>{passwordError}</p>
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded">
                      <p>{passwordSuccess}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu cũ*
                      </label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mật khẩu cũ"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới*
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mật khẩu mới"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu mới*
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập lại mật khẩu mới"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          oldPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordError(null);
                        setPasswordSuccess(null);
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                      disabled={isLoading}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handlePasswordSubmit}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center cursor-pointer disabled:opacity-70"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner className="h-4 w-4 mr-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        "Đổi mật khẩu"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  Bấm "Đổi mật khẩu" để thay đổi mật khẩu của bạn.
                </p>
              )}
            </div>
          </div>
        ) : (
          // --------- Edit Mode ---------
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên*
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={
                      formData.phoneNumber === "Chưa cập nhật"
                        ? ""
                        : formData.phoneNumber
                    }
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    pattern="[0-9]{10,11}"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Cột 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={
                      formData.dateOfBirth === "Chưa cập nhật"
                        ? ""
                        : formData.dateOfBirth?.split("T")[0] ||
                          formData.dateOfBirth
                    }
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || "other"}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    disabled={isLoading}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                  disabled={isLoading}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center cursor-pointer disabled:opacity-70"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProfileTab;
