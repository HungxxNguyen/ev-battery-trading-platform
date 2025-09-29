// src/pages/AddListing/AddListing.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaClipboardList,
  FaTag,
  FaMoneyBillAlt,
  FaCar,
  FaCheckCircle,
  FaChargingStation,
  FaIndustry,
  FaCalendarAlt,
  FaRoad,
  FaCogs,
  FaTachometerAlt,
  FaWrench,
  FaCircle,
  FaPallet,
  FaDoorClosed,
  FaIdCard,
  FaTags,
  FaFileAlt,
  FaInfoCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Camera } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";

/* =========================================================
 * CẤU HÌNH DANH MỤC
 * ======================================================= */
const CATEGORIES = {
  CAR: "Ô tô điện",
  TWO_WHEEL: "Xe 2 bánh điện",
  OTHER_EV: "Phương tiện điện khác",
  BATTERY: "Pin rời",
};
const CATEGORY_OPTIONS = Object.values(CATEGORIES);

/* =========================================================
 * CÁC TRƯỜNG CHUNG CHO MỌI DANH MỤC
 * ======================================================= */
const COMMON_FIELDS = [
  {
    label: "Tiêu đề tin",
    name: "listingTitle",
    fieldType: "text",
    required: true,
    icon: "FaClipboardList",
    placeholder: "VD: Bán VinFast VF e34 2022 bản pin sở hữu",
  },
  {
    label: "Slogan / Mô tả ngắn",
    name: "tagline",
    fieldType: "text",
    icon: "FaTag",
    placeholder: "Đi một lần là mê, pin khoẻ chạy xa",
  },
  {
    label: "Giá (VND)",
    name: "price",
    fieldType: "number",
    required: true,
    icon: "FaMoneyBillAlt",
    placeholder: "VD: 650000000",
    hint: "Giá bán dự kiến (đơn vị VND).",
  },
  {
    label: "Tình trạng",
    name: "condition",
    fieldType: "dropdown",
    required: true,
    options: ["Mới", "Đã sử dụng", "Tân trang (Refurbished)"],
    icon: "FaCheckCircle",
    hint: "Tân trang: đã được kiểm tra/sửa chữa để hoạt động tốt.",
  },
  {
    label: "Hãng",
    name: "make",
    fieldType: "text",
    icon: "FaIndustry",
    placeholder: "VD: VinFast, Tesla, Yamaha...",
  },
  {
    label: "Model",
    name: "model",
    fieldType: "text",
    icon: "FaCar",
    placeholder: "VD: VF e34, VF 8, Gogo, Vespa E...",
  },
  {
    label: "Năm sản xuất",
    name: "year",
    fieldType: "number",
    icon: "FaCalendarAlt",
    placeholder: "VD: 2022",
  },
  {
    label: "Khu vực",
    name: "location",
    fieldType: "text",
    icon: "FaMapMarkerAlt",
    placeholder: "VD: Quận 1, TP. HCM",
  },
  {
    label: "Mô tả chi tiết",
    name: "listingDescription",
    fieldType: "textarea",
    required: true,
    icon: "FaFileAlt",
    placeholder:
      "Mô tả rõ tình trạng xe/pin, bảo dưỡng, phụ kiện kèm theo, lý do bán...",
  },
];

/* =========================================================
 * SCHEMA THEO DANH MỤC (VIỆT HOÁ + TOOLTIP)
 * ======================================================= */
const SCHEMA_BY_CATEGORY = {
  [CATEGORIES.CAR]: [
    {
      label: "Loại EV",
      name: "evType",
      fieldType: "dropdown",
      required: true,
      options: ["BEV (thuần điện)", "PHEV (lai sạc ngoài)", "HEV (lai tự sạc)"],
      icon: "FaChargingStation",
      hint: "BEV: 100% điện; PHEV/HEV: có động cơ xăng hỗ trợ.",
    },
    {
      label: "Dẫn động",
      name: "driveType",
      fieldType: "dropdown",
      options: ["FWD", "RWD", "AWD"],
      icon: "FaRoad",
    },
    {
      label: "Số km đã đi (Odo)",
      name: "odometer",
      fieldType: "number",
      icon: "FaTachometerAlt",
      placeholder: "VD: 25000",
    },
    {
      label: "Dung lượng pin (kWh)",
      name: "batteryCapacityKWh",
      fieldType: "number",
      required: true,
      icon: "FaChargingStation",
      placeholder: "VD: 42",
      hint: "Dung lượng danh định của pack pin.",
    },
    {
      label: "Sức khỏe pin SOH (%)",
      name: "batterySOH",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "0–100",
      hint: "SOH: phần trăm sức khỏe còn lại theo BMS (càng cao càng tốt).",
    },
    {
      label: "Chu kỳ sạc (cycles)",
      name: "chargeCycles",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "VD: 300",
      hint: "Số lần sạc/xả đầy (ước lượng).",
    },
    {
      label: "Tầm hoạt động thực tế (km)",
      name: "rangeKm",
      fieldType: "number",
      icon: "FaTachometerAlt",
      placeholder: "VD: 260",
    },
    {
      label: "Công suất sạc AC (kW)",
      name: "acPowerKw",
      fieldType: "number",
      icon: "FaChargingStation",
      placeholder: "VD: 7.4",
    },
    {
      label: "Sạc nhanh DC (kW)",
      name: "dcPowerKw",
      fieldType: "number",
      icon: "FaChargingStation",
      placeholder: "VD: 100",
    },
    {
      label: "Chuẩn cổng sạc",
      name: "chargeStandard",
      fieldType: "dropdown",
      options: ["Type 2", "CCS2", "CHAdeMO", "Khác"],
      icon: "FaChargingStation",
      hint: "Chọn đúng chuẩn trạm sạc tương thích.",
    },
    {
      label: "Thời gian sạc (giờ)",
      name: "chargingTimeH",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "VD: 8",
    },
    {
      label: "Hình thức pin",
      name: "batteryOwnership",
      fieldType: "dropdown",
      options: ["Sở hữu", "Thuê (leasing)"],
      icon: "FaIdCard",
      hint: "Một số hãng áp dụng thuê pin định kỳ.",
    },
    {
      label: "Bảo hành còn lại (tháng)",
      name: "warrantyMonths",
      fieldType: "number",
      icon: "FaCheckCircle",
      placeholder: "VD: 12",
    },
    {
      label: "Màu xe",
      name: "color",
      fieldType: "dropdown",
      options: ["Trắng", "Đen", "Xanh", "Bạc", "Đỏ", "Khác"],
      icon: "FaPallet",
    },
    {
      label: "Số cửa",
      name: "doors",
      fieldType: "number",
      icon: "FaDoorClosed",
      placeholder: "VD: 5",
    },
    {
      label: "Số VIN",
      name: "vin",
      fieldType: "text",
      icon: "FaIdCard",
      placeholder: "Số khung/VIN (nếu có)",
    },
  ],

  [CATEGORIES.TWO_WHEEL]: [
    {
      label: "Loại pack pin",
      name: "batteryPackType",
      fieldType: "dropdown",
      options: ["Pin rời", "Pin liền (không rời)"],
      icon: "FaChargingStation",
      hint: "Pin rời có thể tháo sạc riêng; pin liền sạc trực tiếp trên xe.",
    },
    {
      label: "Số pack pin",
      name: "packCount",
      fieldType: "number",
      icon: "FaChargingStation",
      placeholder: "VD: 2",
    },
    {
      label: "Dung lượng pin (kWh / Ah)",
      name: "batteryCapacity",
      fieldType: "text",
      required: true,
      icon: "FaChargingStation",
      placeholder: "VD: 2.0 kWh hoặc 20Ah-60V",
    },
    {
      label: "Sức khỏe pin SOH (%)",
      name: "batterySOH",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "0–100",
    },
    {
      label: "Chu kỳ sạc (cycles)",
      name: "chargeCycles",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "VD: 200",
    },
    {
      label: "Công suất motor (kW)",
      name: "motorPowerKw",
      fieldType: "number",
      icon: "FaCogs",
      placeholder: "VD: 2",
    },
    {
      label: "Tốc độ tối đa (km/h)",
      name: "topSpeed",
      fieldType: "number",
      icon: "FaTachometerAlt",
      placeholder: "VD: 60",
    },
    {
      label: "Tầm hoạt động (km)",
      name: "rangeKm",
      fieldType: "number",
      icon: "FaTachometerAlt",
      placeholder: "VD: 70",
    },
    {
      label: "Thời gian sạc (giờ)",
      name: "chargingTimeH",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "VD: 4",
    },
    {
      label: "Kèm sạc",
      name: "chargerIncluded",
      fieldType: "dropdown",
      options: ["Có", "Không"],
      icon: "FaCheckCircle",
    },
    {
      label: "Kích cỡ bánh (inch)",
      name: "wheelSize",
      fieldType: "number",
      icon: "FaCircle",
      placeholder: "VD: 12",
    },
    {
      label: "Loại phanh",
      name: "brakeType",
      fieldType: "dropdown",
      options: ["Đĩa", "Tang trống", "Kết hợp"],
      icon: "FaCogs",
    },
    {
      label: "Khối lượng (kg)",
      name: "weightKg",
      fieldType: "number",
      icon: "FaPallet",
      placeholder: "VD: 80",
    },
    {
      label: "Giấy tờ",
      name: "docs",
      fieldType: "dropdown",
      options: ["Đủ giấy tờ", "Chưa đủ"],
      icon: "FaFileAlt",
    },
  ],

  [CATEGORIES.OTHER_EV]: [
    {
      label: "Loại phương tiện",
      name: "vehicleType",
      fieldType: "dropdown",
      options: ["E-bike", "E-moped", "ATV", "Mini EV", "Khác"],
      icon: "FaCar",
    },
    {
      label: "Điện áp hệ (V)",
      name: "systemVoltage",
      fieldType: "number",
      icon: "FaChargingStation",
      placeholder: "VD: 48",
    },
    {
      label: "Dung lượng pin (kWh / Ah)",
      name: "batteryCapacity",
      fieldType: "text",
      required: true,
      icon: "FaChargingStation",
      placeholder: "VD: 1.2 kWh hoặc 12Ah-48V",
    },
    {
      label: "Sức khỏe pin SOH (%)",
      name: "batterySOH",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "0–100",
    },
    {
      label: "Chu kỳ sạc (cycles)",
      name: "chargeCycles",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "VD: 150",
    },
    {
      label: "Công suất motor (W/kW)",
      name: "motorPower",
      fieldType: "text",
      icon: "FaCogs",
      placeholder: "VD: 750W hoặc 1.5kW",
    },
    {
      label: "Tầm hoạt động (km)",
      name: "rangeKm",
      fieldType: "number",
      icon: "FaTachometerAlt",
      placeholder: "VD: 40",
    },
    {
      label: "Tốc độ tối đa (km/h)",
      name: "topSpeed",
      fieldType: "number",
      icon: "FaTachometerAlt",
      placeholder: "VD: 35",
    },
    {
      label: "Thời gian sạc (giờ)",
      name: "chargingTimeH",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "VD: 5",
    },
    {
      label: "Phụ kiện kèm theo",
      name: "accessories",
      fieldType: "text",
      icon: "FaTags",
      placeholder: "VD: 1 sạc, 2 chìa khoá...",
    },
  ],

  [CATEGORIES.BATTERY]: [
    {
      label: "Dung lượng danh định (kWh / Ah)",
      name: "nominalCapacity",
      fieldType: "text",
      required: true,
      icon: "FaChargingStation",
      placeholder: "VD: 4.5 kWh hoặc 20Ah",
      hint: "Ghi rõ đơn vị để tránh nhầm lẫn.",
    },
    {
      label: "Điện áp danh định (V)",
      name: "nominalVoltage",
      fieldType: "number",
      required: true,
      icon: "FaChargingStation",
      placeholder: "VD: 48",
    },
    {
      label: "Hoá học cell",
      name: "chemistry",
      fieldType: "dropdown",
      options: ["LFP", "NMC", "NCA", "LCO", "Khác"],
      icon: "FaCogs",
      hint: "LFP bền, an toàn; NMC/NCA mật độ cao hơn.",
    },
    {
      label: "Sức khỏe pin SOH (%)",
      name: "batterySOH",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "0–100",
    },
    {
      label: "Chu kỳ sạc (cycles)",
      name: "chargeCycles",
      fieldType: "number",
      icon: "FaWrench",
      placeholder: "VD: 400",
    },
    {
      label: "BMS đi kèm",
      name: "bmsIncluded",
      fieldType: "dropdown",
      options: ["Có", "Không"],
      icon: "FaCheckCircle",
      hint: "BMS bảo vệ sạc/xả, đo SOH/SOC, cân bằng cell...",
    },
    {
      label: "Chuẩn jack/connector",
      name: "connector",
      fieldType: "text",
      icon: "FaIdCard",
      placeholder: "VD: XT90, Anderson...",
    },
    {
      label: "Kích thước (DxRxC, mm)",
      name: "dimensions",
      fieldType: "text",
      icon: "FaPallet",
      placeholder: "VD: 350 x 160 x 120",
    },
    {
      label: "Khối lượng (kg)",
      name: "weightKg",
      fieldType: "number",
      icon: "FaPallet",
      placeholder: "VD: 18",
    },
    {
      label: "Ngày sản xuất (YYYY-MM)",
      name: "mfgDate",
      fieldType: "text",
      icon: "FaCalendarAlt",
      placeholder: "VD: 2023-06",
    },
    {
      label: "Bảo hành còn lại (tháng)",
      name: "warrantyMonths",
      fieldType: "number",
      icon: "FaCheckCircle",
      placeholder: "VD: 10",
    },
  ],
};

/* =========================================================
 * ICON MAP
 * ======================================================= */
const ICONS = {
  FaClipboardList: <FaClipboardList />,
  FaTag: <FaTag />,
  FaMoneyBillAlt: <FaMoneyBillAlt />,
  FaCar: <FaCar />,
  FaCheckCircle: <FaCheckCircle />,
  FaChargingStation: <FaChargingStation />,
  FaIndustry: <FaIndustry />,
  FaCalendarAlt: <FaCalendarAlt />,
  FaRoad: <FaRoad />,
  FaCogs: <FaCogs />,
  FaTachometerAlt: <FaTachometerAlt />,
  FaWrench: <FaWrench />,
  FaCircle: <FaCircle />,
  FaPallet: <FaPallet />,
  FaDoorClosed: <FaDoorClosed />,
  FaIdCard: <FaIdCard />,
  FaTags: <FaTags />,
  FaFileAlt: <FaFileAlt />,
  FaMapMarkerAlt: <FaMapMarkerAlt />,
};

/* =========================================================
 * HELPERS
 * ======================================================= */
const valOf = (obj, name) => obj?.[name] ?? "";

/* =========================================================
 * SUBCOMPONENTS
 * ======================================================= */
const LabelWithIcon = ({ icon, label, required, hint }) => (
  <label className="text-sm font-medium text-gray-700 flex gap-2 items-center">
    <span className="text-primary bg-green-100 p-1.5 rounded-full">
      {ICONS[icon]}
    </span>
    <span className="flex items-center gap-2">
      {label} {required && <span className="text-red-500">*</span>}
      {hint && (
        <span title={hint} className="text-gray-400 hover:text-gray-600">
          <FaInfoCircle />
        </span>
      )}
    </span>
  </label>
);

const InputField = ({ item, formData, onChange }) => (
  <div>
    <LabelWithIcon
      icon={item.icon}
      label={item.label}
      required={item.required}
      hint={item.hint}
    />
    <div className="relative">
      <input
        id={item.name}
        name={item.name}
        autoComplete="off"
        type={item.fieldType === "number" ? "number" : "text"}
        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-900 placeholder-gray-400"
        placeholder={item.placeholder || `Nhập ${item.label.toLowerCase()}`}
        value={valOf(formData, item.name)}
        onChange={(e) => onChange(item.name, e.target.value)}
        required={item.required}
      />
    </div>
  </div>
);

const DropdownField = ({ item, formData, onChange }) => (
  <div>
    <LabelWithIcon
      icon={item.icon}
      label={item.label}
      required={item.required}
      hint={item.hint}
    />
    <select
      id={item.name}
      name={item.name}
      className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-900"
      value={valOf(formData, item.name)}
      onChange={(e) => onChange(item.name, e.target.value)}
      required={item.required}
    >
      <option value="" disabled>
        Chọn {item.label.toLowerCase()}
      </option>
      {item.options?.map((option) => (
        <option key={`${item.name}-${option}`} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({ item, formData, onChange }) => (
  <div>
    <LabelWithIcon
      icon={item.icon}
      label={item.label}
      required={item.required}
      hint={item.hint}
    />
    <textarea
      id={item.name}
      name={item.name}
      rows={4}
      className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-900 placeholder-gray-400"
      placeholder={item.placeholder || `Nhập ${item.label.toLowerCase()}`}
      value={valOf(formData, item.name)}
      onChange={(e) => onChange(item.name, e.target.value)}
      required={item.required}
    />
  </div>
);

/* =========================================================
 * MAIN
 * ======================================================= */
const AddListing = () => {
  const [formData, setFormData] = useState({ category: "" });
  const [featuresData, setFeaturesData] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);

  const handleInputChange = (name, value) => {
    // Khi đổi danh mục, reset formData tối giản (giữ category)
    if (name === "category") {
      setFormData({ category: value });
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeaturesChange = (name, checked) =>
    setFeaturesData((prev) => ({ ...prev, [name]: checked }));

  // --- Upload qua input ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  // --- Drag & Drop ---
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    addFiles(files);
  };
  const handleDragOver = (e) => e.preventDefault();

  const addFiles = (files) => {
    if (!files.length) return;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const remain = Math.max(0, 10 - selectedImages.length);
    const slice = files.slice(0, remain);
    const valid = slice.filter(
      (f) => allowed.includes(f.type) && f.size <= 10 * 1024 * 1024
    );
    setSelectedImages((prev) => [...prev, ...valid]);
  };

  const removeImage = (index) =>
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData, featuresData, selectedImages);
    // TODO: call API lưu tin + upload ảnh
  };

  // Ghép schema động theo danh mục
  const currentSchema = [
    {
      label: "Danh mục",
      name: "category",
      fieldType: "dropdown",
      required: true,
      options: CATEGORY_OPTIONS,
      icon: "FaCar",
      hint: "Chọn đúng danh mục để hiển thị các trường phù hợp.",
    },
    ...COMMON_FIELDS,
    ...(SCHEMA_BY_CATEGORY[formData.category] || []),
  ];

  // Map fieldType -> component
  const fieldComponents = {
    text: (p) => <InputField {...p} />,
    number: (p) => <InputField {...p} />,
    dropdown: (p) => <DropdownField {...p} />,
    textarea: (p) => <TextAreaField {...p} />,
  };

  // Tính năng (đã Việt hoá)
  const FEATURES = [
    { name: "gps", label: "Dẫn đường GPS" },
    { name: "sunroof", label: "Cửa sổ trời" },
    { name: "leatherSeats", label: "Ghế da" },
    { name: "backupCamera", label: "Camera lùi" },
    { name: "wirelessCharging", label: "Sạc không dây" },
    { name: "autopilot", label: "Hỗ trợ lái (Autopilot)" },
  ];

  return (
    <MainLayout>
      <motion.div
        className="px-6 md:px-16 my-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="font-bold text-4xl text-gray-800 mb-4">Đăng tin mới</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 border border-gray-200 shadow-lg rounded-2xl"
        >
          {/* Thông tin EV/Pin */}
          <div className="mb-8">
            <h2 className="font-semibold text-2xl mb-4 text-gray-700">
              Thông tin EV/Pin
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentSchema.map((item) => (
                <div key={item.name}>
                  {fieldComponents[item.fieldType]?.({
                    item,
                    formData,
                    onChange: handleInputChange,
                  })}
                </div>
              ))}
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          {/* Tính năng */}
          <div className="mb-8">
            <h2 className="font-semibold text-2xl mb-4 text-gray-700">
              Tính năng
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEATURES.map((feature) => (
                <label
                  key={feature.name}
                  className="flex gap-2 items-center text-gray-700"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 border-gray-300 rounded focus:ring-indigo-400 focus:ring-2"
                    checked={!!featuresData[feature.name]}
                    onChange={(e) =>
                      handleFeaturesChange(feature.name, e.target.checked)
                    }
                  />
                  <span>{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Ảnh */}
          <div className="mb-8">
            <h2 className="font-semibold text-2xl mb-4 text-gray-700">
              Ảnh minh hoạ
            </h2>

            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-500" />
                <div className="flex text-sm text-gray-600 justify-center gap-1">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500 transition-colors duration-200"
                  >
                    <span>Tải ảnh lên</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p>hoặc kéo & thả</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WEBP tối đa 10MB/ảnh (tối đa 10 ảnh)
                </p>
              </div>
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {selectedImages.map((image, index) => (
                  <div
                    key={`preview-${index}`}
                    className="relative border border-gray-200 rounded-lg p-2 bg-white"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full max-h-64 object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      aria-label="Xoá ảnh"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="cursor-pointer px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
            >
              Đăng tin
            </button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  );
};

export default AddListing;
