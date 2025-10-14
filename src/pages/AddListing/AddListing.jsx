// src/pages/AddListing/AddListing.jsx
import React, { useState, useEffect } from "react"; // <— thêm useEffect
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaMoneyBillAlt,
  FaCar,
  FaCheckCircle,
  FaChargingStation,
  FaIndustry,
  FaCalendarAlt,
  FaRoad,
  FaTachometerAlt,
  FaPallet,
  FaFileAlt,
  FaMapMarkerAlt,
  FaCircle,
} from "react-icons/fa";
import { Camera } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import brandService from "../../services/apis/brandapi";
import listingService from "../../services/apis/listingApi"; // <— import service listing
import { useNotification } from "../../contexts/NotificationContext";

/** =========================================================
 *  API-Compatible schema (multipart/form-data)
 *  (giữ nguyên mô tả của bạn)
 * ========================================================= */

const CATEGORY_OPTIONS = [
  { value: "ElectricCar", label: "Ô tô điện" },
  { value: "ElectricMotorbike", label: "Xe máy điện" },
  { value: "RemovableBattery", label: "Pin rời" },
];

const LISTING_STATUS_OPTIONS = [
  { value: "New", label: "Mới" },
  { value: "Used", label: "Đã sử dụng" },
];

// 🔧 Đổi BrandId thành dropdown (options sẽ gán động khi render)
const FIELDS = [
  {
    label: "Danh mục",
    name: "Category",
    fieldType: "dropdown",
    required: true,
    options: CATEGORY_OPTIONS,
    icon: "FaCar",
  },
  {
    label: "Trạng thái",
    name: "ListingStatus",
    fieldType: "dropdown",
    required: true,
    options: LISTING_STATUS_OPTIONS,
    icon: "FaCheckCircle",
  },
  {
    label: "Tiêu đề",
    name: "Title",
    fieldType: "text",
    required: true,
    icon: "FaClipboardList",
    placeholder: "VD: Bán ô tô điện...",
  },
  {
    label: "Giá (VND)",
    name: "Price",
    fieldType: "number",
    required: true,
    icon: "FaMoneyBillAlt",
    placeholder: "VD: 650000000",
  },
  {
    label: "Thương hiệu",
    name: "BrandId",
    fieldType: "dropdown", // <— đổi từ text sang dropdown
    required: true,
    icon: "FaIndustry",
  },
  { label: "Model", name: "Model", fieldType: "text", icon: "FaCar" },
  {
    label: "Năm sản xuất",
    name: "YearOfManufacture",
    fieldType: "number",
    icon: "FaCalendarAlt",
    placeholder: "VD: 2022",
  },
  { label: "Màu", name: "Color", fieldType: "text", icon: "FaCircle" },
  {
    label: "Dung lượng pin (kWh)",
    name: "BatteryCapacity",
    fieldType: "number",
    icon: "FaChargingStation",
  },
  {
    label: "Thời gian sạc (giờ)",
    name: "ChargingTime",
    fieldType: "number",
    icon: "FaChargingStation",
  },
  {
    label: "Tầm hoạt động thực tế (km)",
    name: "ActualOperatingRange",
    fieldType: "number",
    icon: "FaRoad",
  },
  {
    label: "Odo (km)",
    name: "Odo",
    fieldType: "number",
    icon: "FaTachometerAlt",
  },
  {
    label: "Kích thước (Size)",
    name: "Size",
    fieldType: "number",
    icon: "FaPallet",
  },
  {
    label: "Khối lượng (kg)",
    name: "Mass",
    fieldType: "number",
    icon: "FaPallet",
  },
  { label: "Khu vực", name: "Area", fieldType: "text", icon: "FaMapMarkerAlt" },
  {
    label: "Mô tả chi tiết",
    name: "Description",
    fieldType: "textarea",
    required: true,
    icon: "FaFileAlt",
    placeholder: "Mô tả tình trạng, bảo dưỡng, phụ kiện...",
  },
];

/* =========================================================
 * ICON MAP
 * ======================================================= */
const ICONS = {
  FaClipboardList: <FaClipboardList />,
  FaMoneyBillAlt: <FaMoneyBillAlt />,
  FaCar: <FaCar />,
  FaCheckCircle: <FaCheckCircle />,
  FaChargingStation: <FaChargingStation />,
  FaIndustry: <FaIndustry />,
  FaCalendarAlt: <FaCalendarAlt />,
  FaRoad: <FaRoad />,
  FaTachometerAlt: <FaTachometerAlt />,
  FaPallet: <FaPallet />,
  FaFileAlt: <FaFileAlt />,
  FaMapMarkerAlt: <FaMapMarkerAlt />,
  FaCircle: <FaCircle />,
};

/* =========================================================
 * HELPERS & SUBCOMPONENTS
 * ======================================================= */
const valOf = (obj, name) => obj?.[name] ?? "";

const LabelWithIcon = ({ icon, label, required, hint }) => (
  <label className="text-sm font-medium text-gray-700 flex gap-2 items-center">
    <span className="text-primary bg-green-100 p-1.5 rounded-full">
      {ICONS[icon]}
    </span>
    <span className="flex items-center gap-2">
      {label} {required && <span className="text-red-500">*</span>}
      {hint && (
        <span title={hint} className="text-gray-400 hover:text-gray-600">
          i
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
        disabled={item.disabled}
      />
    </div>
  </div>
);

const DropdownField = ({ item, formData, onChange }) => {
  const opts = (item.options || []).map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <div>
      <LabelWithIcon
        icon={item.icon}
        label={item.label}
        required={item.required}
      />
      <select
        id={item.name}
        name={item.name}
        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-900"
        value={valOf(formData, item.name)}
        onChange={(e) => onChange(item.name, e.target.value)}
        required={item.required}
        disabled={item.disabled}
      >
        <option value="" disabled>
          {item.placeholder || `Chọn ${item.label.toLowerCase()}`}
        </option>
        {opts.map((o) => (
          <option key={`${item.name}-${o.value}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {item.helperText ? (
        <p className="mt-1 text-xs text-gray-500">{item.helperText}</p>
      ) : null}
    </div>
  );
};

const TextAreaField = ({ item, formData, onChange }) => (
  <div>
    <LabelWithIcon
      icon={item.icon}
      label={item.label}
      required={item.required}
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
      disabled={item.disabled}
    />
  </div>
);

const fieldComponents = {
  text: (p) => <InputField {...p} />,
  number: (p) => <InputField {...p} />,
  dropdown: (p) => <DropdownField {...p} />,
  textarea: (p) => <TextAreaField {...p} />,
};

const PlanSelectionModal = ({ open, onClose, onConfirm, loading }) => {
  const plans = [
    { days: 15, price: 35100, oldPrice: 39000, discount: 10 },
    { days: 10, price: 26000, oldPrice: null, discount: 0 },
    { days: 30, price: 62400, oldPrice: 78000, discount: 20 },
    { days: 60, price: 117000, oldPrice: 156000, discount: 25 },
  ];
  const [selected, setSelected] = useState(plans[0]);

  useEffect(() => {
    if (!open) setSelected(plans[0]);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
      />
      <div className="relative mx-3 mt-16 md:mt-0 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="font-semibold text-gray-800">Chọn gói đăng tin</div>
          <button
            type="button"
            className="px-2 text-gray-600 text-xl leading-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={loading}
          >
            x
          </button>
        </div>
        <div className="p-5">
          <div className="font-semibold text-gray-800 mb-3">
            Chọn thời gian hiển thị tin
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const active = selected?.days === plan.days;
              return (
                <button
                  key={`plan-${plan.days}`}
                  type="button"
                  onClick={() => setSelected(plan)}
                  className={`relative text-left rounded-lg border px-4 py-4 cursor-pointer transition ${
                    active
                      ? "border-green-600 bg-green-50 ring-1 ring-green-200"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {plan.discount > 0 && (
                    <span className="absolute -top-2 -right-2 text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
                      -{plan.discount}%
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-5 w-5 rounded-full border ${
                        active
                          ? "border-green-600 bg-blue-600 ring-2 ring-green-200"
                          : "border-gray-300"
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {plan.days} ngày
                      </div>
                      <div className="text-gray-500">
                        {plan.oldPrice ? (
                          <>
                            <span className="line-through mr-2">
                              {Number(plan.oldPrice).toLocaleString("vi-VN")} đ
                            </span>
                            <span className="font-medium text-gray-800">
                              {Number(plan.price).toLocaleString("vi-VN")} đ
                            </span>
                          </>
                        ) : (
                          <span className="font-medium text-gray-800">
                            {Number(plan.price).toLocaleString("vi-VN")} đ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onClose}
              disabled={loading}
            >
              Quay lại
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-cyan-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onConfirm(selected)}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Tiếp tục thanh toán"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
 * MAIN
 * ======================================================= */
const AddListing = () => {
  const [formData, setFormData] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [planProcessing, setPlanProcessing] = useState(false);

  // 👉 State cho Brand dropdown
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState("");
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBrandsLoading(true);
        setBrandsError("");
        const res = await brandService.getBrands();
        const list = Array.isArray(res)
          ? res
          : res?.data?.data ?? res?.result ?? [];
        if (!Array.isArray(list))
          throw new Error("Dữ liệu thương hiệu không hợp lệ");
        if (mounted) setBrands(list);
      } catch (err) {
        if (mounted)
          setBrandsError(err?.message || "Không thể tải danh sách thương hiệu");
        console.error(err);
      } finally {
        if (mounted) setBrandsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Chuẩn hoá options: cố gắng nhận diện các key id/name phổ biến
  const brandOptions = (brands || [])
    .map((b) => {
      const value =
        b.id ?? b.Id ?? b.ID ?? b.brandId ?? b.BrandId ?? b.BrandID ?? b.uuid;
      const label =
        b.name ?? b.Name ?? b.brandName ?? b.BrandName ?? b.title ?? b.Title;
      return value && label
        ? { value: String(value), label: String(label) }
        : null;
    })
    .filter(Boolean);

  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

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

  const handleImageUpload = (e) => addFiles(Array.from(e.target.files || []));
  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer?.files || []));
  };
  const handleDragOver = (e) => e.preventDefault();
  const removeImage = (index) =>
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));

  const prepareSubmissionPayload = () => {
    const formDataToSend = new FormData();

    Object.keys(formData || {}).forEach((key) => {
      const value = formData[key];

      if (key === "Price" && value) {
        formDataToSend.append(key, parseFloat(value) || 0);
      } else if (key === "BrandId" && value) {
        formDataToSend.append(key, value);
      } else if (value !== null && value !== undefined && value !== "") {
        formDataToSend.append(key, value);
      } else {
        if (key === "Size") formDataToSend.append(key, "0");
        else if (key === "BatteryCapacity") formDataToSend.append(key, "0");
        else if (key === "ActualOperatingRange")
          formDataToSend.append(key, "0");
        else if (key === "YearOfManufacture") formDataToSend.append(key, "0");
        else if (key === "Mass") formDataToSend.append(key, "0");
        else if (key === "Odo") formDataToSend.append(key, "0");
        else if (key === "ChargingTime") formDataToSend.append(key, "0");
        else formDataToSend.append(key, "");
      }
    });

    const requiredDefaults = {
      Size: "0",
      BrandId: formData.BrandId || "",
      Color: formData.Color || "string",
      BatteryCapacity: "0",
      Price: formData.Price ? parseFloat(formData.Price) : "0",
      Model: formData.Model || "string",
      ActualOperatingRange: "0",
      Area: formData.Area || "string",
      YearOfManufacture: "0",
      Mass: "0",
      ListingStatus: formData.ListingStatus || "New",
      Title: formData.Title || "string",
      Odo: "0",
      Description: formData.Description || "string",
      ChargingTime: "0",
      Category: formData.Category || "ElectricCar",
    };

    Object.keys(requiredDefaults).forEach((key) => {
      if (!formDataToSend.has(key)) {
        formDataToSend.append(key, requiredDefaults[key]);
      }
    });

    selectedImages.forEach((image) => {
      formDataToSend.append("ListingImages", image);
    });

    const summary = {
      title: formData.Title || "Tin moi",
      price: formData.Price ? parseFloat(formData.Price) : 0,
      category: formData.Category || "ElectricCar",
    };

    return { formDataToSend, summary };
  };

  const handlePlanModalClose = () => {
    if (planProcessing) return;
    setPlanModalOpen(false);
    setPendingSubmission(null);
    setSubmitting(false);
  };

  const handlePlanConfirm = async (plan) => {
    if (!plan || !pendingSubmission) return;
    setPlanProcessing(true);
    setSubmitting(true);

    try {
      const response = await listingService.createListing(
        pendingSubmission.formDataToSend
      );

      if (!response?.success) {
        throw new Error(response?.error || "Kh?ng th? dang tin");
      }

      const rawListing = response?.data?.data ?? response?.data ?? {};
      const listingForPayment = {
        id:
          rawListing?.id ??
          rawListing?.Id ??
          rawListing?.listingId ??
          rawListing?.ListingId ??
          null,
        title:
          rawListing?.title ??
          rawListing?.Title ??
          pendingSubmission.summary.title,
        price:
          rawListing?.price ??
          rawListing?.Price ??
          pendingSubmission.summary.price,
        category:
          rawListing?.category ??
          rawListing?.Category ??
          pendingSubmission.summary.category,
        images: Array.isArray(rawListing?.images ?? rawListing?.Images)
          ? rawListing?.images ?? rawListing?.Images
          : [],
      };

      setPlanModalOpen(false);
      setPendingSubmission(null);
      setFormData({});
      setSelectedImages([]);

      showNotification(
        "Đăng tin thành công. Vui lòng hoàn tất thanh toán",
        "success"
      );

      navigate("/payment", {
        state: {
          origin: "new-listing",
          listing: listingForPayment,
          plan,
        },
      });
    } catch (err) {
      console.error("Create listing error:", err);
      showNotification(
        `Không thể đăng tin: ${err?.message || "Có lỗi xảy ra"}`,
        "error"
      );
    } finally {
      setPlanProcessing(false);
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = prepareSubmissionPayload();
      setPendingSubmission(payload);
      setPlanModalOpen(true);
    } catch (err) {
      console.error("Prepare listing error:", err);
      showNotification(
        `Không thể khởi tạo dữ liệu đăng tin: ${
          err?.message || "Có lỗi xảy ra"
        }`,
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };
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
          {/* Fields (strictly matching API) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FIELDS.map((item) => {
              // Tiêm options + trạng thái cho BrandId
              const isBrand = item.name === "BrandId";
              const effectiveItem = isBrand
                ? {
                    ...item,
                    fieldType: "dropdown",
                    options: brandOptions,
                    disabled:
                      brandsLoading ||
                      !!brandsError ||
                      brandOptions.length === 0,
                    placeholder: brandsLoading
                      ? "Đang tải thương hiệu..."
                      : "Chọn thương hiệu",
                  }
                : item;

              const Comp = fieldComponents[effectiveItem.fieldType];
              return (
                <div key={effectiveItem.name}>
                  {Comp?.({
                    item: effectiveItem,
                    formData,
                    onChange: handleInputChange,
                  })}
                </div>
              );
            })}
          </div>

          {/* Images */}
          <div className="mt-8">
            <h3 className="font-semibold text-2xl mb-4 text-gray-700">
              Ảnh minh hoạ
            </h3>

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
              disabled={submitting}
              className="cursor-pointer px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 disabled:opacity-70"
            >
              {submitting ? "Đang đăng..." : "Đăng tin"}
            </button>
          </div>
        </form>
      </motion.div>
      <PlanSelectionModal
        open={planModalOpen}
        onClose={handlePlanModalClose}
        onConfirm={handlePlanConfirm}
        loading={planProcessing}
      />
    </MainLayout>
  );
};

export default AddListing;
