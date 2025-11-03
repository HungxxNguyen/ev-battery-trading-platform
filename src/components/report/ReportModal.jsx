import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { REPORT_REASONS, createReport } from "../../services/apis/reportApi";

export default function ReportModal({ open, onClose, listingId, userId, ownerId }) {
  const [reason, setReason] = useState("Scam");
  const [otherReason, setOtherReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

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
      const res = await createReport({ userId, listingId, reason, otherReason });
      if (res?.error === 0) {
        setSent(true);
      } else {
        setError(res?.message || "Gửi báo cáo thất bại.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Đã xảy ra lỗi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 cursor-pointer" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
        {!sent ? (
          <form onSubmit={onSubmit}>
            <div className="mb-2 flex items-center justify-between">
              <h3 id="report-title" className="text-lg font-semibold text-gray-900">
                Báo cáo bài đăng
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                x
              </button>
            </div>

            {!userId && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Bạn cần <Link to="/login" className="font-semibold underline cursor-pointer">đăng nhập</Link> để gửi báo cáo.
              </div>
            )}

            <p className="mb-3 text-sm text-gray-600">Chọn lý do báo cáo để giúp chúng tôi xử lý.</p>

            <div className="mb-3 grid gap-2">
              {REPORT_REASONS.map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="h-4 w-4"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {isOther && (
              <div className="mb-3">
                <label htmlFor="otherReason" className="mb-1 block text-sm text-gray-700">
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
              <h3 className="text-lg font-semibold text-gray-900">Đã gửi báo cáo</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                x
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600">Cảm ơn bạn đã đóng góp. Chúng tôi sẽ sớm kiểm tra bài đăng.</p>
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

