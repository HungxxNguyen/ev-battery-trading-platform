// src/pages/ManageDetail.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiEdit,
  FiMapPin,
  FiHeart,
  FiShield,
  FiBatteryCharging,
  FiZap,
} from "react-icons/fi";

/* ---------------- Minimal data (đủ dùng cho UI mới) ---------------- */
const DETAIL_DATA = {
  201: {
    id: 201,
    title: "VinFast VF 8 Eco 2024",
    status: "active",
    price: 1550000000,
    postedOn: "21/09/2025",
    location: "Quận 7, TP.HCM",
    productType: "SUV điện 5 chỗ",
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1617813489478-0e96bde477c0?auto=format&fit=crop&w=1600&q=80",
    ],
    battery: {
      pack: "Lithium-ion 82 kWh",
      soh: "92%",
      chargeCycles: "65 lần",
      fastCharge: "CCS2 tối đa 150 kW",
      range: "460 km thực tế",
      warranty: "48 tháng hoặc 120.000 km",
      included: ["Bộ sạc tường 11 kW", "Cáp sạc di động"],
    },
    highlights: [
      "Đã bảo dưỡng định kỳ tại VinFast.",
      "Tặng kèm gói bảo dưỡng pin 12 tháng.",
      "Hỗ trợ đổi trả pin trong 7 ngày nếu sai cam kết.",
    ],
    seller: { name: "Nguyễn Hùng", type: "Cá nhân", years: "2 năm", ads: 1 },
  },
  202: {
    id: 202,
    title: "Tesla Model 3 Long Range AWD 2023",
    status: "active",
    price: 1350000000,
    postedOn: "20/09/2025",
    location: "TP.Thủ Đức, TP.HCM",
    productType: "Sedan điện 5 chỗ",
    images: [
      "https://images.unsplash.com/photo-1519581356744-44c5b5f3c47b?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1593941707874-ef25b8b3ba0b?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1549921296-3b4a6b7f4b37?auto=format&fit=crop&w=1600&q=80",
    ],
    battery: {
      pack: "Lithium-ion 82 kWh Panasonic",
      soh: "96%",
      chargeCycles: "41 lần",
      fastCharge: "Supercharger V3 250 kW",
      range: "510 km WLTP",
      warranty: "8 năm hoặc 160.000 km",
      included: ["Wall Connector gen 3", "Cáp Type 2"],
    },
    highlights: [
      "Autopilot nâng cao đã kích hoạt.",
      "Bảo hiểm vật chất đến 02/2026.",
    ],
    seller: { name: "Lê Hoàng Nam", type: "Cá nhân", years: "1 năm", ads: 3 },
  },
  203: {
    id: 203,
    title: "KIA EV6 GT-Line 77.4 kWh 2023",
    status: "pending",
    price: 890000000,
    postedOn: "19/09/2025",
    location: "Cầu Giấy, Hà Nội",
    productType: "Crossover điện",
    images: [
      "https://images.unsplash.com/photo-1620891549027-942fdc95d42f?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1620893044757-4d62564fcf63?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1620892923925-74fa6425aae9?auto=format&fit=crop&w=1600&q=80",
    ],
    battery: {
      pack: "77.4 kWh SK Innovation",
      soh: "89%",
      chargeCycles: "52 lần",
      fastCharge: "800V Ultra-fast 235 kW",
      range: "480 km WLTP",
      warranty: "7 năm hoặc 150.000 km",
      included: ["Bộ sạc KIA 11 kW"],
    },
    highlights: ["Đã nâng cấp bản đồ trạm sạc toàn quốc."],
    seller: { name: "Trần Thu Hà", type: "Cá nhân", years: "Mới", ads: 1 },
  },
};

const FALLBACK_IMAGE = "https://placehold.co/1200x800?text=EV+Listing";
const currency = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

/* ---------------- UI ---------------- */
const ManageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const listingFromState = location.state?.listing;

  // Lấy dữ liệu: ưu tiên store cứng; nếu không có thì fallback state từ trang trước
  const detail = useMemo(() => {
    const base = DETAIL_DATA[id];
    const merged = base || listingFromState;
    if (!merged) return undefined;
    return {
      ...merged,
      images:
        merged.images && merged.images.length > 0
          ? merged.images
          : [FALLBACK_IMAGE],
    };
  }, [id, listingFromState]);

  const [activeImage, setActiveImage] = useState(0);

  if (!detail) {
    return (
      <MainLayout>
        <div className="px-5 md:px-24 my-10">
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Không tìm thấy tin đăng
            </h2>
            <Link
              to="/manage-listing"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition"
            >
              Quay về trang quản lý
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const specs = [
    {
      label: "Dung lượng pin",
      value: detail.battery?.pack,
      icon: <FiBatteryCharging />,
    },
    { label: "SOH", value: detail.battery?.soh, icon: <FiShield /> },
    {
      label: "Chu kỳ sạc",
      value: detail.battery?.chargeCycles,
      icon: <FiZap />,
    },
    { label: "Tầm hoạt động", value: detail.battery?.range, icon: <FiZap /> },
  ];

  return (
    <MainLayout>
      <motion.div
        className="px-5 md:px-24 my-6 md:my-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <FiArrowLeft />
            <span>Quay lại</span>
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* LEFT column */}
          <div className="space-y-4">
            {/* Gallery */}
            <div className="bg-white border border-gray-200 rounded-xl p-0">
              <div className="aspect-video rounded-t-xl overflow-hidden">
                <img
                  src={detail.images[activeImage]}
                  alt={`image-${activeImage}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 pb-4 pt-3 flex gap-3 overflow-x-auto">
                {detail.images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border ${
                      activeImage === idx
                        ? "border-orange-500 ring-2 ring-orange-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    title={`Ảnh ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title + price */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    {detail.title}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Nội thất đầy đủ • {detail.productType}
                  </p>
                </div>
                <button
                  className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                  title="Lưu"
                >
                  <FiHeart />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <p className="text-rose-600 font-bold text-2xl">
                  {currency(detail.price)}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <FiMapPin className="text-gray-400" />
                  {detail.location}
                </span>
                <span className="text-gray-400">•</span>
                <span>Cập nhật {detail.postedOn}</span>
              </div>
            </div>

            {/* Quick specs (4 ô nhỏ giống các hàng thông tin) */}
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="divide-y">
                {specs.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between px-4 md:px-6 py-4"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-gray-400">{s.icon}</span>
                      <span className="font-medium">{s.label}</span>
                    </div>
                    <span className="text-gray-800">{s.value || "-"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Mô tả chi tiết
              </h2>
              {Array.isArray(detail.highlights) &&
              detail.highlights.length > 0 ? (
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  {detail.highlights.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-gray-500">Chưa có mô tả.</p>
              )}

              {Array.isArray(detail.battery?.included) &&
                detail.battery.included.length > 0 && (
                  <>
                    <h3 className="mt-5 text-sm font-semibold text-gray-800">
                      Đi kèm:
                    </h3>
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                      {detail.battery.included.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </>
                )}
            </div>
          </div>

          {/* RIGHT column — Seller card + actions + comments */}
          <div className="space-y-4">
            {/* Seller card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  NH
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">
                      {detail.seller?.name || "Người bán"}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {detail.seller?.type || "Cá nhân"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {detail.seller?.ads || 0} tin đăng •{" "}
                    {detail.seller?.years || "Mới"} trên nền tảng
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold"
                  onClick={() => alert("Đã bán / Ẩn tin")}
                >
                  Đã bán / Ẩn tin
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-orange-500 hover:bg-orange-400 text-white font-semibold"
                  onClick={() =>
                    navigate(`/add-listing?mode=edit&id=${detail.id}`)
                  }
                >
                  Sửa tin
                </button>
              </div>
            </div>

            {/* Comments box (placeholder) */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800">Bình luận</h3>
              <div className="mt-4 text-center text-sm text-gray-500">
                Chưa có bình luận nào. Hãy để lại bình luận cho người bán.
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  NH
                </div>
                <input
                  className="flex-1 h-10 px-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="Bình luận…"
                />
                <button className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ManageDetail;
