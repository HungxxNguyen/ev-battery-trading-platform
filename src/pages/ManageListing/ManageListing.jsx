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

/* Quy ước số bài/1 trang để tính "TRANG X" từ metrics.rank */
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

/* ---------------- Mapping API data to frontend format ---------------- */
const mapApiDataToFrontend = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((item) => {
    // Map status từ API sang frontend status với logic mới
    let frontendStatus = item.status?.toLowerCase();

    // Logic phân loại tab dựa trên PaymentStatus và status
    if (item.paymentStatus === "AwaitingPayment" && item.status === "Pending") {
      frontendStatus = "payment"; // Tab "CẦN THANH TOÁN"
    } else if (item.paymentStatus === "Success" && item.status === "Pending") {
      frontendStatus = "pending"; // Tab "CHỜ DUYỆT"
    } else {
      // Giữ nguyên mapping cũ cho các trường hợp khác
      const statusMapping = {
        Active: "active",
        Expired: "expired",
        Rejected: "rejected",
        Pending: "pending",
        Hidden: "hidden",
      };
      frontendStatus = statusMapping[item.status] || item.status?.toLowerCase();
    }

    // Map category từ API sang frontend category
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
      postedOn: formatVNDate(new Date()), // Cần API cung cấp ngày đăng
      expiresOn: formatVNDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Cần API cung cấp ngày hết hạn
      payment: item.payment || false, // Thêm trường payment từ API
      paymentStatus: item.paymentStatus, // Giữ nguyên paymentStatus từ API
      paymentStatusText:
        PAYMENT_STATUS_MAPPING[item.paymentStatus] || item.paymentStatus, // Convert sang tiếng Việt
      metrics: {
        rank: Math.floor(Math.random() * 100) + 1, // Tạm thời random, cần API cung cấp
        categoryLabel: categoryMapping[item.category] || item.category,
        daysToDelete: 28, // Mặc định
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
  const canViewDetail = isActive; // chỉ ACTIVE mới cho xem chi tiết

  const menuRef = useRef(null);
  useOnClickOutside(menuRef, () => {
    if (menuForId === item.id) setMenuForId(null);
  });

  // style nút
  const btnBase =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer";
  const btnOutline = "border border-gray-300 text-gray-700 hover:bg-gray-50";
  const btnPrimary = "bg-green-600 hover:bg-green-500 text-white font-semibold";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
        {/* LEFT: Image */}
        <div className="flex md:flex-col items-start gap-3 md:w-[200px]">
          <button
            type="button"
            onClick={() => canViewDetail && onNavigate(item)}
            disabled={!canViewDetail}
            className={`w-28 h-24 md:w-full md:h-[140px] flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition ${
              canViewDetail
                ? "hover:border-green-500 cursor-pointer"
                : "cursor-not-allowed opacity-70"
            }`}
            title={
              canViewDetail
                ? "Xem chi tiết tin"
                : "Chỉ xem chi tiết với tin ở mục ĐANG HIỂN THỊ"
            }
          >
            {galleryImage ? (
              <img
                src={galleryImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                No image
              </div>
            )}
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => canViewDetail && onNavigate(item)}
              disabled={!canViewDetail}
              className={`text-left text-lg md:text-xl font-semibold transition ${
                canViewDetail
                  ? "text-gray-800 hover:text-blue-600 cursor-pointer"
                  : "text-gray-500 cursor-not-allowed"
              }`}
              title={
                canViewDetail
                  ? "Xem chi tiết tin"
                  : "Chỉ xem chi tiết với tin ở mục ĐANG HIỂN THỊ"
              }
            >
              {item.title}
            </button>

            <p className="text-red-600 font-bold text-lg select-none">
              {currency(item.price)}
            </p>

            {/* TRANG & MỤC (dưới giá) */}
            <div className="text-xs md:text-sm text-gray-600">
              <span>
                Mục <b>{item.category || "Khác"}</b>
              </span>
              {/* Hiển thị trạng thái thanh toán nếu có */}
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

            {/* Ẩn ngày đăng & hết hạn ở trạng thái REJECTED */}
            {item.status !== "rejected" && (
              <div className="flex flex-wrap gap-4 text-xs md:text-sm text-gray-500 mt-1">
                <span>
                  Ngày đăng tin:{" "}
                  <strong className="font-medium text-gray-700">
                    {item.postedOn}
                  </strong>
                </span>
                <span>
                  Ngày hết hạn:{" "}
                  <strong className="font-medium text-gray-700">
                    {item.expiresOn}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Actions - CHỈ 4 NÚT CƠ BẢN */}
          <div className="mt-4 flex flex-wrap items-center gap-3 relative">
            {/* Nút 1: Thanh toán / Hiện tin lại */}
            {item.status === "hidden" ? (
              <button
                onClick={() => onUnhide?.(item)}
                className={`${btnBase} ${btnPrimary}`}
              >
                <FiEye /> Hiện tin lại
              </button>
            ) : (
              <PaymentButton
                listingId={item.id}
                className={`${btnBase} ${btnOutline}`}
                onSuccess={(response) => {
                  console.log("Payment created successfully:", response);
                }}
                onError={(error) => {
                  console.error("Payment creation failed:", error);
                }}
              >
                Thanh toán
              </PaymentButton>
            )}

            {/* Nút 2: Sửa tin */}
            <button
              onClick={() => onEdit(item.id)}
              className={`${btnBase} ${btnOutline}`}
            >
              <FiEdit /> Sửa tin
            </button>

            {/* Nút 3: Tùy chọn */}
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

            {/* Nút 4: Gia hạn tin (chỉ cho tin active) */}
            {item.status === "active" && (
              <button
                onClick={() => onPayAgain(item)}
                className={`${btnBase} ${btnOutline}`}
              >
                <FiRefreshCcw /> Gia hạn tin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */
const ManageListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // lấy tab từ URL, mặc định active
  const urlTab = searchParams.get("tab") || "active";
  const [activeTab, setActiveTab] = useState(urlTab);

  // đồng bộ state <-> URL khi đổi tab
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

  // dropdown + modals
  const [menuForId, setMenuForId] = useState(null);
  const [hideFor, setHideFor] = useState(null);

  // Fetch data từ API
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

  const onEdit = (id) =>
    navigate(`/add-listing?mode=edit&id=${id}${location.search}`);

  const onNavigate = (listing) => {
    // CHỈ ACTIVE mới cho xem chi tiết
    if (listing?.status !== "active") return;
    navigate(`/manage-listing/${listing.id}${location.search}`, {
      state: { listing },
    });
  };

  const getCountForTab = (key) =>
    (listings || []).filter((x) => x.status === key).length;

  // ĐÃ ẨN -> Hiện tin lại
  const onUnhide = (item) =>
    setListings((prev) =>
      (prev || []).map((x) =>
        x.id === item.id ? { ...x, status: "active" } : x
      )
    );

  // Gia hạn tin
  const onPayAgain = (item) => {
    navigate("/payment", { state: { listing: item, retry: true } });
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
