import React from "react";
import { Link } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

const PaymentFailed = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#5e3a1e] px-4">
      <FaTimesCircle className="text-red-500 text-7xl mb-6" />
      <h1 className="text-4xl font-bold mb-4">Thanh toán thất bại!</h1>
      <p className="text-center max-w-md text-lg mb-6">
        Rất tiếc, đã có sự cố xảy ra trong quá trình thanh toán. Vui lòng thử
        lại hoặc liên hệ với <span className="font-semibold">EBTP</span> để được
        hỗ trợ.
      </p>

      <div className="flex gap-4">
        <Link
          to="/"
          className="bg-[#5e3a1e] text-white px-6 py-3 rounded hover:bg-[#4a2f15] transition"
        >
          Quay về trang chủ
        </Link>
        <Link
          to="/manage-listing?tab=payment"
          className="border border-[#5e3a1e] text-[#5e3a1e] px-6 py-3 rounded hover:bg-[#f5f5f5] transition"
        >
          Xem tin đăng chờ thanh toán
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed;
