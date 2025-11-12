// src/pages/ManageDetail/ManageDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiMapPin,
  FiMail,
  FiPhone,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import listingService from "../../services/apis/listingApi";
import brandService from "../../services/apis/brandApi";
import userService from "../../services/apis/userApi";
// package-related imports removed

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
                : data?.[f.name] === undefined ||
                  data?.[f.name] === null ||
                  data?.[f.name] === ""
                ? "-"
                : data?.[f.name]}
            </span>
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

  // Hàm chuyển ảnh tiếp theo
  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % detail.images.length);
  };

  // Hàm chuyển ảnh trước đó
  const prevImage = () => {
    setActiveImage(
      (prev) => (prev - 1 + detail.images.length) % detail.images.length
    );
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch listing detail + current user concurrently
        const [detailRes, userRes] = await Promise.all([
          listingService.getById(id),
          userService.getCurrentUser(),
        ]);

        let item = null;
        // Robustly parse both GetById and GetDetail shapes
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

        // Package enrichment (fetch only if needed)
        let pkg = null; // package logic removed
        // Try to resolve a package id from multiple possible shapes
        const pkgIdCandidates = [];
        const pkgId = pkgIdCandidates.length ? pkgIdCandidates[0] : null;
        // Package fetch removed

        // Seller enrichment (fallback to current user)
        const currentUser = userRes?.data?.data || {};

        // Prefer images from item; if missing, try picking from navigation state,
        // and finally try fetching detail endpoint to get images.
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

        // If the detail API returns an empty array, but we navigated from
        // ManageListing with populated images in location.state, use those.
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

        // If images/brand are missing, try detail endpoint to enrich data
        if ((!images || images.length === 0 || !item?.brand?.name) && id) {
          const detailAlt = await listingService.getListingDetail(id);
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

            // Enrich brand and other fields if missing from getById
            if (!item?.brand?.name && altItem?.brand?.name) {
              item = { ...item, brand: altItem.brand };
            }
            // Package enrichment removed
          }
        }

        // If brand still missing but we have a brand id, fetch brand by id
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
              // ignore brand fetch error, fallback to raw brandName if any
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
          listingStatus: item.listingStatus || item.status || null,
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-600">Đang tải chi tiết tin...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="px-5 md:px-24 my-10">
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
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

  const categoryLabel =
    detail.categoryLabel || CATEGORY_LABEL[detail.category] || "Khác";

  const commonFields = [
    { label: "Tình trạng", name: "listingStatus" },
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
          { label: "Dung lượng pin (kWh)", name: "batteryCapacity" },
          { label: "Tầm hoạt động (km)", name: "actualOperatingRange" },
          { label: "Thời gian sạc (giờ)", name: "chargingTime" },
          { label: "Màu sắc", name: "color" },
          { label: "Kích thước", name: "size" },
          { label: "Khối lượng (kg)", name: "mass" },
        ];
      case "ElectricMotorbike":
        return [
          { label: "Số km đã đi (Odo)", name: "odo" },
          { label: "Dung lượng pin", name: "batteryCapacity" },
          { label: "Tầm hoạt động (km)", name: "actualOperatingRange" },
          { label: "Thời gian sạc (giờ)", name: "chargingTime" },
          { label: "Màu sắc", name: "color" },
          { label: "Kích thước", name: "size" },
          { label: "Khối lượng (kg)", name: "mass" },
        ];
      case "RemovableBattery":
        return [
          { label: "Dung lượng pin", name: "batteryCapacity" },
          { label: "Khối lượng (kg)", name: "mass" },
          { label: "Kích thước", name: "size" },
          { label: "Màu sắc", name: "color" },
        ];
      default:
        return [
          { label: "Số km đã đi (Odo)", name: "odo" },
          { label: "Dung lượng pin", name: "batteryCapacity" },
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT + CENTER column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery - Đã thêm mũi tên điều hướng */}
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Ảnh trước"
                  >
                    <FiArrowLeft className="text-lg" />
                  </button>
                )}

                {/* Nút mũi tên phải */}
                {detail.images.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
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
                      className={`relative flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
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

            {/* Title + price + location */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    {detail.title || "Tin đăng"}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Mục <b>{categoryLabel}</b>
                  </p>
                </div>
                <button className="hidden" title="Lưu"></button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <p className="text-rose-600 font-bold text-2xl">
                  {currency(detail.price)}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <FiMapPin className="text-gray-400" />
                  {detail.area || "-"}
                </span>
                {(detail.activatedAt || detail.creationDate) && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span>
                      Cập nhật{" "}
                      {formatVNDateTime(
                        detail.activatedAt || detail.creationDate
                      )}
                    </span>
                  </>
                )}
              </div>

              {(detail.activatedAt || detail.expiredAt) && (
                <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">
                  {detail.activatedAt && (
                    <span>
                      Ngày đăng tin:{" "}
                      <b>{formatVNDateTime(detail.activatedAt)}</b>
                    </span>
                  )}
                  {detail.expiredAt && (
                    <span>
                      Ngày hết hạn: <b>{formatVNDateTime(detail.expiredAt)}</b>
                    </span>
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

            {/* Thông số theo danh mục */}
            <FieldGrid
              title={`Thông số theo danh mục - ${categoryLabel}`}
              fields={specFields}
              data={detail}
            />
            {/* Mô tả chi tiết */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Mô tả chi tiết
              </h3>
              {detail?.description ? (
                <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
                  {detail.description}
                </p>
              ) : (
                <p className="mt-3 text-sm text-gray-500">
                  Người bán chưa cập nhật mô tả chi tiết.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT column - Seller card + actions */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-700">
                <div className="mt-3 flex items-center gap-4">
                  <img
                    src={detail.sellerAvatar || FALLBACK_AVATAR}
                    alt={detail.sellerName || ""}
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                  <div className="text-gray-700">
                    <div className="text-base font-semibold text-gray-800">
                      {detail.sellerName || "-"}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 flex flex-col gap-1">
                      <div className="inline-flex items-center gap-2 truncate">
                        <FiMail className="text-gray-400" />
                        <span className="truncate">
                          {detail.sellerEmail || "-"}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <FiPhone className="text-gray-400" />
                        <span>{detail.sellerPhone || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden">
                  <div>
                    Tên: <b>{detail.sellerName || "-"}</b>
                  </div>
                  <div>
                    Email: <b>{detail.sellerEmail || "-"}</b>
                  </div>
                  <div>
                    Điện thoại: <b>{detail.sellerPhone || "-"}</b>
                  </div>
                </div>
                <div className="mt-4 text-gray-700 hidden">
                  <div className="font-semibold">Gói đang dùng</div>
                  <div className="text-gray-600">
                    {detail.package?.name ? (
                      <>
                        <span>{detail.package?.name}</span>
                        {typeof detail.package?.durationInDays !==
                          "undefined" && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({detail.package?.durationInDays} ngày)
                          </span>
                        )}
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                  {detail.paymentStatus && (
                    <div className="mt-1 text-sm text-gray-600">
                      Trạng thái thanh toán: <b>{detail.paymentStatusVi}</b>
                    </div>
                  )}
                </div>
              </div>

              {false && detail.paymentStatus === "AwaitingPayment" && (
                <div className="mt-3">
                  <div
                    listingId={detail.id}
                    variant="primary"
                    className="w-full justify-center"
                  >
                    Thanh toán gói
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ManageDetail;
