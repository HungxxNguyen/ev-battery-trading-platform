// src/pages/UpdateListing/UpdateListing.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  FaLock,
  FaInfoCircle,
} from "react-icons/fa";
import { Camera } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import brandService from "../../services/apis/brandApi";
import listingService from "../../services/apis/listingApi";
import { useNotification } from "../../contexts/NotificationContext";

// Category + status options
const CATEGORY_OPTIONS = [
  { value: "ElectricCar", label: "Ô tô điện" },
  { value: "ElectricMotorbike", label: "Xe máy điện" },
  { value: "RemovableBattery", label: "Pin điện" },
];
const CATEGORY_LABEL = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label])
);

const LISTING_STATUS_OPTIONS = [
  { value: "New", label: "Mới" },
  { value: "Used", label: "Đã sử dụng" },
];

// Image constraints
const MAX_IMAGES = 10;
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Form field layout (reuse from AddListing)
const BASE_MAIN_FIELDS = [
  {
    label: "Danh mục",
    name: "Category",
    fieldType: "dropdown",
    required: true,
    options: CATEGORY_OPTIONS,
    icon: "FaCar",
    // Khóa không cho chọn danh mục khi cập nhật:
    disabled: true,
    help: "Danh mục được khóa để đảm bảo dữ liệu nhất quán.",
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
    placeholder: "VD: Cập nhật tin...",
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
    label: "Tình trạng pin còn lại (%)",
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
];

const DESCRIPTION_FIELD = [
  {
    name: "Description",
    fieldType: "textarea",
    icon: "FaFileAlt",
    placeholder: "Nêu rõ tình trạng xe, bảo dưỡng, phụ kiện kèm theo...",
  },
];

// Icons map
const ICONS = {
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
  FaLock,
  FaInfoCircle,
};

// Normalize helpers reused from AddListing
const normalizeBrandType = (t) => {
  if (t == null) return "";
  const raw = String(t?.value ?? t?.type ?? t?.Type ?? t ?? "").trim();
  if (/^electric\s*car$/i.test(raw)) return "ElectricCar";
  if (/^electric\s*motorbike$/i.test(raw)) return "ElectricMotorbike";
  if (/^removable\s*battery$/i.test(raw)) return "RemovableBattery";
  if (["ElectricCar", "ElectricMotorbike", "RemovableBattery"].includes(raw))
    return raw;
  return raw;
};
const toBrandModel = (b) => ({
  id: String(
    b.id ?? b.Id ?? b.ID ?? b.brandId ?? b.BrandId ?? b.BrandID ?? b.uuid ?? ""
  ),
  name: String(
    b.name ?? b.Name ?? b.brandName ?? b.BrandName ?? b.title ?? b.Title ?? ""
  ),
  type: normalizeBrandType(
    b.type ?? b.Type ?? b.category ?? b.Category ?? b.kind
  ),
});

// UI helpers
const badgeClass = (variant) => {
  switch (variant) {
    case "primary":
      return "bg-green-50 text-green-700 ring-1 ring-green-200";
    case "warn":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "muted":
      return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Field renderers
const FieldWrapper = ({ item, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <label className="block text-sm font-medium text-gray-700">
      {item.label}
      {item.required && <span className="text-red-500"> *</span>}
    </label>
    {item.help ? (
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
        <FaInfoCircle className="opacity-70" />
        <span>{item.help}</span>
      </div>
    ) : null}
    <div className="mt-2 flex items-center gap-2">{children}</div>
  </div>
);

const TextInput = ({ item, formData, onChange }) => {
  const Icon = ICONS[item.icon] || FaClipboardList;
  return (
    <FieldWrapper item={item}>
      <Icon className="text-gray-500" />
      <input
        type={item.fieldType === "number" ? "number" : "text"}
        value={formData[item.name] ?? ""}
        onChange={(e) => onChange(item.name, e.target.value)}
        placeholder={item.placeholder || ""}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </FieldWrapper>
  );
};

const Dropdown = ({ item, value, onChange, optionsOverride, disabled }) => {
  const Icon = ICONS[item.icon] || FaClipboardList;
  const opts = optionsOverride ?? item.options ?? [];
  return (
    <FieldWrapper item={item}>
      <Icon className="text-gray-500" />
      <select
        value={value ?? ""}
        onChange={(e) => onChange(item.name, e.target.value)}
        className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${
          disabled ? "opacity-70 pointer-events-none" : ""
        }`}
        disabled={disabled}
        aria-readonly={disabled}
        title={disabled ? "Trường này đã bị khóa khi cập nhật" : undefined}
      >
        {!disabled && (
          <option value="" disabled>
            Chọn {item.label.toLowerCase()}
          </option>
        )}
        {opts.length === 0 ? (
          <option value="" disabled>
            {disabled ? "—" : "Không có dữ liệu"}
          </option>
        ) : (
          opts.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        )}
      </select>
    </FieldWrapper>
  );
};

const ReadonlyBadge = ({ item, valueLabel }) => {
  const Icon = ICONS[item.icon] || FaClipboardList;
  return (
    <FieldWrapper item={item}>
      <Icon className="text-gray-500" />
      <div
        className={`px-3 py-2 rounded-lg text-sm ${badgeClass(
          "muted"
        )} select-none`}
      >
        {valueLabel || "—"}
      </div>
    </FieldWrapper>
  );
};

const TextArea = ({ item, formData, onChange }) => {
  const Icon = ICONS[item.icon] || FaFileAlt;
  return (
    <FieldWrapper item={item}>
      <Icon className="text-gray-500" />
      <textarea
        rows={6}
        value={formData[item.name] ?? ""}
        onChange={(e) => onChange(item.name, e.target.value)}
        placeholder={item.placeholder || "Mô tả chi tiết..."}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </FieldWrapper>
  );
};

const fieldComponents = {
  text: TextInput,
  number: TextInput,
  dropdown: ({ item, formData, onChange, optionsOverride, disabled }) => (
    <Dropdown
      item={item}
      value={formData[item.name]}
      onChange={onChange}
      optionsOverride={optionsOverride}
      disabled={disabled || item.disabled}
    />
  ),
  textarea: TextArea,
};

const UpdateListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({});
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState("");

  const [existingImages, setExistingImages] = useState([]); // [{id,url}]
  const [imagesToRemove, setImagesToRemove] = useState([]); // ids/urls
  const [imagesToAdd, setImagesToAdd] = useState([]); // File[]
  const [imageError, setImageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load brands
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
          setBrandsError(err?.message || "Không thể tải thương hiệu");
        console.error(err);
      } finally {
        if (mounted) setBrandsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Normalize brands for dropdown
  const brandsNormalized = useMemo(
    () => (brands || []).map(toBrandModel).filter((b) => b.id && b.name),
    [brands]
  );

  const filteredBrandOptions = useMemo(() => {
    const cat = formData?.Category;
    const list = cat ? brandsNormalized.filter((b) => b.type === cat) : [];
    return list.map((b) => ({ value: b.id, label: b.name, _type: b.type }));
  }, [brandsNormalized, formData?.Category]);

  // Change handler
  const handleInputChange = (name, value) =>
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Category bị khóa, nhưng vẫn giữ logic reset phòng khi sau này mở khóa
      if (name === "Category") next.BrandId = "";
      return next;
    });

  // Load current listing detail
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await listingService.getById(id);
        const payload = res?.data;
        const item =
          payload?.data && typeof payload.data === "object"
            ? payload.data
            : payload;
        if (!item) throw new Error("Không tìm thấy tin đăng");

        const prefill = {
          Id: item.id ?? item.Id ?? id,
          Title: item.title ?? item.Title ?? "",
          Price: item.price ?? item.Price ?? "",
          Category: item.category ?? item.Category ?? "",
          ListingStatus:
            item.listingStatus ??
            item.ListingStatus ??
            item.status ??
            item.Status ??
            "",
          BrandId:
            item.brandId ??
            item.BrandId ??
            item.brand?.id ??
            item.brand?.Id ??
            "",
          Model: item.model ?? item.Model ?? "",
          YearOfManufacture:
            item.yearOfManufacture ?? item.YearOfManufacture ?? "",
          Color: item.color ?? item.Color ?? "",
          BatteryCapacity: item.batteryCapacity ?? item.BatteryCapacity ?? "",
          ChargingTime: item.chargingTime ?? item.ChargingTime ?? "",
          ActualOperatingRange:
            item.actualOperatingRange ?? item.ActualOperatingRange ?? "",
          Odo: item.odo ?? item.Odo ?? "",
          Size: item.size ?? item.Size ?? "",
          Mass: item.mass ?? item.Mass ?? "",
          Area: item.area ?? item.Area ?? "",
          Description: item.description ?? item.Description ?? "",
        };
        if (active) setFormData(prefill);

        // Existing images
        const imgsRaw = Array.isArray(item.listingImages)
          ? item.listingImages
          : [];
        const imgs = imgsRaw
          .map((img) => {
            if (typeof img === "string") return { id: img, url: img };
            const id =
              img.id ??
              img.Id ??
              img.imageId ??
              img.ImageId ??
              img.url ??
              img.imageUrl;
            const url = img.imageUrl ?? img.url ?? "";
            return url ? { id: id || url, url } : null;
          })
          .filter(Boolean);

        if (active) setExistingImages(imgs);
      } catch (err) {
        console.error("Load listing detail error:", err);
        showNotification(err?.message || "Không thể tải tin đăng", "error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, showNotification]);

  // Image helpers
  const addFiles = (files) => {
    if (!files.length) return;
    let errorMsg = "";
    const remain = Math.max(
      0,
      MAX_IMAGES -
        (existingImages.length - imagesToRemove.length + imagesToAdd.length)
    );
    const slice = files.slice(0, remain);
    const valid = [];
    const invalid = [];
    slice.forEach((f) => {
      const okType = ALLOWED_TYPES.includes(f.type);
      const okSize = f.size <= MAX_SIZE_MB * 1024 * 1024;
      if (okType && okSize) valid.push(f);
      else invalid.push(f);
    });
    if (invalid.length > 0)
      errorMsg = `Có ${invalid.length} ảnh không hợp lệ (JPG/PNG/GIF/WEBP, ≤ ${MAX_SIZE_MB}MB/ảnh).`;
    else if (files.length > remain)
      errorMsg = `Tối đa ${MAX_IMAGES} ảnh cho mỗi tin.`;
    setImagesToAdd((prev) => [...prev, ...valid]);
    setImageError(errorMsg);
  };
  const handleImageUpload = (e) => addFiles(Array.from(e.target.files || []));
  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer?.files || []));
  };
  const handleDragOver = (e) => e.preventDefault();
  const toggleRemoveExisting = (img) =>
    setImagesToRemove((prev) =>
      prev.includes(img.id)
        ? prev.filter((x) => x !== img.id)
        : [...prev, img.id]
    );
  const removeNewImage = (idx) =>
    setImagesToAdd((prev) => prev.filter((_, i) => i !== idx));

  const validateForm = () => {
    const required = [
      "Id",
      "Title",
      "Price",
      "Category",
      "ListingStatus",
      "BrandId",
    ];
    for (const f of required) {
      if (!formData[f] || String(formData[f]).trim() === "") {
        const def = BASE_MAIN_FIELDS.find((x) => x.name === f) || { label: f };
        showNotification(`Vui lòng điền ${def.label}`, "error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("Id", String(formData.Id || id));

      [
        "Title",
        "Price",
        "Category",
        "ListingStatus",
        "BrandId",
        "Model",
        "YearOfManufacture",
        "Color",
        "BatteryCapacity",
        "ChargingTime",
        "ActualOperatingRange",
        "Odo",
        "Size",
        "Mass",
        "Area",
        "Description",
      ].forEach((k) => {
        const v = formData[k];
        if (v !== undefined && v !== null && String(v) !== "") fd.append(k, v);
      });

      imagesToAdd.forEach((file) => fd.append("ImagesToAdd", file));
      imagesToRemove.forEach((val) => fd.append("ImagesToRemove", val));

      const res = await listingService.updateListing(fd);
      if (!res?.success && !res?.data?.success)
        throw new Error(res?.error || res?.data?.error || "Cập nhật thất bại");

      const msg =
        res?.data?.message || res?.message || "Cập nhật bài đăng thành công";
      showNotification(msg, "success");
      navigate(`/manage-listing?tab=pending`);
    } catch (err) {
      console.error("Update listing error:", err);
      showNotification(err?.message || "Không thể cập nhật", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalImages =
    existingImages.length - imagesToRemove.length + imagesToAdd.length;

  // MAIN_FIELDS cho trang update (Category bị khóa)
  const MAIN_FIELDS = BASE_MAIN_FIELDS;

  const statusChip =
    formData?.ListingStatus === "New"
      ? { text: "Mới", cls: badgeClass("primary") }
      : formData?.ListingStatus
      ? { text: "Đã sử dụng", cls: badgeClass("muted") }
      : null;

  return (
    <MainLayout>
      <motion.div
        className="px-5 md:px-24 my-6 md:my-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Cập nhật tin đăng
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm ${badgeClass(
                "muted"
              )}`}
            >
              Danh mục:{" "}
              <strong className="ml-1">
                {CATEGORY_LABEL[formData?.Category] || "—"}
              </strong>
            </span>
            {statusChip ? (
              <span
                className={`px-3 py-1 rounded-full text-sm ${statusChip.cls}`}
              >
                Trạng thái: <strong className="ml-1">{statusChip.text}</strong>
              </span>
            ) : null}
            {/* {formData?.Id ? (
              <span className="px-3 py-1 rounded-full text-sm bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                ID:{" "}
                <strong className="ml-1">
                  {String(formData.Id).slice(0, 8)}...
                </strong>
              </span>
            ) : null} */}
          </div>

          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <FaLock className="opacity-70" />
            <span>
              Danh mục bị khóa ở màn cập nhật. Nếu cần đổi danh mục, hãy tạo tin
              mới.
            </span>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
            <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            {/* Main fields */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Thông tin chính
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MAIN_FIELDS.map((item) => {
                  const Comp = fieldComponents[item.fieldType];

                  // Category: khóa chọn — hiển thị dropdown disabled hoặc badge readonly
                  if (item.name === "Category") {
                    // Cách 1: Dropdown disabled (giữ bố cục đồng nhất)
                    return (
                      <div key={item.name}>
                        {fieldComponents.dropdown({
                          item,
                          formData,
                          onChange: handleInputChange,
                          optionsOverride: [
                            {
                              value: formData?.Category ?? "",
                              label: CATEGORY_LABEL[formData?.Category] || "—",
                            },
                          ],
                          disabled: true,
                        })}
                      </div>
                    );
                    // Cách 2 (thay thế): Badge readonly
                    // return (
                    //   <ReadonlyBadge
                    //     key={item.name}
                    //     item={item}
                    //     valueLabel={CATEGORY_LABEL[formData?.Category] || "—"}
                    //   />
                    // );
                  }

                  if (item.name === "BrandId") {
                    // Dropdown thương hiệu theo danh mục
                    const optItem = { ...item };
                    let opts = filteredBrandOptions;
                    if (brandsLoading) {
                      opts = [
                        {
                          value: "",
                          label: "Đang tải danh sách thương hiệu...",
                        },
                      ];
                    } else if (brandsError) {
                      opts = [{ value: "", label: "Lỗi tải thương hiệu" }];
                    } else if (!formData?.Category) {
                      opts = [
                        {
                          value: "",
                          label: "Danh mục trống — không có dữ liệu",
                        },
                      ];
                    } else if (filteredBrandOptions.length === 0) {
                      opts = [
                        { value: "", label: "Không có thương hiệu phù hợp" },
                      ];
                    }
                    return (
                      <div key={item.name}>
                        {Comp?.({
                          item: optItem,
                          formData,
                          onChange: handleInputChange,
                          optionsOverride: opts,
                        })}
                      </div>
                    );
                  }

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
            </section>

            {/* Description */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Mô tả chi tiết
              </h3>
              <div>
                {DESCRIPTION_FIELD.map((item) => {
                  const Comp = fieldComponents[item.fieldType];
                  return (
                    <div key={item.name}>
                      {Comp?.({ item, formData, onChange: handleInputChange })}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Images manager */}
            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-xl text-gray-800">
                  Hình ảnh
                </h3>
                <div
                  className={`text-sm px-2.5 py-1 rounded ${badgeClass(
                    totalImages > MAX_IMAGES ? "warn" : "muted"
                  )}`}
                >
                  {totalImages}/{MAX_IMAGES} ảnh
                </div>
              </div>

              {/* Existing images */}
              {existingImages?.length ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {existingImages.map((img) => (
                    <label
                      key={img.id}
                      className="relative block border border-gray-200 rounded-lg overflow-hidden bg-white"
                      title="Tick để xoá ảnh này khi cập nhật"
                    >
                      <img
                        src={img.url}
                        alt="existing"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-red-500"
                          checked={imagesToRemove.includes(img.id)}
                          onChange={() => toggleRemoveExisting(img)}
                        />
                        <span>Xoá ảnh này</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : null}

              {/* Add new images */}
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg bg-white ${
                  imageError ? "border-red-400" : "border-gray-300"
                }`}
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
                      <span>Thêm ảnh mới</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept={ALLOWED_TYPES.join(",")}
                        multiple
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p>hoặc kéo & thả</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, WEBP tối đa {MAX_SIZE_MB}MB/ảnh (tối đa{" "}
                    {MAX_IMAGES} ảnh)
                  </p>
                  {imageError ? (
                    <p className="mt-2 text-sm text-red-600">{imageError}</p>
                  ) : null}
                </div>
              </div>

              {imagesToAdd.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagesToAdd.map((image, index) => (
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
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        aria-label="Xoá ảnh"
                        title="Xoá ảnh vừa thêm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-70"
              >
                {submitting ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default UpdateListing;
