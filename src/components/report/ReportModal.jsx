import React, { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createReport } from "../../services/apis/reportApi";
import { X, Upload, Image as ImageIcon } from "lucide-react"; // Optional: dùng icon

export default function ReportModal({
  open,
  onClose,
  listingId,
  userId,
  ownerId,
}) {
  const [reason, setReason] = useState("Scam");
  const [otherReason, setOtherReason] = useState("");
  const [imageReport, setImageReport] = useState(null); // Lưu file ảnh
  const [imagePreview, setImagePreview] = useState(""); // Xem trước ảnh
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const REPORT_REASONS = [
    { value: "Scam", label: "Lừa đảo" },
    { value: "Duplicate", label: "Tin đăng trùng lặp" },
    { value: "Sold", label: "Đã bán" },
    { value: "UnableToContact", label: "Không liên lạc được" },
    { value: "IncorrectInformation", label: "Thông tin sai lệch" },
    { value: "Other", label: "Lý do khác" },
  ];

  const fileInputRef = useRef(null);

  const isOther = useMemo(() => reason === "Other", [reason]);
  const isSelfReport = useMemo(() => {
    if (!userId || !ownerId) return false;
    try {
      return String(userId) === String(ownerId);
    } catch {
      return false;
    }
  }, [userId, ownerId]);

  if (!open) return null;

  // Xử lý chọn ảnh (từ click hoặc drag & drop)
  const handleImageSelect = (file) => {
    if (!file) return;

    // Kiểm tra định dạng
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh.");
      return;
    }
    // Kiểm tra kích thước
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được lớn hơn 5MB.");
      return;
    }

    setImageReport(file);
    setError("");

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Xóa ảnh
  const removeImage = () => {
    setImageReport(null);
    setImagePreview("");
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSelfReport) {
      setError("Không thể báo cáo tin của chính mình.");
      return;
    }
    if (!userId) {
      setError("Vui lòng đăng nhập để báo cáo.");
      return;
    }
    if (!listingId) {
      setError("Thiếu thông tin bài đăng.");
      return;
    }
    if (reason === "Other" && !otherReason.trim()) {
      setError("Vui lòng nhập lý do khác.");
      return;
    }

    try {
      setSubmitting(true);

      // Tạo FormData để gửi cả text + file
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("listingId", listingId);
      formData.append("reason", reason);
      if (otherReason.trim()) {
        formData.append("otherReason", otherReason.trim());
      }
      if (imageReport) {
        formData.append("imageReport", imageReport); // tên field: imageReport
      }

      const res = await createReport(formData); // API cần nhận FormData

      if (res?.error === 0) {
        setSent(true);
      } else {
        setError(res?.message || "Gửi báo cáo thất bại.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Đã xảy ra lỗi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 cursor-pointer"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-2xl overflow-y-auto max-h-screen">
        {!sent ? (
          <form onSubmit={onSubmit}>
            <div className="mb-2 flex items-center justify-between">
              <h3
                id="report-title"
                className="text-lg font-semibold text-gray-900"
              >
                Báo cáo bài đăng
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!userId && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Bạn cần{" "}
                <Link
                  to="/login"
                  className="font-semibold underline cursor-pointer"
                >
                  đăng nhập
                </Link>{" "}
                để gửi báo cáo.
              </div>
            )}

            <p className="mb-3 text-sm text-gray-600">
              Chọn lý do báo cáo để giúp chúng tôi xử lý.
            </p>

            <div className="mb-3 grid gap-2">
              {REPORT_REASONS.map((item) => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={() => setReason(item.value)}
                    className="h-4 w-4"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            {isOther && (
              <div className="mb-3">
                <label
                  htmlFor="otherReason"
                  className="mb-1 block text-sm text-gray-700"
                >
                  Lý do khác
                </label>
                <textarea
                  id="otherReason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  rows={3}
                  placeholder="Nhập chi tiết..."
                  className="w-full resize-y rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
            )}

            {/* === PHẦN UPLOAD ẢNH - ĐÃ CẢI TIẾN === */}
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-700">
                Ảnh minh chứng (tùy chọn)
              </label>

              <div className="relative">
                <div
                  className={`relative w-full h-48 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
        ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }
        ${imagePreview ? "p-0" : "p-4"}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleImageSelect(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {/* Hiển thị ảnh preview (nếu có) */}
                  {imagePreview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn click mở file picker
                          removeImage();
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                        {imageReport?.name}
                      </div>
                    </div>
                  ) : (
                    /* Nội dung khi chưa có ảnh */
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <Upload
                        className={`w-10 h-10 mb-2 ${
                          isDragOver ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      <p className="text-sm font-medium text-gray-700">
                        {isDragOver ? "Thả ảnh vào đây" : "Kéo thả ảnh vào đây"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        hoặc nhấp để chọn file
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, JPEG (tối đa 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Input ẩn */}
                <input
                  id="imageReport"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleImageSelect(file);
                  }}
                  className="hidden"
                />
              </div>

              {/* Hiển thị tên file (tùy chọn, nếu muốn giữ) */}
              {imageReport && !imagePreview && (
                <p className="mt-2 text-xs text-gray-500 truncate">
                  {imageReport.name}
                </p>
              )}
            </div>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || !userId || isSelfReport}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Đã gửi báo cáo
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Cảm ơn bạn đã đóng góp. Chúng tôi sẽ sớm kiểm tra bài đăng.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
