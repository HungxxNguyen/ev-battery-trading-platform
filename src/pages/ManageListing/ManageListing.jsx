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
  FiEyeOff,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import listingService from "../../services/apis/listingApi";
import PaymentButton from "./components/PaymentButton";

/* ---------------- Tabs (VIỆT HOÁ) ---------------- */
const TABS = [
  { key: "active", label: "ĐANG HIỂN THỊ" },
  { key: "expired", label: "HẾT HẠN" },
  { key: "rejected", label: "BỊ TỪ CHỐI" },
  { key: "payment", label: "CẦN THANH TOÁN" },
  { key: "pending", label: "CHỜ DUYỆT" },
  { key: "hidden", label: "ĐÃ ẨN" },
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

/* ---------------- Reject reason mapping ---------------- */
const REJECT_REASON_MAPPING = {
  CATEGORY_MISMATCH: "Danh mục không khớp",
  INSUFFICIENT_INFO: "Thiếu thông tin quan trọng",
  VIOLATES_POLICY: "Vi phạm quy định đăng tin",
  DUPLICATE_LISTING: "Tin đăng trùng lặp",
  INAPPROPRIATE_CONTENT: "Nội dung không phù hợp",
  PRICING_ISSUE: "Giá bán không hợp lý",
  INVALID_IMAGES: "Hình ảnh không hợp lệ",
  OTHER: "Lý do khác",
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
  };

  return apiData.map((item) => {
    let frontendStatus = item.status?.toLowerCase();

    // Logic phân loại tab dựa trên PaymentStatus và status
    if (item.paymentStatus === "AwaitingPayment" && item.status === "Pending") {
      frontendStatus = "payment"; // Tab "CẦN THANH TOÁN"
    } else if (item.paymentStatus === "Failed" && item.status === "Pending") {
      // Thanh toán thất bại cũng cần hiển thị ở tab "CẦN THANH TOÁN"
      frontendStatus = "payment";
    } else if (item.paymentStatus === "Success" && item.status === "Pending") {
      frontendStatus = "pending"; // Tab "CHỜ DUYỆT"
    } else {
      const statusMapping = {
        Active: "active",
        Expired: "expired",
        Rejected: "rejected",
        Pending: "pending",
        Hidden: "hidden",
      };
      frontendStatus = statusMapping[item.status] || item.status?.toLowerCase();
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
      expiresOn: formatVNDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
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
  });
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
const OptionMenu = ({ onShare, onHide, onDelete }) => (
  <div className="mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
    <button
      onClick={onShare}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
    >
      <span className="text-lg">↪</span>
      <span>Chia sẻ</span>
    </button>
    <div className="h-px bg-gray-200" />
    <button
      onClick={onHide}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
    >
      <span className="text-lg">
        <FiEyeOff />
      </span>
      <span>Đã bán / Ẩn tin</span>
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

/* ---------------- Modal "Ẩn tin" ---------------- */
const HidePostModal = ({ open, title, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const reasons = [
    "Đã bán qua nền tảng",
    "Đã bán qua kênh khác",
    "Tôi bị làm phiền bởi môi giới/dịch vụ đăng tin",
    "Không muốn bán nữa",
    "Khác",
  ];
  useEffect(() => {
    if (!open) setReason("");
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-3 mt-16 md:mt-0 w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 rounded-t-lg bg-gradient-to-r from-gray-900 to-blue-900">
          <div className="font-semibold text-white truncate">
            Ẩn tin {title}
          </div>
          <button
            className="px-2 text-white text-lg leading-none cursor-pointer"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-5">
          <div className="font-semibold mb-3">Vui lòng chọn lý do ẩn tin</div>
          <div className="space-y-3">
            {reasons.map((r) => (
              <label
                key={r}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="hide_reason"
                  className="w-4 h-4 text-blue-600 border-gray-300"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                />
                <span className="text-gray-700">{r}</span>
              </label>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium cursor-pointer hover:bg-gray-50"
              onClick={onClose}
            >
              Quay lại
            </button>
            <button
              className={`px-4 py-2 rounded-md font-semibold text-white ${
                reason
                  ? "bg-gray-700 hover:bg-gray-800 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!reason}
              onClick={() => onConfirm(reason)}
            >
              Ẩn tin
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
  onOpenHideModal,
  menuForId,
  setMenuForId,
  onPayAgain,
  onUnhide,
}) => {
  const galleryImage = item.images?.[0];
  const isActive = item.status === "active";
  const canViewDetail = isActive; // hiện tại vẫn chỉ ACTIVE mới cho xem chi tiết nếu bạn muốn giữ logic này

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
                    onShare={() => {
                      setMenuForId(null);
                      alert("Chia sẻ: mở modal chia sẻ ở đây.");
                    }}
                    onHide={() => {
                      setMenuForId(null);
                      onOpenHideModal(item);
                    }}
                    onDelete={() => {
                      setMenuForId(null);
                      onDelete(item.id);
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

            <button
              onClick={() => onPayAgain(item)}
              className={`${btnBase} ${btnPrimary}`}
            >
              <FiRefreshCcw /> Gia hạn tin
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

      case "hidden":
        return (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(item)}
              className={`${btnBase} ${btnSecondary}`}
            >
              <FiEye /> Xem chi tiết
            </button>

            <button
              onClick={() => onUnhide?.(item)}
              className={`${btnBase} ${btnPrimary}`}
            >
              <FiEye /> Hiện tin lại
            </button>

            <button
              onClick={() => onDelete(item.id)}
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
        {/* LEFT: Image */}
        <div className="flex md:flex-col items-start gap-3 md:w-[200px]">
          <div className="w-28 h-24 md:w-full md:h-[140px] flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {galleryImage ? (
              <img
                src={galleryImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                Không có ảnh
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: Content */}
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
              {item.paymentStatus && (
                <span className="ml-3">
                  | Trạng thái thanh toán: <b>{item.paymentStatusText}</b>
                </span>
              )}
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
                        “Sửa tin &amp; gửi lại”
                      </span>{" "}
                      để được duyệt lại.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-red-800">
                      <span className="font-medium">Lý do chính:</span>
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold">
                        {REJECT_REASON_MAPPING[item.resonReject] ||
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
                  <span>
                    Ngày hết hạn:{" "}
                    <strong className="font-medium text-gray-700">
                      {item.expiredAt
                        ? formatVNDateTime(new Date(item.expiredAt))
                        : item.expiresOn}
                    </strong>
                  </span>
                </div>
              )
            )}
          </div>

          {/* Actions - HIỂN THỊ THEO TRẠNG THÁI */}
          {renderActions()}
        </div>

        {/* RIGHT: Package Info */}
        {item.package && (
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
  const [hideFor, setHideFor] = useState(null);

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

  const onDelete = (id) =>
    setListings((prev) => (prev || []).filter((x) => x.id !== id));

  const onEdit = (id) => navigate(`/update-listing/${id}${location.search}`);

  const onNavigate = (listing) => {
    navigate(`/manage-listing/${listing.id}${location.search}`, {
      state: { listing },
    });
  };

  const getCountForTab = (key) =>
    (listings || []).filter((x) => x.status === key).length;

  const onUnhide = (item) =>
    setListings((prev) =>
      (prev || []).map((x) =>
        x.id === item.id ? { ...x, status: "active" } : x
      )
    );

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
                onDelete={onDelete}
                onOpenHideModal={setHideFor}
                menuForId={menuForId}
                setMenuForId={setMenuForId}
                onPayAgain={onPayAgain}
                onUnhide={onUnhide}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal Ẩn tin */}
      <HidePostModal
        open={!!hideFor}
        title={hideFor?.title || ""}
        onClose={() => setHideFor(null)}
        onConfirm={(reason) => {
          if (hideFor) {
            setListings((prev) =>
              (prev || []).map((x) =>
                x.id === hideFor.id ? { ...x, status: "hidden" } : x
              )
            );
          }
          setHideFor(null);
        }}
      />
    </MainLayout>
  );
};

export default ManageListing;
