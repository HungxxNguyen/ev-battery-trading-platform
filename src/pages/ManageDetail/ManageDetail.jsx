// src/pages/ManageDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMapPin, FiHeart } from "react-icons/fi";
import listingService from "../../services/apis/listingApi";

const FALLBACK_IMAGE = "https://placehold.co/1200x800?text=EV+Listing";

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
                : data?.[f.name] ?? "-"}
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

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        let item = null;

        const res = await listingService.getListingDetail(id);
        const payload = res?.data;
        if (payload?.error === 0 && payload?.data) {
          item = payload.data;
        } else if (payload?.data) {
          item = payload.data;
        }

        if (!item && listingFromState) item = listingFromState;
        if (!item) throw new Error("Không tìm thấy tin đăng");

        const images =
          item.listingImages?.map((i) => i.imageUrl).filter(Boolean) ||
          item.images ||
          [];

        const view = {
          ...item,
          images: images.length ? images : [FALLBACK_IMAGE],
          categoryLabel:
            CATEGORY_LABEL[item.category] || item.category || "Khác",
          brandName: item.brand?.name || "",
          sellerName: item.user?.userName || item.user?.email || "",
          sellerEmail: item.user?.email || "",
          sellerPhone: item.user?.phoneNumber || "",
          paymentStatusVi:
            PAYMENT_STATUS_VI[item.paymentStatus] || item.paymentStatus,
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
    { label: "Mô tả chi tiết", name: "description", long: true },
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
                    {detail.title || "Tin đăng"}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Mục <b>{categoryLabel}</b>
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
                  {detail.area || "-"}
                </span>
                {(detail.activatedAt || detail.creationDate) && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span>
                      Cập nhật {formatVNDateTime(detail.activatedAt || detail.creationDate)}
                    </span>
                  </>
                )}
              </div>

              {(detail.activatedAt || detail.expiredAt) && (
                <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">
                  {detail.activatedAt && (
                    <span>
                      Ngày đăng tin: <b>{formatVNDateTime(detail.activatedAt)}</b>
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
            <FieldGrid title="Thông tin chung" fields={commonFields} data={detail} />

            {/* Thông số theo danh mục */}
            <FieldGrid
              title={`Thông số theo danh mục - ${categoryLabel}`}
              fields={specFields}
              data={detail}
            />
          </div>

          {/* RIGHT column - Seller card + actions */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-700">
                <div className="font-semibold">Người bán</div>
                <div className="mt-2 text-gray-600 space-y-1">
                  <div>Tên: <b>{detail.sellerName || "-"}</b></div>
                  <div>Email: <b>{detail.sellerEmail || "-"}</b></div>
                  <div>Điện thoại: <b>{detail.sellerPhone || "-"}</b></div>
                </div>
                <div className="mt-4 text-gray-700">
                  <div className="font-semibold">Gói đang dùng</div>
                  <div className="text-gray-600">
                    {detail.package?.name ? (
                      <>
                        <span>{detail.package?.name}</span>
                        {typeof detail.package?.durationInDays !== "undefined" && (
                          <span className="ml-2 text-sm text-gray-500">({detail.package?.durationInDays} ngày)</span>
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

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold cursor-pointer">
                  Đã bán / Ẩn tin
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-500 text-white font-semibold cursor-pointer"
                  onClick={() => navigate(`/add-listing?mode=edit&id=${detail.id}`)}
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

