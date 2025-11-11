import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createReport } from "../../services/apis/reportApi";
import { X, Upload, Image as ImageIcon } from "lucide-react";

export default function ReportModal({
  open,
  onClose,
  listingId,
  userId,
  ownerId,
}) {
  const [reason, setReason] = useState("Scam");
  const [otherReason, setOtherReason] = useState("");
  const [reportImages, setReportImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
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

  // Clear ảnh khi close modal
  useEffect(() => {
    if (!open) {
      setReportImages([]);
      setImagePreviews([]);
      setError("");
      setSent(false);
      setIsDragOver(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  if (!open) return null;

  const handleImageSelect = (files) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const validFiles = [];

    // Kiểm tra số lượng ảnh - giới hạn 5 ảnh
    const totalFiles = reportImages.length + newFiles.length;
    if (totalFiles > 5) {
      setError(
        `Chỉ được upload tối đa 5 ảnh. Hiện tại đã có ${reportImages.length} ảnh.`
      );
      return;
    }

    for (const file of newFiles) {
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chỉ chọn file ảnh.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`Ảnh "${file.name}" không được lớn hơn 5MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setReportImages((prev) => [...prev, ...validFiles]);
    setError("");

    // Tạo preview cho các ảnh mới
    const newPreviews = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          id: Date.now() + Math.random(),
          url: reader.result,
          file: file,
        });

        if (newPreviews.length === validFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setReportImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAllImages = () => {
    setReportImages([]);
    setImagePreviews([]);
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    // Clear tất cả state khi đóng modal
    setReportImages([]);
    setImagePreviews([]);
    setError("");
    setSent(false);
    setIsDragOver(false);
    setReason("Scam");
    setOtherReason("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
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

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("listingId", listingId);
      formData.append("reason", reason);
      if (otherReason.trim()) {
        formData.append("otherReason", otherReason.trim());
      }

      reportImages.forEach((file) => {
        formData.append("ReportImages", file);
      });

      const res = await createReport(formData);

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
        onClick={handleClose}
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
                onClick={handleClose}
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

            {/* === PHẦN UPLOAD NHIỀU ẢNH - ĐÃ ĐƯỢC SỬA === */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm text-gray-700">
                  Ảnh minh chứng (tùy chọn)
                </label>
                {reportImages.length > 0 && (
                  <button
                    type="button"
                    onClick={removeAllImages}
                    className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <div className="relative">
                <div
                  className={`relative w-full min-h-[8rem] border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
                    ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 bg-gray-50"
                    }`}
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
                    const files = e.dataTransfer.files;
                    if (files.length > 0) handleImageSelect(files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {/* Hiển thị ảnh bên TRONG vùng chọn */}
                  {imagePreviews.length > 0 ? (
                    <div className="p-3">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={preview.id} className="relative group">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition opacity-0 group-hover:opacity-100 shadow-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Hiển thị nút thêm ảnh khi chưa đạt tối đa */}
                      {reportImages.length < 5 && (
                        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                          <Upload className="w-6 h-6 mb-1 text-gray-400" />
                          <p className="text-xs text-gray-600 text-center">
                            Thêm ảnh ({reportImages.length}/5)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Nội dung khi chưa có ảnh nào */
                    <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                      <Upload
                        className={`w-8 h-8 mb-2 ${
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
                        PNG, JPG, JPEG (tối đa 5MB/ảnh, tối đa 5 ảnh)
                      </p>
                    </div>
                  )}

                  {/* Thông báo khi đã đạt tối đa ảnh */}
                  {reportImages.length >= 5 && (
                    <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        Đã đạt tối đa 5 ảnh
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Xóa bớt ảnh để thêm ảnh mới
                      </p>
                    </div>
                  )}
                </div>

                {/* Input ẩn - cho phép chọn nhiều file */}
                <input
                  id="reportImages"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files.length > 0) handleImageSelect(files);
                  }}
                  className="hidden"
                />
              </div>

              {/* Hiển thị số lượng ảnh đã chọn */}
              {reportImages.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Đã chọn {reportImages.length}/5 ảnh
                </p>
              )}
            </div>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
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
                onClick={handleClose}
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
                onClick={handleClose}
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