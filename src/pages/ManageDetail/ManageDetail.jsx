// src/pages/ManageDetail.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMapPin, FiHeart } from "react-icons/fi";

/* ---------------- CẤU HÌNH FIELDS (khớp AddListing) ---------------- */
const CATEGORIES = {
  CAR: "Ô tô điện",
  TWO_WHEEL: "Xe 2 bánh điện",
  OTHER_EV: "Phương tiện điện khác",
  BATTERY: "Pin rời",
};

const COMMON_FIELDS = [
  { label: "Tiêu đề tin", name: "listingTitle" },
  { label: "Slogan / Mô tả ngắn", name: "tagline" },
  { label: "Giá (VND)", name: "price" },
  { label: "Tình trạng", name: "condition" },
  { label: "Hãng", name: "make" },
  { label: "Model", name: "model" },
  { label: "Năm sản xuất", name: "year" },
  { label: "Khu vực", name: "location" },
  { label: "Mô tả chi tiết", name: "listingDescription", long: true },
];

const SCHEMA_BY_CATEGORY = {
  [CATEGORIES.CAR]: [
    { label: "Loại EV", name: "evType" },
    { label: "Dẫn động", name: "driveType" },
    { label: "Số km đã đi (Odo)", name: "odometer" },
    { label: "Dung lượng pin (kWh)", name: "batteryCapacityKWh" },
    { label: "Sức khỏe pin SOH (%)", name: "batterySOH" },
    { label: "Chu kỳ sạc (cycles)", name: "chargeCycles" },
    { label: "Tầm hoạt động thực tế (km)", name: "rangeKm" },
    { label: "Công suất sạc AC (kW)", name: "acPowerKw" },
    { label: "Sạc nhanh DC (kW)", name: "dcPowerKw" },
    { label: "Chuẩn cổng sạc", name: "chargeStandard" },
    { label: "Thời gian sạc (giờ)", name: "chargingTimeH" },
    { label: "Hình thức pin", name: "batteryOwnership" },
    { label: "Bảo hành còn lại (tháng)", name: "warrantyMonths" },
    { label: "Màu xe", name: "color" },
    { label: "Số cửa", name: "doors" },
    { label: "Số VIN", name: "vin" },
  ],
  [CATEGORIES.TWO_WHEEL]: [
    { label: "Loại pack pin", name: "batteryPackType" },
    { label: "Số pack pin", name: "packCount" },
    { label: "Dung lượng pin (kWh / Ah)", name: "batteryCapacity" },
    { label: "Sức khỏe pin SOH (%)", name: "batterySOH" },
    { label: "Chu kỳ sạc (cycles)", name: "chargeCycles" },
    { label: "Công suất motor (kW)", name: "motorPowerKw" },
    { label: "Tốc độ tối đa (km/h)", name: "topSpeed" },
    { label: "Tầm hoạt động (km)", name: "rangeKm" },
    { label: "Thời gian sạc (giờ)", name: "chargingTimeH" },
    { label: "Kèm sạc", name: "chargerIncluded" },
    { label: "Kích cỡ bánh (inch)", name: "wheelSize" },
    { label: "Loại phanh", name: "brakeType" },
    { label: "Khối lượng (kg)", name: "weightKg" },
    { label: "Giấy tờ", name: "docs" },
  ],
  [CATEGORIES.OTHER_EV]: [
    { label: "Loại phương tiện", name: "vehicleType" },
    { label: "Điện áp hệ (V)", name: "systemVoltage" },
    { label: "Dung lượng pin (kWh / Ah)", name: "batteryCapacity" },
    { label: "Sức khỏe pin SOH (%)", name: "batterySOH" },
    { label: "Chu kỳ sạc (cycles)", name: "chargeCycles" },
    { label: "Công suất motor (W/kW)", name: "motorPower" },
    { label: "Tầm hoạt động (km)", name: "rangeKm" },
    { label: "Tốc độ tối đa (km/h)", name: "topSpeed" },
    { label: "Thời gian sạc (giờ)", name: "chargingTimeH" },
    { label: "Phụ kiện kèm theo", name: "accessories" },
  ],
  [CATEGORIES.BATTERY]: [
    { label: "Dung lượng danh định (kWh / Ah)", name: "nominalCapacity" },
    { label: "Điện áp danh định (V)", name: "nominalVoltage" },
    { label: "Hoá học cell", name: "chemistry" },
    { label: "Sức khỏe pin SOH (%)", name: "batterySOH" },
    { label: "Chu kỳ sạc (cycles)", name: "chargeCycles" },
    { label: "BMS đi kèm", name: "bmsIncluded" },
    { label: "Chuẩn jack/connector", name: "connector" },
    { label: "Kích thước (DxRxC, mm)", name: "dimensions" },
    { label: "Khối lượng (kg)", name: "weightKg" },
    { label: "Ngày sản xuất (YYYY-MM)", name: "mfgDate" },
    { label: "Bảo hành còn lại (tháng)", name: "warrantyMonths" },
  ],
};

/* ---------------- Minimal data demo ---------------- */
const DETAIL_DATA = {
  201: {
    id: 201,
    title: "VinFast VF 8 Eco 2024",
    status: "active",
    price: 1550000000,
    postedOn: "21/09/2025",
    location: "Quận 7, TP.HCM",
    category: "Ô tô điện", // khớp AddListing
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80",
    ],
    listingTitle: "Bán VinFast VF 8 Eco 2024 chính chủ",
    tagline: "Xe đẹp, pin khoẻ, hỗ trợ sang tên",
    condition: "Đã sử dụng",
    make: "VinFast",
    model: "VF 8",
    year: 2024,
    listingDescription:
      "Xe bảo dưỡng đầy đủ tại hãng. Pin SOH cao, có sạc tường 11kW đi kèm.",
    // Một số field danh mục (nếu có)
    evType: "BEV (thuần điện)",
    driveType: "AWD",
    batteryCapacityKWh: 82,
    batterySOH: 92,
    rangeKm: 460,
    acPowerKw: 11,
    dcPowerKw: 150,
    chargeStandard: "CCS2",
  },
};

const FALLBACK_IMAGE = "https://placehold.co/1200x800?text=EV+Listing";
const currency = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const FieldGrid = ({ title, fields, data }) => {
  if (!fields?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div
            key={f.name}
            className={`${f.long ? "md:col-span-2" : ""} flex flex-col gap-1`}
          >
            <span className="text-sm text-gray-500">{f.label}</span>
            <span className="text-gray-800">
              {f.name === "price"
                ? currency(data?.[f.name] ?? 0)
                : data?.[f.name] ?? "–"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- UI ---------------- */
const ManageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const listingFromState = location.state?.listing;

  // Lấy dữ liệu: ưu tiên store cứng; nếu không có thì fallback state
  const detail = useMemo(() => {
    const base = DETAIL_DATA[id] || listingFromState;
    if (!base) return undefined;
    return {
      ...base,
      images:
        base.images && base.images.length > 0 ? base.images : [FALLBACK_IMAGE],
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
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition cursor-pointer"
            >
              Quay về trang quản lý
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const category = detail.category || "Khác";
  const catSchema = SCHEMA_BY_CATEGORY[category] || [];

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
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            title="Quay lại"
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
                    className={`relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border cursor-pointer ${
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

            {/* Title + price + location */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    {detail.title || detail.listingTitle || "Tin đăng"}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Mục <b>{category}</b>
                  </p>
                </div>
                <button
                  className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
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
                  {detail.location || "—"}
                </span>
                {detail.postedOn && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>Cập nhật {detail.postedOn}</span>
                  </>
                )}
              </div>
            </div>

            {/* Thông tin chung (khớp COMMON_FIELDS) */}
            <FieldGrid
              title="Thông tin chung"
              fields={COMMON_FIELDS}
              data={detail}
            />

            {/* Thông số theo danh mục */}
            <FieldGrid
              title={`Thông số theo danh mục — ${category}`}
              fields={catSchema}
              data={detail}
            />
          </div>

          {/* RIGHT column — Seller card + actions (đơn giản) */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-700">
                <div className="font-semibold">Người bán</div>
                <div className="mt-1 text-gray-500">
                  Thông tin người bán sẽ hiển thị ở đây.
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold cursor-pointer">
                  Đã bán / Ẩn tin
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-500 text-white font-semibold cursor-pointer"
                  onClick={() =>
                    navigate(`/add-listing?mode=edit&id=${detail.id}`)
                  }
                >
                  Sửa tin
                </button>
              </div>
            </div>

            {/* Bình luận placeholder */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800">Bình luận</h3>
              <div className="mt-4 text-center text-sm text-gray-500">
                Chưa có bình luận nào.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ManageDetail;
