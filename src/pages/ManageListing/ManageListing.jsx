// src/pages/ManageListing.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { motion } from "framer-motion";
import {
  FiEdit,
  FiMapPin,
  FiMoreHorizontal,
  FiRefreshCcw,
  FiZap,
  FiEye,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
} from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import listingService from "../../services/apis/listingApi";
import PaymentButton from "./components/PaymentButton";
import { useNotification } from "../../contexts/NotificationContext";

/* ---------------- Tabs (VIỆT HOÁ) ---------------- */
const TABS = [
  { key: "active", label: "ĐANG HIỂN THỊ" },
  { key: "expired", label: "HẾT HẠN" },
  { key: "rejected", label: "BỊ TỪ CHỐI" },
  { key: "payment", label: "CẦN THANH TOÁN" },
  { key: "pending", label: "CHỜ DUYỆT" },
  { key: "sold", label: "ĐÃ BÁN" },
];

/* ---------------- Payment Status Mapping ---------------- */
const PAYMENT_STATUS_MAPPING = {
  Pending: "Đang chờ xử lý",
  Success: "Thành công",
  Failed: "Thất bại",
  Canceled: "Đã hủy",
  Expired: "Hết hạn",
  AwaitingPayment: "Chờ thanh toán",
};

/* ---------------- Reject reason mapping (Vietnamese) ---------------- */
const REJECT_REASON_LABELS = {
  CATEGORY_MISMATCH: "Đăng sai danh mục (ô tô/xe máy/pin rời)",
  INFORMATION_MISSING: "Thiếu thông tin cụ thể (đời xe, số km, tình trạng...)",
  PRICE_UNREALISTIC: "Giá bán không hợp lý (quá thấp/quá cao bất thường)",
  IMAGE_VIOLATION: "Ảnh mờ/không đúng xe/thêm chữ số điện thoại, quảng cáo",
  CONTACT_INVALID: "Số điện thoại/địa chỉ liên hệ không hợp lệ",
  DOCUMENT_INVALID:
    "Thiếu hoặc sai thông tin giấy tờ xe (đăng ký, đăng kiểm...)",
  VEHICLE_CONDITION_FALSE:
    "Mô tả tình trạng xe không đúng thực tế / gây hiểu lầm",
  DUPLICATE_LISTING: "Trùng lặp với một tin đã đăng trước đó",
  POLICY_VIOLATION: "Nội dung vi phạm quy định/điều khoản của sàn",
  SUSPICIOUS_FRAUD: "Có dấu hiệu lừa đảo, yêu cầu thanh toán bất thường",
};

const ITEMS_PER_PAGE = 20;

/* ---------------- Utils ---------------- */
const currency = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const parseVNDate = (dmy) => {
  try {
    const [d, m, y] = (dmy || "").split("/").map((x) => parseInt(x, 10));
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d);
  } catch {
    return null;
  }
};
const formatVNDate = (date) =>
  date
    ? `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`
    : "";

// Format: "HH:mm dd/MM/yyyy"
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

/* ---------------- Mapping API data to frontend format ---------------- */
const mapApiDataToFrontend = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) return [];

  const packageTypeMapping = {
    ElectricCar: "Ô tô điện",
    ElectricMotorbike: "Xe máy điện",
    RemovableBattery: "Pin rời",
    Free: "Miễn phí",
  };

  return apiData
    .map((item) => {
      const normalizedStatus = item.status?.toLowerCase();
      if (normalizedStatus === "hidden") return null;

      let frontendStatus = normalizedStatus;

      // Logic phân loại tab dựa trên PaymentStatus và status
      if (
        item.paymentStatus === "AwaitingPayment" &&
        item.status === "Pending"
      ) {
        frontendStatus = "payment"; // Tab "CẦN THANH TOÁN"
      } else if (item.paymentStatus === "Failed" && item.status === "Pending") {
        // Thanh toán thất bại cũng cần hiển thị ở tab "CẦN THANH TOÁN"
        frontendStatus = "payment";
      } else if (
        item.paymentStatus === "Success" &&
        item.status === "Pending"
      ) {
        frontendStatus = "pending"; // Tab "CHỜ DUYỆT"
      } else {
        const statusMapping = {
          Active: "active",
          Expired: "expired",
          Rejected: "rejected",
          Pending: "pending",
          Sold: "sold",
        };
        frontendStatus = statusMapping[item.status] || normalizedStatus;
      }

      const categoryMapping = {
        ElectricCar: "Ô tô điện",
        ElectricMotorbike: "Xe máy điện",
        RemovableBattery: "Pin rời",
      };

      const frontendItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        status: frontendStatus,
        category: categoryMapping[item.category] || item.category,
        location: item.area || "Đang cập nhật",
        images: item.listingImages?.map((img) => img.imageUrl) || [],
        activatedAt: item.activatedAt,
        expiredAt: item.expiredAt,
        creationDate: item.creationDate,
        // Reject information
        resonReject: item.resonReject || item.reasonReject || null,
        descriptionReject: item.descriptionReject || null,
        postedOn: formatVNDate(new Date()),
        expiresOn: formatVNDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ),
        payment: item.payment || false,
        paymentStatus: item.paymentStatus,
        paymentStatusText:
          PAYMENT_STATUS_MAPPING[item.paymentStatus] || item.paymentStatus,
        package: item.package
          ? {
              name: item.package.name,
              price: item.package.price,
              durationInDays: item.package.durationInDays,
              packageType:
                packageTypeMapping[item.package.packageType] ||
                item.package.packageType,
            }
          : null,
        metrics: {
          rank: Math.floor(Math.random() * 100) + 1,
          categoryLabel: categoryMapping[item.category] || item.category,
          daysToDelete: 28,
        },
      };

      return frontendItem;
    })
    .filter(Boolean);
};

/* ---------------- Click-outside ---------------- */
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/* ---------------- Dropdown menu ---------------- */
const OptionMenu = ({ onSold, onDelete }) => (
  <div className="mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
    <div className="h-px bg-gray-200" />
    <button
      onClick={onSold}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer"
    >
      <span className="text-lg">
        <FiCheckCircle />
      </span>
      <span>Đã bán</span>
    </button>
    <div className="h-px bg-gray-200" />
    <button
      onClick={onDelete}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
    >
      <span className="text-lg">
        <FaRegTrashAlt />
      </span>
      <span>Xoá tin</span>
    </button>
  </div>
);

/* ---------------- Modal "Đã bán" ---------------- */
const SoldPostModal = ({ open, title, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-3 mt-16 md:mt-0 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 rounded-t-lg bg-gradient-to-r from-gray-900 to-blue-900">
          <div className="font-semibold text-white truncate">
            Xác nhận đã bán
          </div>
          <button
            className="px-2 text-white text-lg leading-none cursor-pointer"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiCheckCircle className="text-blue-600 text-xl" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Xác nhận đã bán</div>
              <div className="text-sm text-gray-600">Tin: {title}</div>
            </div>
          </div>

          <p className="text-gray-700 mb-2">
            Bạn có chắc chắn muốn đánh dấu tin đăng này là{" "}
            <strong className="text-green-600">"ĐÃ BÁN"</strong>?
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Sau khi xác nhận, tin đăng sẽ được chuyển sang trạng thái đã bán và
            không còn hiển thị trên sàn giao dịch.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium cursor-pointer hover:bg-gray-50"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 rounded-md font-semibold text-white bg-[#1c76d0] hover:bg-[#0000FF] cursor-pointer"
              onClick={onConfirm}
            >
              Xác nhận đã bán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Modal "Xoá tin" ---------------- */
const DeletePostModal = ({ open, listing, loading, onClose, onConfirm }) => {
  if (!open || !listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={loading ? undefined : onClose}
      />

      {/* Card */}
      <div className="relative mx-3 mt-16 md:mt-0 w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 via-red-900 to-red-700">
          <div className="flex items-center gap-2 text-white">
            <FiAlertTriangle className="text-lg" />
            <span className="font-semibold">Xoá tin đăng</span>
          </div>
          <button
            className="px-2 text-white text-xl leading-none cursor-pointer disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FaRegTrashAlt className="text-lg" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Bạn chắc chắn muốn xoá tin này?
              </p>
              <p
                className="text-sm text-gray-600 mt-1 truncate"
                title={listing.title}
              >
                {listing.title}
              </p>
              {typeof listing.price !== "undefined" && (
                <p className="mt-1 text-xs text-gray-500">
                  Giá đăng:{" "}
                  <span className="font-medium text-gray-700">
                    {currency(listing.price)}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700 space-y-1">
            <p>
              • Tin đăng sẽ bị xoá{" "}
              <span className="font-semibold">vĩnh viễn</span> khỏi hệ thống.
            </p>
            <p>• Người mua sẽ không thể xem lại tin này trên sàn.</p>
            <p>
              • Hành động này{" "}
              <span className="font-semibold">không thể hoàn tác</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-red-600 hover:bg-red-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              )}
              <span>Xoá tin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- ListingItem ---------------- */
const ListingItem = ({
  item,
  onNavigate,
  onEdit,
  onDelete,
  onOpenSoldModal,
  menuForId,
  setMenuForId,
  onPayAgain,
}) => {
  const galleryImage = item.images?.[0];
  const isActive = item.status === "active";
  const canViewDetail = isActive; // hiện tại vẫn chỉ ACTIVE mới cho xem chi tiết nếu bạn muốn giữ logic này
  const isSold = item.status === "sold";

  const menuRef = useRef(null);
  useOnClickOutside(menuRef, () => {
    if (menuForId === item.id) setMenuForId(null);
  });

  const btnBase =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer";
  const btnOutline = "border border-gray-300 text-gray-700 hover:bg-gray-50";
  const btnPrimary = "bg-green-600 hover:bg-green-500 text-white font-semibold";
  const btnSecondary = "bg-blue-600 hover:bg-blue-500 text-white font-semibold";

  const renderActions = () => {
    switch (item.status) {
      case "active":
        return (
          <div className="mt-4 flex flex-wrap items-center gap-3 relative">
            <button
              onClick={() => onNavigate(item)}
              className={`${btnBase} ${btnSecondary}`}
            >
              <FiEye /> Xem chi tiết
            </button>

            <button
              onClick={() => onEdit(item.id)}
              className={`${btnBase} ${btnOutline}`}
            >
              <FiEdit /> Sửa tin
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  setMenuForId((v) => (v === item.id ? null : item.id));
                }}
                className={`${btnBase} ${btnOutline}`}
                aria-haspopup="menu"
                aria-expanded={menuForId === item.id}
              >
                <FiMoreHorizontal /> Tuỳ chọn
              </button>

              {menuForId === item.id && (
                <div className="absolute z-20 left-0 md:left-auto md:right-0">
                  <OptionMenu
                    onSold={() => {
                      setMenuForId(null);
                      onOpenSoldModal(item);
                    }}
                    onDelete={() => {
                      setMenuForId(null);
                      onDelete(item);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "rejected":
        return (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(item)}
              className={`${btnBase} ${btnSecondary}`}
            >
              <FiEye /> Xem tin
            </button>

            <button
              onClick={() => onEdit(item.id)}
              className={`${btnBase} ${btnOutline}`}
            >
              <FiEdit /> Sửa tin & gửi lại
            </button>
          </div>
        );

      case "expired":
        return (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(item)}
              className={`${btnBase} ${btnSecondary}`}
            >
              <FiEye /> Xem chi tiết
            </button>

            {item.package?.packageType !== "Miễn phí" && (
              <button
                onClick={() => onPayAgain(item)}
                className={`${btnBase} ${btnPrimary}`}
              >
                Gia hạn tin
              </button>
            )}

            {/* Nút xoá tin cho tab HẾT HẠN */}
            <button
              onClick={() => onDelete(item)}
              className={`${btnBase} ${btnOutline} text-red-600 hover:bg-red-50 hover:border-red-300`}
            >
              <FaRegTrashAlt /> Xóa tin
            </button>
          </div>
        );

      case "payment":
        return (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(item)}
              className={`${btnBase} ${btnSecondary}`}
            >
              <FiEye /> Xem chi tiết
            </button>

            <PaymentButton
              listingId={item.id}
              className={`${btnBase} ${btnPrimary}`}
              onSuccess={(response) => {
                console.log("Payment created successfully:", response);
              }}
              onError={(error) => {
                console.error("Payment creation failed:", error);
              }}
            >
              Thanh toán
            </PaymentButton>
          </div>
        );

      case "pending":
        return (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(item)}
              className={`${btnBase} ${btnSecondary}`}
            >
              <FiEye /> Xem chi tiết
            </button>
          </div>
        );

      case "sold":
        return (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(item)}
              className={`${btnBase} ${btnSecondary}`}
            >
              <FiEye /> Xem chi tiết
            </button>

            <button
              onClick={() => onDelete(item)}
              className={`${btnBase} ${btnOutline} text-red-600 hover:bg-red-50 hover:border-red-300`}
            >
              <FaRegTrashAlt /> Xóa tin
            </button>
          </div>
        );

      default:
        return (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(item)}
              className={`${btnBase} ${btnSecondary}`}
            >
              <FiEye /> Xem chi tiết
            </button>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
        {/* LEFT: Image - CẬP NHẬT PHẦN NÀY */}
        <div className="flex md:flex-col items-start gap-3 md:w-[200px]">
          <div className="w-28 h-24 md:w-full md:h-[140px] flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 relative">
            {galleryImage ? (
              <>
                <img
                  src={galleryImage}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay cho tin đã bán */}
                {isSold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white font-bold text-lg md:text-xl mb-1">
                        ĐÃ BÁN
                      </div>
                      <div className="text-white/90 text-xs md:text-sm">
                        Tin đã kết thúc
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                Không có ảnh
                {/* Overlay cho tin đã bán khi không có ảnh */}
                {isSold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="text-white font-bold text-lg md:text-xl mb-1">
                        ĐÃ BÁN
                      </div>
                      <div className="text-white/90 text-xs md:text-sm">
                        Tin đã kết thúc
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: Content - GIỮ NGUYÊN */}
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">
              {item.title}
            </h3>

            <p className="text-red-600 font-bold text-lg select-none">
              {currency(item.price)}
            </p>

            {/* TRANG & MỤC (dưới giá) */}
            <div className="text-xs md:text-sm text-gray-600">
              <span>
                Mục <b>{item.category || "Khác"}</b>
              </span>

              {/* Thêm trạng thái đã bán vào thông tin */}
              {isSold ? (
                <span className="ml-3">
                  | Trạng thái: <b className="text-gray-600">Đã bán</b>
                </span>
              ) : item.package?.packageType === "Miễn phí" ? (
                <span className="ml-3">
                  | Trạng thái thanh toán:{" "}
                  <b className="text-green-600">Dùng gói miễn phí</b>
                </span>
              ) : item.paymentStatus ? (
                <span className="ml-3">
                  | Trạng thái thanh toán: <b>{item.paymentStatusText}</b>
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <FiMapPin className="text-gray-400" />
              <span>{item.location}</span>
            </div>

            {/* BLOCK LÝ DO BỊ TỪ CHỐI - UI MỚI */}
            {item.status === "rejected" && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <FiAlertTriangle className="text-lg" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-sm font-semibold text-red-800">
                      Tin đăng đã bị từ chối bởi Quản trị viên
                    </div>
                    <p className="text-xs sm:text-sm text-red-700">
                      Vui lòng chỉnh sửa lại nội dung tin theo góp ý bên dưới,
                      sau đó nhấn{" "}
                      <span className="font-semibold">
                        "Sửa tin &amp; gửi lại"
                      </span>{" "}
                      để được duyệt lại.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-red-800">
                      <span className="font-medium">Lý do chính:</span>
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold">
                        {REJECT_REASON_LABELS[item.resonReject] ||
                          item.resonReject ||
                          "Không rõ lý do"}
                      </span>
                    </div>

                    {item.descriptionReject && (
                      <div className="mt-1 flex items-start gap-2 text-sm text-red-800">
                        <FiInfo className="mt-0.5 flex-shrink-0" />
                        <span className="italic">{item.descriptionReject}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ngày đăng & hết hạn */}
            {item.status === "payment" || item.status === "pending" ? (
              <div className="flex flex-wrap gap-4 text-xs md:text-sm text-gray-500 mt-2">
                <span>
                  Ngày đăng tin:{" "}
                  <strong className="font-medium text-gray-700">
                    {item.activatedAt
                      ? formatVNDateTime(new Date(item.activatedAt))
                      : item.creationDate
                      ? formatVNDateTime(new Date(item.creationDate))
                      : item.postedOn}
                  </strong>
                </span>
              </div>
            ) : (
              item.status !== "rejected" && (
                <div className="flex flex-wrap gap-4 text-xs md:text-sm text-gray-500 mt-2">
                  <span>
                    Ngày đăng tin:{" "}
                    <strong className="font-medium text-gray-700">
                      {item.activatedAt
                        ? formatVNDateTime(new Date(item.activatedAt))
                        : item.creationDate
                        ? formatVNDateTime(new Date(item.creationDate))
                        : item.postedOn}
                    </strong>
                  </span>
                  {!isSold && ( // Ẩn ngày hết hạn nếu đã bán
                    <span>
                      Ngày hết hạn:{" "}
                      <strong className="font-medium text-gray-700">
                        {item.expiredAt
                          ? formatVNDateTime(new Date(item.expiredAt))
                          : item.expiresOn}
                      </strong>
                    </span>
                  )}
                  {isSold && ( // Hiển thị ngày bán nếu đã bán
                    <span>
                      Ngày bán:{" "}
                      <strong className="font-medium text-green-600">
                        {formatVNDate(new Date())}
                      </strong>
                    </span>
                  )}
                </div>
              )
            )}
          </div>

          {/* Actions - HIỂN THỊ THEO TRẠNG THÁI */}
          {renderActions()}
        </div>

        {/* RIGHT: Package Info */}
        {item.package &&
          !isSold && ( // Ẩn thông tin gói nếu đã bán
            <div className="md:w-[220px] flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiZap className="text-blue-600 text-lg" />
                  <div className="font-semibold text-blue-800 text-sm">
                    Gói đăng tin
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Tên gói:</span>
                    <span className="font-semibold text-blue-900 text-right">
                      {item.package.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Phân loại:</span>
                    <span className="font-semibold text-blue-900">
                      {item.package.packageType}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Thời hạn:</span>
                    <span className="font-semibold text-blue-900">
                      {item.package.durationInDays} ngày
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Chi phí:</span>
                    <span className="font-bold text-blue-900">
                      {currency(item.package.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */
const ManageListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlTab = searchParams.get("tab") || "active";
  const [activeTab, setActiveTab] = useState(urlTab);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!TABS.some((t) => t.key === urlTab)) {
      setSearchParams({ tab: "active" }, { replace: true });
      setActiveTab("active");
    } else {
      setActiveTab(urlTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab]);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [menuForId, setMenuForId] = useState(null);
  const [soldFor, setSoldFor] = useState(null);
  const [deleteFor, setDeleteFor] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await listingService.getMyListings(1, 1000);

        if (response.data.error === 0) {
          const mappedData = mapApiDataToFrontend(response.data.data);
          setListings(mappedData);
        } else {
          setError(
            response.message || "Có lỗi xảy ra khi tải danh sách tin đăng"
          );
        }
      } catch (err) {
        setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filtered = useMemo(
    () => (listings || []).filter((it) => it.status === activeTab),
    [listings, activeTab]
  );

  const onEdit = (id) => navigate(`/update-listing/${id}${location.search}`);

  const onNavigate = (listing) => {
    navigate(`/manage-listing/${listing.id}${location.search}`, {
      state: { listing },
    });
  };

  const getCountForTab = (key) =>
    (listings || []).filter((x) => x.status === key).length;

  const onPayAgain = async (item) => {
    try {
      if (!item?.id) return;
      const response = await listingService.getRepaymentUrl(item.id);
      if (response?.data?.error === 0 && response?.data?.data) {
        const paymentUrl = response.data.data;
        window.location.href = paymentUrl;
      } else {
        const msg =
          response?.data?.message ||
          response?.error ||
          "Không thể tạo liên kết thanh toán";
        alert(msg);
      }
    } catch (e) {
      console.error("Repayment error:", e);
      alert(e?.message || "Có lỗi xảy ra khi tạo liên kết thanh toán.");
    }
  };

  // Hàm xử lý xác nhận đã bán
  const handleConfirmSold = async (item) => {
    try {
      if (!item?.id) return;

      // Gọi API xác nhận đã bán
      const response = await listingService.confirmSoldListing(item.id);

      if (response?.data?.error === 0) {
        // Cập nhật trạng thái trong local state
        setListings((prev) =>
          (prev || []).map((x) =>
            x.id === item.id ? { ...x, status: "sold" } : x
          )
        );
        showNotification(
          `Tin đăng về "${item.title}" đã được đánh dấu là đã bán.`,
          "success"
        );
      } else {
        const errorMsg =
          response?.data?.message || "Có lỗi xảy ra khi xác nhận đã bán";
        alert(errorMsg);
      }
    } catch (err) {
      console.error("Error confirming sold listing:", err);
      alert("Không thể kết nối đến server. Vui lòng thử lại sau.");
    } finally {
      setSoldFor(null);
    }
  };

  // Mở modal xoá
  const requestDelete = (listing) => {
    setDeleteFor(listing);
  };

  // Xác nhận xoá trong modal
  const handleDeleteListing = async () => {
    if (!deleteFor?.id) return;

    try {
      setDeleting(true);

      const response = await listingService.deleteListing(deleteFor.id);

      if (response?.data?.error === 0) {
        setListings((prev) =>
          (prev || []).filter((x) => x.id !== deleteFor.id)
        );
        showNotification(`Xoá tin "${deleteFor.title}" thành công.`, "success");
        setDeleteFor(null);
      } else {
        const msg =
          response?.data?.message ||
          response?.error ||
          "Không thể xoá tin đăng. Vui lòng thử lại.";
        showNotification(msg, "error");
      }
    } catch (err) {
      console.error("Error deleting listing:", err);
      showNotification(
        "Không thể kết nối đến server. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const setTab = (key) => setSearchParams({ tab: key });

  const activeLabel = TABS.find((t) => t.key === activeTab)?.label || "";

  if (loading) {
    return (
      <MainLayout>
        <div className="px-5 md:px-24 my-10 mb-20 flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách tin đăng...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="px-5 md:px-24 my-10 mb-20">
          <div className="rounded-xl border border-red-200 p-8 bg-red-50 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-md font-semibold transition cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        className="px-5 md:px-24 my-10 mb-20"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
          <h2 className="font-bold text-2xl sm:text-4xl text-gray-800">
            Quản lý tin đăng
          </h2>
          <Link
            to={`/add-listing${location.search}`}
            className="w-full sm:w-auto"
          >
            <button className="w-full sm:w-auto px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition cursor-pointer">
              + Đăng tin
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="w-full overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max border-b border-gray-200 pb-2">
            {TABS.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="relative pb-2 font-bold whitespace-nowrap focus:outline-none cursor-pointer"
                >
                  <span
                    className={isActive ? "text-blue-600" : "text-gray-700"}
                  >
                    {t.label} ( {getCountForTab(t.key)} )
                  </span>
                  {isActive && (
                    <span className="absolute left-0 -bottom-[3px] h-1 w-full bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List / Empty state */}
        {filtered.length === 0 ? (
          <div className="mt-10 rounded-xl border border-gray-200 p-8 bg-white text-center">
            <p className="text-gray-600">
              Bạn chưa có tin ở mục <b>{activeLabel}</b>.
            </p>
            <div className="mt-4">
              <Link to={`/add-listing${location.search}`}>
                <button className="px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition cursor-pointer">
                  + Đăng tin ngay
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            {filtered.map((item) => (
              <ListingItem
                key={item.id}
                item={item}
                onNavigate={onNavigate}
                onEdit={onEdit}
                onDelete={requestDelete}
                onOpenSoldModal={setSoldFor}
                menuForId={menuForId}
                setMenuForId={setMenuForId}
                onPayAgain={onPayAgain}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal Xác nhận đã bán */}
      <SoldPostModal
        open={!!soldFor}
        title={soldFor?.title || ""}
        onClose={() => setSoldFor(null)}
        onConfirm={() => handleConfirmSold(soldFor)}
      />

      {/* Modal Xoá tin */}
      <DeletePostModal
        open={!!deleteFor}
        listing={deleteFor}
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteFor(null);
        }}
        onConfirm={handleDeleteListing}
      />
    </MainLayout>
  );
};

export default ManageListing;
