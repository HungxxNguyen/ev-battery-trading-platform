// src/pages/ManageListing.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { motion } from "framer-motion";
import {
  FiEdit,
  FiMapPin,
  FiMoreHorizontal,
  FiRefreshCcw,
  FiZap,
} from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";

/* ---------------- Tabs ---------------- */
const TABS = [
  { key: "active", label: "DANG HIEN THI" },
  { key: "expired", label: "HET HAN" },
  { key: "rejected", label: "BI TU CHOI" },
  { key: "payment", label: "CAN THANH TOAN" },
  { key: "draft", label: "TIN NHAP" },
  { key: "pending", label: "CHO DUYET" },
  { key: "hidden", label: "DA AN" },
];

/* ---------------- Sample listings ---------------- */
const SAMPLE = [
  {
    id: 201,
    title: "VinFast VF 8 Eco 2024",
    price: 1550000000,
    postedOn: "26/08/2025",
    expiresOn: "26/09/2025",
    status: "active",
    location: "Phuong Thao Dien (Thu Duc), TP Ho Chi Minh",
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { rank: 82, categoryLabel: "Muc EV & Pin, …" },
  },
  {
    id: 202,
    title: "Tesla Model 3 Long Range AWD",
    price: 1350000000,
    postedOn: "20/09/2025",
    expiresOn: "20/10/2025",
    status: "active",
    location: "Quan Thu Duc, TP Ho Chi Minh",
    images: [
      "https://images.unsplash.com/photo-1519581356744-44c5b5f3c47b?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { rank: 76, categoryLabel: "Muc EV & Pin" },
  },
  {
    id: 203,
    title: "Bo pin solid-state dung luong cao",
    price: 245000000,
    postedOn: "19/09/2025",
    expiresOn: "04/10/2025",
    status: "pending",
    location: "Quan Cau Giay, Ha Noi",
    images: [
      "https://images.unsplash.com/photo-1617813489478-0e96bde477c0?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { rank: 91, categoryLabel: "Muc Pin thay the" },
  },
  {
    id: 204,
    title: "BMW i4 eDrive40 dang ky 2024",
    price: 2200000000,
    postedOn: "18/09/2025",
    expiresOn: "18/10/2025",
    status: "hidden",
    location: "Quan 7, TP Ho Chi Minh",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    ],
    metrics: { rank: 105, categoryLabel: "Muc Xe dien" },
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

/* ---------------- Badge “TRANG XX” ---------------- */
const RankBadge = ({ page = 82, label = "Muc EV & Pin, …", onClick }) => (
  <div
    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold cursor-pointer"
    onClick={onClick}
    title="Xem vị trí hiển thị"
  >
    <span className="tracking-wide">TRANG {page}</span>
    <span className="text-gray-400">•</span>
    <span className="font-normal">{label}</span>
  </div>
);

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
      <span className="text-lg">🙈</span>
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
        <div className="flex items-center justify-between px-4 py-3 rounded-t-lg bg-yellow-400/90">
          <div className="font-semibold text-gray-900 truncate">
            Ẩn tin {title}
          </div>
          <button
            className="px-2 text-gray-800 text-lg leading-none cursor-pointer"
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
                  className="w-4 h-4 text-green-600 border-gray-300"
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
                  : "bg-gray-300 cursor-not-allowed"
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
                          ? "border-green-600 bg-green-600 ring-2 ring-green-200"
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
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition cursor-pointer"
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

/* ---------------- ListingItem (mới) ---------------- */
const ListingItem = ({
  item,
  onNavigate,
  onEdit,
  onDelete,
  onOpenHideModal,
  menuForId,
  setMenuForId,
  onOpenExtendModal,
}) => {
  const galleryImage = item.images?.[0];
  const metrics = item.metrics || {};
  const pageRank = metrics.rank ?? 1;

  const menuRef = useRef(null);
  useOnClickOutside(menuRef, () => {
    if (menuForId === item.id) setMenuForId(null);
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
        {/* LEFT: Image */}
        <div className="flex md:flex-col items-start gap-3 md:w-[200px]">
          <button
            type="button"
            onClick={() => onNavigate(item)}
            className="w-28 h-24 md:w-full md:h-[140px] flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 hover:border-green-500 transition cursor-pointer"
            title="Xem chi tiết tin"
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

        {/* RIGHT: content + actions */}
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onNavigate(item)}
              className="text-left text-lg md:text-xl font-semibold text-gray-800 hover:text-green-600 transition cursor-pointer"
              title="Xem chi tiết tin"
            >
              {item.title}
            </button>

            <p className="text-red-600 font-bold text-lg select-none">
              {currency(item.price)}
            </p>

            <div className="mt-1">
              <RankBadge
                page={pageRank}
                label={metrics.categoryLabel || "Muc EV & Pin, …"}
                onClick={() => {}}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <FiMapPin className="text-gray-400" />
              <span>{item.location}</span>
            </div>

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
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-3 relative">
            <button
              onClick={() => onOpenExtendModal(item)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              <FiRefreshCcw /> Gia hạn tin
            </button>

            <button
              onClick={() => onEdit(item.id)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              <FiEdit /> Sửa tin
            </button>

            {/* Tuỳ chọn */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() =>
                  setMenuForId((v) => (v === item.id ? null : item.id))
                }
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
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
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => onDelete(item.id)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition cursor-pointer"
            >
              <FaRegTrashAlt /> Xoá tin
            </button>

            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition cursor-pointer">
              <FiZap /> Bán nhanh hơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */
const ManageListing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
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
  const onEdit = (id) => navigate(`/add-listing?mode=edit&id=${id}`);
  const onNavigate = (listing) =>
    navigate(`/manage-listing/${listing.id}`, { state: { listing } });
  const getCountForTab = (key) =>
    (listings || []).filter((x) => x.status === key).length;

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
            Quan ly tin dang
          </h2>
          <Link to="/add-listing" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition cursor-pointer">
              + Dang tin
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
                  onClick={() => setActiveTab(t.key)}
                  className="relative pb-2 font-bold whitespace-nowrap focus:outline-none cursor-pointer"
                >
                  <span
                    className={isActive ? "text-orange-500" : "text-gray-700"}
                  >
                    {t.label} ( {getCountForTab(t.key)} )
                  </span>
                  {isActive && (
                    <span className="absolute left-0 -bottom-[3px] h-1 w-full bg-orange-500 rounded-full" />
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
              Ban chua co tin o muc <b>{activeLabel}</b>.
            </p>
            <div className="mt-4">
              <Link to="/add-listing">
                <button className="px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition cursor-pointer">
                  + Dang tin ngay
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
          console.log("Ẩn tin:", hideFor?.id, "Lý do:", reason);
          setHideFor(null);
        }}
      />

      {/* Modal Gia hạn */}
      <ExtendModal
        open={!!extendFor}
        listing={extendFor}
        onClose={() => setExtendFor(null)}
        onApply={(plan) => {
          if (extendFor) {
            const base = parseVNDate(extendFor.expiresOn) || new Date();
            const next = new Date(base);
            next.setDate(base.getDate() + (plan?.days || 0));
            const nextStr = formatVNDate(next);
            setListings((prev) =>
              (prev || []).map((x) =>
                x.id === extendFor.id
                  ? { ...x, expiresOn: nextStr, status: "active" }
                  : x
              )
            );
          }
          setExtendFor(null);
          alert(`Đã áp dụng gói ${plan.days} ngày.`);
        }}
      />
    </MainLayout>
  );
};

export default ManageListing;
