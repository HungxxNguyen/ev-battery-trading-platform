// src/pages/Forbidden/Forbidden.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaLock, FaHome, FaUser } from "react-icons/fa";

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <FaLock className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          403 - Truy cập bị từ chối
        </h1>
        <p className="text-gray-600 mb-6">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản
          trị viên nếu bạn nghĩ đây là lỗi.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaHome className="mr-2" />
            Về trang chủ
          </Link>
          <Link
            to="/profile-user/profile"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <FaUser className="mr-2" />
            Trang cá nhân
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
