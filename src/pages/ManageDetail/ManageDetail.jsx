// src/pages/ManageDetail/ManageDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiMail,
  FiPhone,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import listingService from "../../services/apis/listingApi";
import brandService from "../../services/apis/brandApi";
import userService from "../../services/apis/userApi";

const FALLBACK_IMAGE = "https://placehold.co/1200x800?text=EV+Listing";
const FALLBACK_AVATAR = "https://placehold.co/160x160?text=User";

const currency = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const formatVNDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${time} ${day}/${month}/${year}`;
};

const CATEGORY_LABEL = {
  ElectricCar: "Ô tô điện",
  ElectricMotorbike: "Xe máy điện",
  RemovableBattery: "Pin rời",
};

const PAYMENT_STATUS_VI = {
  Pending: "Đang chờ xử lý",
  Success: "Thành công",
  Failed: "Thất bại",
  Canceled: "Đã hủy",
  Expired: "Hết hạn",
  AwaitingPayment: "Chờ thanh toán",
};

// Thêm object mapping cho tình trạng sản phẩm
const PRODUCT_CONDITION_VI = {
  New: "Mới",
  Used: "Đã sử dụng",
};

// Hoặc nếu bạn muốn kết hợp với PAYMENT_STATUS_VI có sẵn:
const LISTING_STATUS_VI = {
  New: "Mới",
  Used: "Đã sử dụng",
};

const FieldGrid = ({ title, fields, data }) => {
  if (!fields?.length) return null;

  const getDisplayValue = (field, value) => {
    if (value === undefined || value === null || value === "") return "-";

    // Xử lý dịch cho trường listingStatus
    if (field.name === "listingStatus") {
      return LISTING_STATUS_VI[value] || value;
    }

    // Xử lý giá tiền
    if (field.name === "price") {
      return currency(value ?? 0);
    }

    return value;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((f) => (
          <div
            key={f.name}
            className={`${f.long ? "md:col-span-2" : ""} group`}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {f.label}
              </span>
              <span className="text-base font-semibold text-gray-800">
                {getDisplayValue(f, data?.[f.name])}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const listingFromState = location.state?.listing;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  // Chuyển ảnh bằng mũi tên
  const nextImage = () => {
    setActiveImage((prev) =>
      detail?.images?.length ? (prev + 1) % detail.images.length : prev
    );
  };

  const prevImage = () => {
    setActiveImage((prev) =>
      detail?.images?.length
        ? (prev - 1 + detail.images.length) % detail.images.length
        : prev
    );
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const [detailRes, userRes] = await Promise.all([
          listingService.getById(id),
          userService.getCurrentUser(),
        ]);

        let item = null;
        const payload = detailRes?.data;
        if (payload?.error === 0 && payload?.data) {
          item = payload.data;
        } else if (
          payload?.data &&
          typeof payload.data === "object" &&
          !Array.isArray(payload.data)
        ) {
          item = payload.data;
        } else if (payload && typeof payload === "object") {
          item = payload;
        }

        if (!item && listingFromState) item = listingFromState;
        if (!item) throw new Error("Không tìm thấy tin đăng");

        const currentUser = userRes?.data?.data || {};

        let images =
          (Array.isArray(item?.listingImages)
            ? item.listingImages
                .map((i) =>
                  typeof i === "string" ? i : i?.imageUrl || i?.url || ""
                )
                .filter(Boolean)
            : null) ||
          item?.images ||
          [];

        if ((!images || images.length === 0) && listingFromState) {
          const stateImages = Array.isArray(listingFromState.listingImages)
            ? listingFromState.listingImages
                .map((i) =>
                  typeof i === "string" ? i : i?.imageUrl || i?.url || ""
                )
                .filter(Boolean)
            : listingFromState.images || [];
          if (stateImages?.length) {
            images = stateImages;
          }
        }

        if ((!images || images.length === 0 || !item?.brand?.name) && id) {
          const detailAlt = await listingService.getById(id);
          const altPayload = detailAlt?.data;
          const altItem =
            (altPayload?.data &&
            typeof altPayload.data === "object" &&
            !Array.isArray(altPayload.data)
              ? altPayload.data
              : Array.isArray(altPayload)
              ? altPayload[0] ?? null
              : altPayload && typeof altPayload === "object"
              ? altPayload
              : null) || null;
          if (altItem) {
            const altImages = Array.isArray(altItem.listingImages)
              ? altItem.listingImages
                  .map((i) =>
                    typeof i === "string" ? i : i?.imageUrl || i?.url || ""
                  )
                  .filter(Boolean)
              : altItem.images || [];
            images = altImages && altImages.length ? altImages : images;

            if (!item?.brand?.name && altItem?.brand?.name) {
              item = { ...item, brand: altItem.brand };
            }
          }
        }

        if (!item?.brand?.name) {
          const possibleBrandId =
            item?.brandId ??
            item?.BrandId ??
            item?.brandID ??
            item?.brand?.id ??
            item?.brand?.Id ??
            item?.brand?.ID ??
            null;
          if (possibleBrandId) {
            try {
              const brRes = await brandService.getBrandById(possibleBrandId);
              const brPayload = brRes?.data;
              const brandObj =
                (brPayload?.data && typeof brPayload.data === "object"
                  ? brPayload.data
                  : brPayload && typeof brPayload === "object"
                  ? brPayload
                  : null) || null;
              if (brandObj) {
                const brId =
                  brandObj.id ?? brandObj.Id ?? brandObj.ID ?? possibleBrandId;
                const brName =
                  brandObj.name ?? brandObj.Name ?? brandObj.brandName ?? null;
                item = {
                  ...item,
                  brand: {
                    id: brId,
                    name: brName,
                    ...brandObj,
                  },
                };
              }
            } catch (e) {
              // ignore
            }
          }
        }

        const view = {
          ...item,
          images: images.length ? images : [FALLBACK_IMAGE],
          categoryLabel:
            CATEGORY_LABEL[item.category] || item.category || "Khác",
          brandName:
            item.brand?.name ?? item.brandName ?? item.BrandName ?? null,
          listingStatus: item.listingStatus || null,
          sellerName:
            item.user?.userName ||
            item.user?.email ||
            currentUser?.userName ||
            "",
          sellerEmail: item.user?.email || currentUser?.email || "",
          sellerPhone: item.user?.phoneNumber || currentUser?.phoneNumber || "",
          sellerAvatar:
            item.user?.thumbnail || currentUser?.thumbnail || FALLBACK_AVATAR,
        };

        setDetail(view);
        setActiveImage(0);
      } catch (e) {
        setError(e?.message || "Có lỗi khi tải chi tiết tin");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="px-5 md:px-24 my-10 mb-20 flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Đang tải chi tiết tin...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="px-5 md:px-24 my-10">
          <div className="bg-white border-2 border-red-200 rounded-2xl p-8 text-center space-y-4 shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600">{error}</h2>
            <Link
              to="/manage-listing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
            >
              <FiArrowLeft />
              Quay về trang quản lý
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!detail) {
    return (
      <MainLayout>
        <div className="px-5 md:px-24 my-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-4 shadow-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Không tìm thấy tin đăng
            </h2>
            <Link
              to="/manage-listing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
            >
              <FiArrowLeft />
              Quay về trang quản lý
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const categoryLabel =
    detail.categoryLabel || CATEGORY_LABEL[detail.category] || "Khác";

  const commonFields = [
    { label: "Hãng", name: "brandName" },
    { label: "Model", name: "model" },
    { label: "Năm sản xuất", name: "yearOfManufacture" },
    { label: "Khu vực", name: "area" },
  ];

  const getSpecFields = (cat) => {
    switch (cat) {
      case "ElectricCar":
        return [
          { label: "Số km đã đi (Odo)", name: "odo" },
          { label: "Tình trạng pin còn lại (%)", name: "batteryCapacity" },
          { label: "Tầm hoạt động (km)", name: "actualOperatingRange" },
          { label: "Thời gian sạc (giờ)", name: "chargingTime" },
          { label: "Màu sắc", name: "color" },
          { label: "Kích thước", name: "size" },
          { label: "Khối lượng (kg)", name: "mass" },
        ];
      case "ElectricMotorbike":
        return [
          { label: "Số km đã đi (Odo)", name: "odo" },
          { label: "Tình trạng pin còn lại (%)", name: "batteryCapacity" },
          { label: "Tầm hoạt động (km)", name: "actualOperatingRange" },
          { label: "Thời gian sạc (giờ)", name: "chargingTime" },
          { label: "Màu sắc", name: "color" },
          { label: "Kích thước", name: "size" },
          { label: "Khối lượng (kg)", name: "mass" },
        ];
      case "RemovableBattery":
        return [
          { label: "Tình trạng pin còn lại (%)", name: "batteryCapacity" },
          { label: "Khối lượng (kg)", name: "mass" },
          { label: "Kích thước", name: "size" },
          { label: "Màu sắc", name: "color" },
        ];
      default:
        return [
          { label: "Số km đã đi (Odo)", name: "odo" },
          { label: "Tình trạng pin còn lại (%)", name: "batteryCapacity" },
          { label: "Tầm hoạt động (km)", name: "actualOperatingRange" },
          { label: "Thời gian sạc (giờ)", name: "chargingTime" },
        ];
    }
  };

  const specFields = getSpecFields(detail.category);

  return (
    <MainLayout>
      <motion.div
        className="px-5 md:px-24 my-6 md:my-10 pb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top bar với breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              title="Quay lại"
            >
              <FiArrowLeft className="text-lg" />
              <span>Quay lại</span>
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span>Quản lý tin đăng</span>
              <span>/</span>
              <span className="text-gray-800 font-medium">
                Chi tiết tin đăng
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT + CENTER column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery - Cải thiện thiết kế */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={detail.images[activeImage]}
                  alt={`image-${activeImage}`}
                  className="w-full h-full object-contain"
                />

                {/* Nút mũi tên trái */}
                {detail.images.length > 1 && (
                  <button
                    onClick={prevImage}
                    className="cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Ảnh trước"
                  >
                    <FiArrowLeft className="text-lg" />
                  </button>
                )}

                {/* Nút mũi tên phải */}
                {detail.images.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Ảnh tiếp theo"
                  >
                    <FiArrowRight className="text-lg" />
                  </button>
                )}
                {/* Indicator số ảnh */}
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {activeImage + 1} / {detail.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="p-4 bg-gray-50">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {detail.images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      onClick={() => setActiveImage(idx)}
                      className={`relative flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === idx
                          ? "border-green-500 ring-2 ring-green-200 scale-105"
                          : "border-gray-200 hover:border-gray-400 hover:scale-105"
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
            </div>

            {/* Title + Price Card - Thiết kế mới */}
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {detail.title || "Tin đăng"}
                  </h1>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Giá bán
                  </span>
                  <p className="text-rose-600 font-bold text-3xl">
                    {currency(detail.price)}
                  </p>
                </div>
              </div>

              {(detail.activatedAt || detail.expiredAt) && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {detail.activatedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiClock className="text-green-600" />
                      <span>
                        Ngày đăng tin:{" "}
                        <strong className="text-gray-800">
                          {formatVNDateTime(detail.activatedAt)}
                        </strong>
                      </span>
                    </div>
                  )}
                  {detail.expiredAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="text-orange-600" />
                      <span>
                        Hết hạn tin đăng:{" "}
                        <strong className="text-gray-800">
                          {formatVNDateTime(detail.expiredAt)}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thông tin chung */}
            <FieldGrid
              title="Thông tin chung"
              fields={commonFields}
              data={detail}
            />

            {/* Thông số kỹ thuật */}
            <FieldGrid
              title={`Thông số kỹ thuật - ${categoryLabel}`}
              fields={specFields}
              data={detail}
            />

            {/* Mô tả chi tiết */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                Mô tả chi tiết
              </h3>
              {detail?.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {detail.description}
                </p>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-400 italic">
                    Người bán chưa cập nhật mô tả chi tiết
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT column - Seller card - 1/3 width, sticky */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Seller Info Card */}
              <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                  Thông tin người bán
                </h3>

                <div className="flex items-start gap-4 mb-5">
                  <img
                    src={detail.sellerAvatar || FALLBACK_AVATAR}
                    alt={detail.sellerName || ""}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-gray-900 truncate">
                      {detail.sellerName || "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Người đăng tin
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <FiMail className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Email</div>
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {detail.sellerEmail || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <FiPhone className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        Điện thoại
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {detail.sellerPhone || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                  Trạng thái tin
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Tình trạng sản phẩm
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {PRODUCT_CONDITION_VI[detail.listingStatus] ||
                        detail.listingStatus ||
                        "Đang hoạt động"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Danh mục</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {categoryLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ManageDetail;
