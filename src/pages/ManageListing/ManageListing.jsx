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

/* ---------------- Tabs (VIỆT HOÁ) ---------------- */
const TABS = [
  { key: "active", label: "ĐANG HIỂN THỊ" },
  { key: "expired", label: "HẾT HẠN" },
  { key: "rejected", label: "BỊ TỪ CHỐI" },
  { key: "payment", label: "CẦN THANH TOÁN" },
  // { key: "draft", label: "TIN NHÁP" }, // ⟵ BỎ HOÀN TOÀN
  { key: "pending", label: "CHỜ DUYỆT" },
  { key: "hidden", label: "ĐÃ ẨN" },
];

/* Quy ước số bài/1 trang để tính "TRANG X" từ metrics.rank */
const ITEMS_PER_PAGE = 20;

/* ---------------- Sample listings ---------------- */
const SAMPLE = [
  {
    id: 201,
    title: "VinFast VF 8 Eco 2024",
    price: 1550000000,
    postedOn: "26/08/2025",
    expiresOn: "26/09/2025",
    status: "active",
    category: "Ô tô điện",
    location: "Phường Thảo Điền (Thủ Đức), TP Hồ Chí Minh",
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { rank: 82, categoryLabel: "Mục EV & Pin, …" },
  },
  {
    id: 202,
    title: "Tesla Model 3 Long Range AWD",
    price: 1350000000,
    postedOn: "20/09/2025",
    expiresOn: "20/10/2025",
    status: "active",
    category: "Ô tô điện",
    location: "TP Thủ Đức, TP Hồ Chí Minh",
    images: [
      "https://images.unsplash.com/photo-1519581356744-44c5b5f3c47b?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { rank: 76, categoryLabel: "Mục EV & Pin" },
  },
  {
    id: 203,
    title: "Bộ pin solid-state dung lượng cao",
    price: 245000000,
    postedOn: "19/09/2025",
    expiresOn: "04/10/2025",
    status: "pending",
    category: "Pin rời",
    location: "Quận Cầu Giấy, Hà Nội",
    images: [
      "https://images.unsplash.com/photo-1617813489478-0e96bde477c0?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { rank: 91, categoryLabel: "Mục Pin thay thế" },
  },

  // HẾT HẠN
  {
    id: 205,
    title: "Nissan Leaf 40 kWh 2019",
    price: 435000000,
    postedOn: "26/08/2025",
    expiresOn: "26/09/2025",
    status: "expired",
    category: "Ô tô điện",
    location: "Quận Bình Thạnh, TP Hồ Chí Minh",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { daysToDelete: 28 },
  },

  // ĐÃ ẨN
  {
    id: 204,
    title: "BMW i4 eDrive40 đăng ký 2024",
    price: 2200000000,
    postedOn: "18/09/2025",
    expiresOn: "18/10/2025",
    status: "hidden",
    category: "Ô tô điện",
    location: "Quận 7, TP Hồ Chí Minh",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { rank: 105, categoryLabel: "Mục Xe điện" },
  },

  /* ----------- CẦN THANH TOÁN ----------- */
  {
    id: 206,
    title: "Kia EV6 GT-Line 2022",
    price: 1250000000,
    postedOn: "28/09/2025",
    expiresOn: "28/10/2025",
    status: "payment",
    category: "Ô tô điện",
    location: "Quận Thanh Xuân, Hà Nội",
    images: [
      "https://images.unsplash.com/photo-1627454824205-5b4a0d8b2f2e?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { invoiceId: "INV-2025-000186" },
  },
  {
    id: 207,
    title: "Pin LFP 60 kWh (bộ tháo xe)",
    price: 320000000,
    postedOn: "01/10/2025",
    expiresOn: "31/10/2025",
    status: "payment",
    category: "Pin rời",
    location: "Quận Hải Châu, Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1617813536586-62bf6a6bfb38?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { invoiceId: "INV-2025-000223" },
  },

  /* ----------- BỊ TỪ CHỐI ----------- */
  {
    id: 208,
    title: "VinFast VF e34 2021 - bản tiêu chuẩn",
    price: 390000000,
    status: "rejected",
    category: "Ô tô điện",
    location: "Quận Gò Vấp, TP Hồ Chí Minh",
    images: [
      "https://images.unsplash.com/photo-1593941707874-ef25b8b63b45?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: {
      reason: "Ảnh mờ/không rõ biển số; thiếu giấy tờ đăng ký.",
    },
  },
  {
    id: 209,
    title: "Xe máy điện Dat Bike Weaver++ 2023",
    price: 24000000,
    status: "rejected",
    category: "Xe 2 bánh điện",
    location: "Thành phố Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: {
      reason: "Mô tả chưa rõ tình trạng pin/số km đã đi.",
    },
  },
];

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
const OptionMenu = ({ onShare, onHide }) => (
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
  </div>
);

/* ---------------- Modal “Ẩn tin” ---------------- */
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

/* ---------------- Modal “Gia hạn tin” ---------------- */
const ExtendModal = ({ open, listing, onClose, onApply }) => {
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

  const base = parseVNDate(listing?.expiresOn) || new Date();
  const next = new Date(base);
  next.setDate(base.getDate() + (selected?.days || 0));
  const nextStr = formatVNDate(next);

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-3 mt-16 md:mt-0 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="font-semibold text-gray-800">Gia hạn tin đăng</div>
          <button
            className="px-2 text-gray-600 text-xl leading-none cursor-pointer"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-5">
          <div className="font-semibold text-gray-800 mb-3">
            Chọn thời gian sử dụng
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((p) => {
              const active = selected?.days === p.days;
              return (
                <button
                  key={p.days}
                  onClick={() => setSelected(p)}
                  className={`relative text-left rounded-lg border px-4 py-4 cursor-pointer transition ${
                    active
                      ? "border-green-600 bg-green-50 ring-1 ring-green-200"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p.discount > 0 && (
                    <span className="absolute -top-2 -right-2 text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
                      -{p.discount}%
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
                        {p.days} ngày
                      </div>
                      <div className="text-gray-500">
                        {p.oldPrice ? (
                          <>
                            <span className="line-through mr-2">
                              {Number(p.oldPrice).toLocaleString("vi-VN")} đ
                            </span>
                            <span className="font-medium text-gray-800">
                              {Number(p.price).toLocaleString("vi-VN")} đ
                            </span>
                          </>
                        ) : (
                          <span className="font-medium text-gray-800">
                            {Number(p.price).toLocaleString("vi-VN")} đ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Dự kiến sẽ gia hạn đến{" "}
            <span className="font-semibold text-gray-800">{nextStr}</span>
          </p>
          <div className="mt-4">
            <button
              className="w-full px-4 py-3 bg-blue-600 hover:bg-cyan-600 text-white rounded-md font-semibold transition cursor-pointer"
              onClick={() => onApply(selected)}
            >
              Áp dụng
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
  onOpenExtendModal,
  onOpenRelist,
  onUnhide,
  onPayAgain,
}) => {
  const galleryImage = item.images?.[0];
  const metrics = item.metrics || {};
  const isExpired = item.status === "expired";
  const isHidden = item.status === "hidden";
  const isPending = item.status === "pending";
  const isRejected = item.status === "rejected";
  const isPayment = item.status === "payment";
  const isActive = item.status === "active";
  const canViewDetail = isActive; // chỉ ACTIVE mới cho xem chi tiết
  const daysToDelete = metrics.daysToDelete ?? 28;

  const pageFromRank =
    isActive && metrics.rank
      ? Math.max(1, Math.ceil(Number(metrics.rank) / ITEMS_PER_PAGE))
      : null;

  const menuRef = useRef(null);
  useOnClickOutside(menuRef, () => {
    if (menuForId === item.id) setMenuForId(null);
  });

  // style nút
  const btnBase =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer";
  const btnOutline = "border border-gray-300 text-gray-700 hover:bg-gray-50";
  const btnDangerOutline = "border border-red-200 text-red-600 hover:bg-red-50";
  const btnPrimary = "bg-green-600 hover:bg-green-500 text-white font-semibold";
  const btnDisabled = "bg-gray-200 text-gray-500 cursor-not-allowed opacity-70";

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
              {pageFromRank ? (
                <span className="uppercase tracking-wide font-semibold text-gray-800">
                  TRANG {pageFromRank}
                </span>
              ) : null}
              {pageFromRank ? (
                <span className="mx-1 text-gray-400">:</span>
              ) : (
                ""
              )}
              <span>
                Mục <b>{item.category || "Khác"}</b>
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <FiMapPin className="text-gray-400" />
              <span>{item.location}</span>
            </div>

            {/* Ẩn ngày đăng & hết hạn ở trạng thái REJECTED */}
            {!isRejected && (
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

            {isExpired && (
              <div className="mt-3 text-sm rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-gray-700">
                Tin đăng sẽ bị xoá khỏi hệ thống sau{" "}
                <b className="text-red-600">{daysToDelete} ngày</b>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-3 relative">
            {/* HẾT HẠN & ĐÃ ẨN */}
            {isExpired ? (
              <>
                <button
                  onClick={() => onOpenRelist(item)}
                  className={`${btnBase} ${btnPrimary}`}
                >
                  <FiRefreshCcw /> Đăng lại
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className={`${btnBase} ${btnDangerOutline}`}
                >
                  <FaRegTrashAlt /> Xoá tin
                </button>
              </>
            ) : isHidden ? (
              <>
                <button
                  onClick={() => onUnhide?.(item)}
                  className={`${btnBase} ${btnPrimary}`}
                  title="Hiện tin lại"
                >
                  <FiEye /> Hiện tin lại
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className={`${btnBase} ${btnDangerOutline}`}
                >
                  <FaRegTrashAlt /> Xoá tin
                </button>
              </>
            ) : isRejected ? (
              <>
                <button
                  onClick={() => onEdit(item.id)}
                  className={`${btnBase} ${btnPrimary}`}
                  title="Sửa lại tin để gửi duyệt"
                >
                  <FiEdit /> Sửa lại tin
                </button>
              </>
            ) : isPayment ? (
              <>
                <button
                  onClick={() => onPayAgain(item)}
                  className={`${btnBase} ${btnPrimary}`}
                >
                  <FiZap /> Thanh toán lại
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className={`${btnBase} ${btnDangerOutline}`}
                >
                  <FaRegTrashAlt /> Xoá tin
                </button>
              </>
            ) : (
              /* ACTIVE / PENDING */
              <>
                <button
                  disabled={isPending}
                  onClick={() => !isPending && onOpenExtendModal(item)}
                  className={`${btnBase} ${
                    isPending ? btnDisabled : btnOutline
                  }`}
                >
                  <FiRefreshCcw /> Gia hạn tin
                </button>

                <button
                  disabled={isPending}
                  onClick={() => !isPending && onEdit(item.id)}
                  className={`${btnBase} ${
                    isPending ? btnDisabled : btnOutline
                  }`}
                >
                  <FiEdit /> Sửa tin
                </button>

                <div className="relative" ref={menuRef}>
                  <button
                    disabled={isPending}
                    onClick={() => {
                      if (isPending) return;
                      setMenuForId((v) => (v === item.id ? null : item.id));
                    }}
                    className={`${btnBase} ${
                      isPending ? btnDisabled : btnOutline
                    }`}
                    aria-haspopup="menu"
                    aria-expanded={!isPending && menuForId === item.id}
                  >
                    <FiMoreHorizontal /> Tuỳ chọn
                  </button>

                  {!isPending && menuForId === item.id && (
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
                      />
                    </div>
                  )}
                </div>

                <button
                  disabled={isPending}
                  onClick={() => !isPending && onDelete(item.id)}
                  className={`${btnBase} ${
                    isPending ? btnDisabled : btnDangerOutline
                  }`}
                >
                  <FaRegTrashAlt /> Xoá tin
                </button>

                <button
                  disabled={isPending}
                  onClick={() => {
                    /* mở gói đẩy tin */
                  }}
                  className={`${btnBase} ${
                    isPending ? btnDisabled : btnPrimary
                  }`}
                >
                  <FiZap /> Bán nhanh hơn
                </button>
              </>
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

  const [listings, setListings] = useState(SAMPLE);

  // dropdown + modals
  const [menuForId, setMenuForId] = useState(null);
  const [hideFor, setHideFor] = useState(null);
  const [extendFor, setExtendFor] = useState(null);

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

  // Đăng lại -> mở modal gia hạn; khi áp dụng: active + cập nhật hạn (xử lý ở onApply)
  const onOpenRelist = (item) => setExtendFor(item);

  // ĐÃ ẨN -> Hiện tin lại
  const onUnhide = (item) =>
    setListings((prev) =>
      (prev || []).map((x) =>
        x.id === item.id ? { ...x, status: "active" } : x
      )
    );

  // CẦN THANH TOÁN -> Thanh toán lại
  const onPayAgain = (item) => {
    navigate("/payment", { state: { listing: item, retry: true } });
  };

  const setTab = (key) => setSearchParams({ tab: key });

  const activeLabel = TABS.find((t) => t.key === activeTab)?.label || "";

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
                onOpenExtendModal={setExtendFor}
                onOpenRelist={onOpenRelist}
                onUnhide={onUnhide}
                onPayAgain={onPayAgain}
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

      {/* Modal Gia hạn / Đăng lại */}
      <ExtendModal
        open={!!extendFor}
        listing={extendFor}
        onClose={() => setExtendFor(null)}
        onApply={(plan) => {
          if (extendFor) {
            const baseDateObj = parseVNDate(extendFor.expiresOn) || new Date();
            const baseDateStr = formatVNDate(baseDateObj);
            const nextDateObj = new Date(baseDateObj);
            nextDateObj.setDate(baseDateObj.getDate() + (plan?.days || 0));
            const nextDateStr = formatVNDate(nextDateObj);
            navigate("/payment", {
              state: {
                listing: extendFor,
                plan,
                renewal: { baseDateStr, nextDateStr },
              },
            });
          }
          setExtendFor(null);
        }}
      />
    </MainLayout>
  );
};

export default ManageListing;
