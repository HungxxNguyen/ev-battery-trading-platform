// src/pages/ManageListing/components/PaymentButton.jsx
import React, { useState } from "react";
import { FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import listingService from "../../../services/apis/listingApi";

const PaymentButton = ({
  listingId,
  disabled = false,
  children = "Thanh toán",
  className = "",
  variant = "outline", // primary, outline, etc.
  onSuccess,
  onError,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const btnBase =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer";

  const variants = {
    primary: "bg-green-600 hover:bg-green-500 text-white font-semibold",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    disabled: "bg-gray-200 text-gray-500 cursor-not-allowed opacity-70",
    loading: "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70",
  };

  const handlePaymentClick = async () => {
    if (!listingId || disabled || loading) return;

    try {
      setLoading(true);

      // Gọi API để lấy VNPay URL
      const response = await listingService.getVnPayUrl(listingId);

      if (response.data && response.data.error === 0) {
        const paymentUrl = response.data.data;
        console.log("", paymentUrl);

        if (paymentUrl) {
          // Chuyển hướng đến trang thanh toán VNPay
          window.location.href = paymentUrl;
        } else {
          throw new Error("Không nhận được URL thanh toán");
        }
      } else {
        throw new Error(response.message || "Có lỗi xảy ra khi tạo thanh toán");
      }
    } catch (error) {
      console.error("Payment error:", error);

      // Gọi callback error nếu có
      if (onError) onError(error);

      // Hiển thị thông báo lỗi
      alert(
        error.message || "Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const getButtonClass = () => {
    if (disabled) return variants.disabled;
    if (loading) return variants.loading;
    return variants[variant] || variants.outline;
  };

  const getButtonText = () => {
    if (loading) return "Đang xử lý...";
    return children;
  };

  return (
    <button
      disabled={disabled || loading}
      onClick={handlePaymentClick}
      className={`${btnBase} ${getButtonClass()} ${className}`}
      {...props}
    >
      <FiZap /> {getButtonText()}
    </button>
  );
};

export default PaymentButton;
