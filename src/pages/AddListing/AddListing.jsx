// src/pages/AddListing/AddListing.jsx
import React, { useState, useEffect } from "react";
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
import brandService from "../../services/apis/brandApi";
import listingService from "../../services/apis/listingApi";
import { useNotification } from "../../contexts/NotificationContext";
import ChoosePackage from "./components/ChoosePackage";

const CATEGORY_OPTIONS = [
  { value: "ElectricCar", label: "Ô tô điện" },
  { value: "ElectricMotorbike", label: "Xe máy điện" },
  { value: "RemovableBattery", label: "Pin điện" },
];

const LISTING_STATUS_OPTIONS = [
  { value: "New", label: "Mới" },
  { value: "Used", label: "Đã sử dụng" },
];

// 🔧 Tách các field thành các nhóm để sắp xếp layout
const MAIN_FIELDS = [
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
    fieldType: "dropdown",
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
];

const AREA_FIELD = [
  { label: "Khu vực", name: "Area", fieldType: "text", icon: "FaMapMarkerAlt" },
];

const DESCRIPTION_FIELD = [
  {
    label: "Mô tả chi tiết",
    name: "Description",
    fieldType: "textarea",
    required: true,
    icon: "FaFileAlt",
    placeholder: "Mô tả tình trạng, bảo dưỡng, phụ kiện...",
  },
];

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
      rows={6}
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

const AddListing = () => {
  const [formData, setFormData] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [planProcessing, setPlanProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

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

  const prepareSubmissionPayload = (packageId = null) => {
    const formDataToSend = new FormData();

    // Thêm PackageId nếu có
    if (packageId) {
      formDataToSend.append("PackageId", packageId);
    } else if (selectedPackage) {
      formDataToSend.append("PackageId", selectedPackage.id);
    }

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
    if (!plan || (!pendingSubmission && !selectedPackage)) return;

    setPlanProcessing(true);
    setSubmitting(true);

    try {
      let payload;

      // Nếu có pendingSubmission thì dùng nó, không thì prepare mới
      if (pendingSubmission) {
        payload = {
          ...pendingSubmission,
          formDataToSend: new FormData(pendingSubmission.formDataToSend),
        };
        // Thêm PackageId vào pending payload
        payload.formDataToSend.append("PackageId", plan.id);
      } else {
        // Submit trực tiếp với selectedPackage đã có
        payload = prepareSubmissionPayload(plan.id);
      }

      const response = await listingService.createListing(
        payload.formDataToSend
      );

      if (!response?.success) {
        throw new Error(response?.error || "Không thể đăng tin");
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
          (formData.Title || "Tin mới"),
        price:
          rawListing?.price ??
          rawListing?.Price ??
          (formData.Price ? parseFloat(formData.Price) : 0),
        category:
          rawListing?.category ??
          rawListing?.Category ??
          (formData.Category || "ElectricCar"),
        images: Array.isArray(rawListing?.images ?? rawListing?.Images)
          ? rawListing?.images ?? rawListing?.Images
          : [],
      };

      // Reset form và đóng modal nếu đang mở
      setFormData({});
      setSelectedImages([]);
      setPlanModalOpen(false);
      setSelectedPackage(null);
      setPendingSubmission(null);

      showNotification(
        "Đăng tin thành công. Vui lòng hoàn tất thanh toán",
        "success"
      );

      // Navigate to payment
      // navigate("/payment", {
      //   state: { origin: "new-listing", listing: listingForPayment, plan }
      // });
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

  // Thêm hàm validation
  const validateForm = () => {
    const requiredFields = [
      "Title",
      "Price",
      "Category",
      "ListingStatus",
      "Description",
      "BrandId",
    ];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        showNotification(
          `Vui lòng điền ${MAIN_FIELDS.find((f) => f.name === field)?.label}`,
          "error"
        );
        return false;
      }
    }
    if (!selectedPackage) {
      showNotification("Vui lòng chọn gói đăng tin", "error");
      return false;
    }
    if (selectedImages.length === 0) {
      showNotification("Vui lòng tải ít nhất 1 ảnh", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra validation cơ bản
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Nếu đã có selectedPackage thì submit trực tiếp
      if (selectedPackage) {
        await handlePlanConfirm(selectedPackage);
      } else {
        // Nếu chưa có thì mở modal để chọn
        const payload = prepareSubmissionPayload();
        setPendingSubmission(payload);
        setPlanModalOpen(true);
      }
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

  const handleOpenPackageModal = () => {
    if (!formData?.Category) {
      showNotification("Vui lòng chọn danh mục trước", "error");
      return;
    }
    setPlanModalOpen(true);
  };

  // Clear selected package when Category changes to prevent mismatch
  useEffect(() => {
    setSelectedPackage((prev) =>
      prev && formData?.Category && prev.packageType !== formData.Category
        ? null
        : prev
    );
  }, [formData?.Category]);

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
          {/* Main Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MAIN_FIELDS.map((item) => {
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

          {/* Area Field và Package Selection - cùng hàng */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Khu vực */}
            <div>
              {AREA_FIELD.map((item) => {
                const Comp = fieldComponents[item.fieldType];
                return (
                  <div key={item.name}>
                    {Comp?.({
                      item,
                      formData,
                      onChange: handleInputChange,
                    })}
                  </div>
                );
              })}
            </div>

            {/* Chọn gói */}
            <div>
              <LabelWithIcon
                icon="FaClipboardList"
                label="Chọn gói đăng tin"
                required={true}
              />
              <button
                type="button"
                onClick={handleOpenPackageModal}
                disabled={submitting}
                className={`mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-left transition-colors duration-200 ${
                  selectedPackage
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                } ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {selectedPackage ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-700">
                        {selectedPackage.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedPackage.days} ngày -{" "}
                        {Number(selectedPackage.price).toLocaleString("vi-VN")}{" "}
                        đ
                      </div>
                    </div>
                    <span className="text-green-600 font-bold">✓ Đã chọn</span>
                  </div>
                ) : (
                  <div className="text-gray-400 flex items-center justify-between">
                    <span>Chọn gói đăng tin...</span>
                    <span className="text-xs text-gray-500">(Bắt buộc)</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Description Field - full width */}
          <div className="mt-8">
            {DESCRIPTION_FIELD.map((item) => {
              const Comp = fieldComponents[item.fieldType];
              return (
                <div key={item.name}>
                  {Comp?.({
                    item,
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
              disabled={submitting || !selectedPackage}
              className="cursor-pointer px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 disabled:opacity-70"
            >
              {submitting ? "Đang đăng..." : "Đăng tin"}
            </button>
          </div>
        </form>
      </motion.div>
      <ChoosePackage
        open={planModalOpen}
        onClose={handlePlanModalClose}
        onConfirm={(plan) => {
          setSelectedPackage(plan); // Lưu package đã chọn
        }}
        loading={planProcessing}
        category={formData?.Category}
      />
    </MainLayout>
  );
};

export default AddListing;
