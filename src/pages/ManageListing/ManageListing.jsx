// src/pages/ManageListing.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { motion } from "framer-motion";
import { FiEdit } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";

// ======= Cấu hình tab =======
const TABS = [
  { key: "active", label: "ĐANG HIỂN THỊ" },
  { key: "expired", label: "HẾT HẠN" },
  { key: "rejected", label: "BỊ TỪ CHỐI" },
  { key: "payment", label: "CẦN THANH TOÁN" },
  { key: "draft", label: "TIN NHÁP" },
  { key: "pending", label: "CHỜ DUYỆT" },
  { key: "hidden", label: "ĐÃ ẨN" },
];

// ======= Dữ liệu mẫu: 10 tin active =======
const SAMPLE = [
  {
    id: 201,
    title: "VinFast VF 8 Eco 2024 aaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    price: 980000000000,
    postedOn: "21/09/2025",
    status: "active",
    images: [
      "https://tse4.mm.bing.net/th/id/OIP.7PNuD1w87IyBBEvmkJqYAQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    ],
  },
  {
    id: 202,
    title: "Tesla Model 3 Long Range 2023",
    price: 1350000000,
    postedOn: "20/09/2025",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: 203,
    title: "KIA EV6 GT-Line",
    price: 890000000,
    postedOn: "19/09/2025",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: 204,
    title: "BMW i4 eDrive40",
    price: 2200000000,
    postedOn: "18/09/2025",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: 205,
    title: "Audi Q4 e-tron",
    price: 1900000000,
    postedOn: "18/09/2025",
    status: "active",
    images: [
      "https://tse4.mm.bing.net/th/id/OIP.7PNuD1w87IyBBEvmkJqYAQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    ],
  },
];

const currency = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const ManageListing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [listings, setListings] = useState(SAMPLE);

  const filtered = useMemo(
    () => listings.filter((it) => it.status === activeTab),
    [listings, activeTab]
  );

  const onDelete = (id) => {
    setListings((prev) => prev.filter((x) => x.id !== id));
  };

  const onEdit = (id) => {
    navigate(`/add-listing?mode=edit&id=${id}`);
  };

  const onNavigate = (id) => {
    navigate(`/listing-details/${id}`);
  };

  return (
    <MainLayout>
      <motion.div
        className="px-5 md:px-24 my-10 mb-20"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header + nút đăng tin */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
          <h2 className="font-bold text-2xl sm:text-4xl text-gray-800">
            Quản lý tin đăng
          </h2>
          <Link to="/add-listing" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition cursor-pointer">
              + Đăng tin
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="w-full overflow-x-auto">
          <div className="flex items-center gap-8 min-w-max border-b border-gray-200 pb-2">
            {TABS.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="relative pb-2 font-bold whitespace-nowrap focus:outline-none cursor-pointer"
                >
                  <span className={isActive ? "text-orange-500" : "text-black"}>
                    {t.label}{" "}
                    <span className="font-normal text-gray-500">
                      ({listings.filter((x) => x.status === t.key).length})
                    </span>
                  </span>
                  {isActive && (
                    <span className="absolute left-0 -bottom-[3px] h-1 w-full bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Danh sách theo tab */}
        {filtered.length === 0 ? (
          <div className="mt-10 rounded-xl border border-gray-200 p-8 bg-white text-center">
            <p className="text-gray-600">
              Bạn chưa có tin ở mục{" "}
              <b>{TABS.find((t) => t.key === activeTab)?.label}</b>.
            </p>
            <div className="mt-4">
              <Link to="/add-listing">
                <button className="px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition cursor-pointer">
                  + Đăng tin ngay
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-7">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Click ảnh => detail */}
                <div
                  className="w-full aspect-video bg-gray-50 flex items-center justify-center cursor-pointer"
                  onClick={() => onNavigate(item.id)}
                >
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400">No Image</div>
                  )}
                </div>

                <div className="p-4">
                  {/* Click title => detail */}
                  <h3
                    onClick={() => onNavigate(item.id)}
                    className="font-semibold text-gray-800 line-clamp-2 min-h-[48px] cursor-pointer hover:text-green-600"
                  >
                    {item.title}
                  </h3>

                  <div className="mt-2 text-green-700 font-bold">
                    {currency(item.price)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Đăng ngày {item.postedOn}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onEdit(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 p-3 bg-gray-700 hover:bg-gray-800 text-white rounded-md transition cursor-pointer"
                      title="Sửa tin"
                    >
                      <span>Sửa</span>
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 p-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition cursor-pointer"
                      title="Xoá tin"
                    >
                      <span>Xoá</span>
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default ManageListing;
