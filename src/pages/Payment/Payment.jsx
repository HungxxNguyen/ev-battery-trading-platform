// src/pages/Payment/Payment.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FiArrowLeft, FiInfo } from "react-icons/fi";

const currency = (value) =>
  (Number(value) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const FALLBACK_IMAGE = "https://placehold.co/200x150?text=EV+Listing";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentState = location.state || {};
  const listing = paymentState.listing || null;
  const plan = paymentState.plan || null;
  const renewal = paymentState.renewal || {};
  const origin = paymentState.origin || "renewal";
  const isNewListing = origin === "new-listing";

  const subtotal = Number(plan?.price) || 0;
  const planDays = Number(plan?.days) || 0;
  const vatRate = 0.08;
  const vat = Math.round(subtotal * vatRate);
  const total = subtotal + vat;

  const displayImage = listing?.images?.[0] || FALLBACK_IMAGE;
  const baseDate = isNewListing
    ? "-"
    : renewal.baseDateStr || listing?.expiresOn || "-";
  const nextDate = renewal.nextDateStr || "-";
  const headingText = isNewListing
    ? "Thanh toán đăng tin"
    : "Thanh toán gia hạn tin đăng";
  const subHeading = isNewListing
    ? "Hoàn tất thanh toán để tin của bạn được hiển thị trên nền tảng."
    : "Kiểm tra thông tin và thanh toán qua VNPAY.";
  const serviceLine = isNewListing
    ? `Gói đăng tin ${planDays} ngày — tin sẽ hiển thị trong ${planDays} ngày sau khi thanh toán.`
    : `Gói gia hạn ${planDays} ngày — dự kiến hiển thị đến ${nextDate}.`;

  const handleBackToManage = () => {
    // quay về trang quản lý tin (giữ nguyên query nếu có)
    navigate("/manage-listing" + (location.search || ""));
  };

  const handlePayWithVnpay = () => {
    // TODO: tích hợp VNPAY thật: tạo order, ký params và redirect đến VNPAY sandbox/prod
    // Ví dụ khi có URL:
    // window.location.href = vnpayPaymentUrl;
    console.log("[VNPAY] Create order -> redirect to VNPAY sandbox", {
      listingId: listing?.id,
      planDays: plan?.days,
      amount: total,
    });
    alert("Demo: sẽ chuyển sang cổng VNPAY (sandbox) ở bước tích hợp thật.");
    // Sau thanh toán thành công bạn điều hướng về /manage-listing hoặc trang kết quả:
    handleBackToManage();
  };

  if (!listing || !plan) {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-20">
          <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center space-y-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {isNewListing
                ? "Không tìm thấy dữ liệu đăng tin"
                : "Không tìm thấy dữ liệu gia hạn"}
            </h1>
            <p className="text-gray-600">
              {isNewListing
                ? "Vui lòng quay lại trang Đăng tin và thực hiện lại biểu mẫu."
                : "Vui lòng quay lại trang Quản lý tin đăng và chọn lại gói gia hạn."}
            </p>
            <div>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-md cursor-pointer"
                onClick={handleBackToManage}
              >
                Về Quản lý tin đăng
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-0 py-10 space-y-6">
          <button
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft />
            Quay lại
          </button>

          {/* Thông báo VAT (giữ ngắn gọn) */}
          <div className="bg-blue-50 border border-blue-100 text-blue-900 rounded-xl p-4 flex items-start gap-3 text-sm">
            <div className="mt-0.5 text-blue-500">
              <FiInfo className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">
                Lưu ý: Giá dịch vụ chưa bao gồm thuế GTGT (8%).
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Thuế sẽ được cộng vào tổng thanh toán.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h1 className="text-2xl font-semibold text-gray-800">
                {headingText}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{subHeading}</p>
            </div>

            <div className="px-6 py-6 space-y-8">
              {/* Tóm tắt dịch vụ */}
              <section>
                <h2 className="text-lg font-semibold text-gray-800">Dịch vụ</h2>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-40 h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img
                      src={displayImage}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-gray-800">
                          {listing.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {serviceLine}
                        </p>
                        {!isNewListing && (
                          <p className="text-xs text-gray-400">
                            Tin hiện hết hạn vào {baseDate}
                          </p>
                        )}
                      </div>
                      <span className="text-lg font-semibold text-red-600">
                        {currency(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tổng tiền */}
              <section className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{currency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Thuế GTGT (8%)</span>
                  <span>{currency(vat)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-lg font-semibold text-gray-800">
                  <span>Tổng thanh toán</span>
                  <span className="text-red-600">{currency(total)}</span>
                </div>
              </section>

              {/* Nút VNPAY */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Mặc định thanh toán qua <b>VNPAY</b>. Bạn sẽ được chuyển sang
                  cổng thanh toán để hoàn tất.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="px-5 py-3 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(-1)}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold cursor-pointer"
                    onClick={handlePayWithVnpay}
                  >
                    Thanh toán qua VNPAY
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gợi ý quay lại quản lý tin */}
          <div className="flex items-center justify-between">
            <span />
            <button
              className="text-sm text-gray-600 hover:text-gray-800 underline-offset-2 hover:underline"
              onClick={handleBackToManage}
            >
              Về Quản lý tin đăng
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Payment;
