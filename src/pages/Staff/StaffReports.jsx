// ===============================
// File: src/pages/Staff/StaffReports.jsx
// ===============================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getAllReports,
  getReportById,
  REPORT_REASONS,
  getReportEvidenceUrl,
} from "../../services/apis/reportApi";
import listingService from "../../services/apis/listingApi";
import userService from "../../services/apis/userApi";
import userManagementService from "../../services/apis/userManagementApi"; // Ban / Unban
import { Button } from "../../components/Button/button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  AlertTriangle,
  User,
  UserX,
  UserCheck,
  Image as ImageIcon,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

/* ===============================
   0) Ảnh – chuẩn hóa URL & payload
   =============================== */
const FILE_BASE = (() => {
  try {
    const v =
      import.meta && import.meta.env && import.meta.env.VITE_FILE_BASE_URL;
    return v ? String(v).replace(/\/$/, "") : "";
  } catch (_e) {
    return "";
  }
})();

// Biến path tương đối -> tuyệt đối (nếu có FILE_BASE)
function absolutize(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return FILE_BASE ? `${FILE_BASE}/${s.replace(/^\//, "")}` : s;
}

// Nuốt mọi kiểu payload từ BE và trả về mảng URL string
function normalizeEvidence(input) {
  const take = (arr) =>
    arr
      .map((it) => {
        if (typeof it === "string") return it;
        return it?.imageUrl || it?.url || it?.imagePath || it?.path || "";
      })
      .filter(Boolean)
      .map(absolutize);

  try {
    if (!input) return [];
    if (Array.isArray(input)) return take(input);
    if (typeof input === "string")
      return input.trim() ? [absolutize(input.trim())] : [];

    if (Array.isArray(input?.data)) return take(input.data);
    if (Array.isArray(input?.data?.data)) return take(input.data.data);

    if (typeof input?.data?.imageUrl === "string")
      return [absolutize(input.data.imageUrl)];
    if (typeof input?.imageUrl === "string")
      return [absolutize(input.imageUrl)];

    return [];
  } catch {
    return [];
  }
}

const REPORT_REASON_LABELS = {
  Scam: "Lừa đảo",
  Duplicate: "Tin đăng trùng lặp",
  Sold: "Đã bán",
  UnableToContact: "Không liên lạc được",
  IncorrectInformation: "Thông tin sai lệch",
  Other: "Lý do khác",
};

const STATUS_TABS = [
  { value: "All", label: "Tất cả trạng thái", dotClass: "bg-slate-500" },
  { value: "Active", label: "Đang hoạt động", dotClass: "bg-emerald-400" },
  { value: "Inactive", label: "Ngưng hoạt động", dotClass: "bg-rose-400" },
];

const STATUS_FILTER_TARGETS = [
  { value: "reporter", label: "Người báo cáo" },
  { value: "seller", label: "Người bị báo cáo" },
];

const USER_STATUS_META = {
  Active: {
    label: "Đang hoạt động",
    className:
      "border-emerald-500/60 bg-emerald-500/10 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.25)]",
    Icon: UserCheck,
  },
  Inactive: {
    label: "Ngưng hoạt động",
    className:
      "border-rose-500/60 bg-rose-500/10 text-rose-200 shadow-[0_0_10px_rgba(248,113,113,0.25)]",
    Icon: UserX,
  },
};

function getReasonLabel(reason) {
  if (!reason) return "-";
  return REPORT_REASON_LABELS[reason] || reason;
}

function hasKey(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function extractSellerInfo(source) {
  if (!source || typeof source !== "object") return null;
  const seller =
    source.user ||
    source.seller ||
    source.owner ||
    source.sellerInfo ||
    source.listingOwner ||
    null;

  const id =
    seller?.id ??
    seller?.userId ??
    seller?.userID ??
    source.userId ??
    source.UserId ??
    source.userID ??
    source.sellerId ??
    source.SellerId ??
    source.sellerID ??
    source.ownerId ??
    source.OwnerId ??
    source.ownerID ??
    null;

  const name =
    seller?.userName ||
    seller?.name ||
    seller?.fullName ||
    seller?.displayName ||
    source.sellerName ||
    source.sellerFullName ||
    source.ownerName ||
    source.ownerFullName ||
    source.userName ||
    source.contactName ||
    null;

  const email =
    seller?.email ||
    source.sellerEmail ||
    source.ownerEmail ||
    source.userEmail ||
    source.contactEmail ||
    null;

  const phone =
    seller?.phoneNumber ||
    seller?.phone ||
    source.sellerPhone ||
    source.ownerPhone ||
    source.userPhone ||
    source.contactPhone ||
    null;

  const status =
    seller?.status ||
    seller?.accountStatus ||
    seller?.userStatus ||
    seller?.statusName ||
    source.sellerStatus ||
    source.ownerStatus ||
    source.userStatus ||
    source.status ||
    source.accountStatus ||
    source.statusName ||
    (typeof seller?.isActive === "boolean"
      ? seller.isActive
        ? "Active"
        : "Inactive"
      : typeof source?.isActive === "boolean"
      ? source.isActive
        ? "Active"
        : "Inactive"
      : null);

  if (!name && !email && !phone) return null;

  return {
    id: id || null,
    name: name || "-",
    email: email || "-",
    phone: phone || "-",
    status: status || null,
  };
}

function resolveUserStatus(user) {
  if (!user || typeof user !== "object") return null;
  const raw =
    user.status ??
    user.accountStatus ??
    user.userStatus ??
    (typeof user.isActive === "boolean"
      ? user.isActive
        ? "Active"
        : "Inactive"
      : null);

  if (raw == null) return null;
  const str = String(raw).trim();
  if (!str) return null;
  const lower = str.toLowerCase();

  if (
    lower === "active" ||
    lower === "activated" ||
    lower === "enable" ||
    lower === "enabled" ||
    lower === "1" ||
    lower === "true"
  ) {
    return "Active";
  }

  if (
    lower === "inactive" ||
    lower === "inactivated" ||
    lower === "disabled" ||
    lower === "deactive" ||
    lower === "deactivated" ||
    lower === "ban" ||
    lower === "banned" ||
    lower === "blocked" ||
    lower === "0" ||
    lower === "false"
  ) {
    return "Inactive";
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ===============================
   1) Helpers nhỏ cho table/field
   =============================== */
function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-2 align-top text-sm text-slate-200 ${className}`}>
      {children}
    </td>
  );
}
function TdMono({ children }) {
  return (
    <td className="px-4 py-2 align-top font-mono text-[11px] text-slate-300 break-all">
      {children}
    </td>
  );
}
function ReasonBadge({ value }) {
  if (!value) return <span className="text-xs text-slate-400">-</span>;
  const raw = String(value);
  const lower = raw.toLowerCase();
  const text = getReasonLabel(raw);
  let classes =
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium";
  if (lower.includes("lừa") || lower.includes("scam")) {
    classes +=
      " border-rose-500/60 bg-rose-500/10 text-rose-200 shadow-[0_0_10px_rgba(248,113,113,0.25)]";
  } else if (lower.includes("spam") || lower.includes("quảng cáo")) {
    classes +=
      " border-amber-500/60 bg-amber-500/10 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]";
  } else if (lower.includes("nội dung") || lower.includes("phản cảm")) {
    classes +=
      " border-violet-500/60 bg-violet-500/10 text-violet-200 shadow-[0_0_10px_rgba(167,139,250,0.25)]";
  } else {
    classes += " border-slate-600/70 bg-slate-800/70 text-slate-100";
  }
  return <span className={classes}>{text}</span>;
}

function Field({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-100">{value ?? "-"}</span>
    </div>
  );
}
function Info({ label, value, mono }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div
        className={
          "rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 " +
          (mono ? "font-mono text-xs break-all" : "")
        }
      >
        {value ?? "-"}
      </div>
    </div>
  );
}

/* ===============================
   2) Listing preview (GIỐNG StaffReview – KHÔNG ZOOM/LIGHTBOX)
   =============================== */
function ReportListingDetail({ listing }) {
  const rawImages = Array.isArray(listing?.listingImages)
    ? listing.listingImages
        .map((i) =>
          typeof i === "string" ? i : i?.imageUrl || i?.url || i?.path || ""
        )
        .filter(Boolean)
    : [];

  const imageUrls = (
    rawImages.length
      ? rawImages
      : ["https://placehold.co/1200x800?text=Listing"]
  ).map(absolutize);

  // Chỉ giữ index & prev/next (không có phóng to/zoom)
  const [index, setIndex] = React.useState(0);
  const prevImage = React.useCallback(() => {
    if (!imageUrls.length) return;
    setIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length);
  }, [imageUrls.length]);
  const nextImage = React.useCallback(() => {
    if (!imageUrls.length) return;
    setIndex((i) => (i + 1) % imageUrls.length);
  }, [imageUrls.length]);

  const brandName = listing?.brand?.name || listing?.brandName || "-";
  const specFields = (() => {
    switch (listing?.category) {
      case "ElectricCar":
      case "ElectricMotorbike":
        return [
          { label: "Số km đã đi (Odo)", value: listing?.odo },
          { label: "Dung lượng pin (kWh)", value: listing?.batteryCapacity },
          { label: "Tầm hoạt động (km)", value: listing?.actualOperatingRange },
          { label: "Thời gian sạc (giờ)", value: listing?.chargingTime },
          { label: "Màu sắc", value: listing?.color },
          { label: "Kích thước", value: listing?.size },
          { label: "Khối lượng (kg)", value: listing?.mass },
        ];
      case "RemovableBattery":
        return [
          { label: "Dung lượng pin", value: listing?.batteryCapacity },
          { label: "Khối lượng (kg)", value: listing?.mass },
          { label: "Kích thước", value: listing?.size },
          { label: "Màu sắc", value: listing?.color },
        ];
      default:
        return [
          { label: "Số km đã đi (Odo)", value: listing?.odo },
          { label: "Dung lượng pin (kWh)", value: listing?.batteryCapacity },
          { label: "Tầm hoạt động (km)", value: listing?.actualOperatingRange },
          { label: "Thời gian sạc (giờ)", value: listing?.chargingTime },
        ];
    }
  })();

  return (
    <div className="space-y-4">
      {/* Gallery kiểu StaffReview */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950/60">
        {imageUrls.length ? (
          <>
            <img
              src={imageUrls[index]}
              alt={`listing-${index + 1}`}
              className="h-full w-full object-contain select-none"
              draggable={false}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />

            {imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="cursor-pointer absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/80 text-slate-100 shadow-md hover:bg-slate-800/90"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="cursor-pointer absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/80 text-slate-100 shadow-md hover:bg-slate-800/90"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-slate-50">
              {index + 1} / {imageUrls.length}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Không có hình ảnh
          </div>
        )}
      </div>

      {imageUrls.length > 0 && (
        <div className="border-t border-slate-800/60 pt-3">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {imageUrls.map((url, idx) => (
              <button
                key={`${url}-${idx}`}
                type="button"
                onClick={() => setIndex(idx)}
                className={`relative flex-shrink-0 h-20 w-24 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                  index === idx
                    ? "border-emerald-500 ring-2 ring-emerald-400/40"
                    : "border-slate-800 hover:border-slate-600"
                }`}
                title={`Ảnh ${idx + 1}`}
              >
                <img
                  src={url}
                  alt={`thumb-${idx + 1}`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Title + price */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-lg font-semibold text-slate-50">
          {listing?.title || "(Không tiêu đề)"}
        </h4>
        {listing?.price != null && (
          <div className="rounded-full bg-rose-500/10 px-3 py-1 text-sm font-semibold text-rose-300">
            {(Number(listing.price) || 0).toLocaleString("vi-VN")} VND
          </div>
        )}
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <Field label="Danh mục" value={listing?.category} />
        <Field label="Thương hiệu" value={brandName} />
        <Field label="Model" value={listing?.model} />
        <Field label="Khu vực" value={listing?.area} />
        <Field label="Năm sản xuất" value={listing?.yearOfManufacture} />
        <Field label="Tình trạng" value={listing?.listingStatus} />
      </div>

      {/* Specs */}
      {specFields?.length > 0 && (
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {specFields.map((f) => (
            <Field key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      )}

      {/* Seller (if available) */}
      {(listing?.user || listing?.sellerName) && (
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-3">
          <h5 className="mb-2 text-sm font-semibold text-slate-100">
            Người bán
          </h5>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <Field
              label="Tên"
              value={listing?.user?.userName || listing?.sellerName}
            />
            <Field
              label="Email"
              value={listing?.user?.email || listing?.sellerEmail}
            />
            <Field
              label="Số điện thoại"
              value={listing?.user?.phoneNumber || listing?.sellerPhone}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h5 className="mb-1 text-sm font-semibold text-slate-100">Mô tả</h5>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-3 text-sm text-slate-300 whitespace-pre-line">
          {listing?.description || "Người bán chưa cập nhật mô tả."}
        </div>
      </div>
    </div>
  );
}

/* ===============================
   3) Trang Staff Reports
   =============================== */
export default function StaffReportsPage() {
  const { showNotification } = useNotification() || { showNotification: null };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reasonFilter, setReasonFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusFilterTarget, setStatusFilterTarget] = useState("reporter");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(null); // report id
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [userMap, setUserMap] = useState({}); // cache user info by id
  const [reportedSellerMap, setReportedSellerMap] = useState({});
  const detailSectionRef = useRef(null);

  // Ban / Unban UI states
  const [banMode, setBanMode] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banLoading, setBanLoading] = useState(false);
  const [unbanConfirmOpen, setUnbanConfirmOpen] = useState(false);
  const [unbanLoading, setUnbanLoading] = useState(false);

  // Evidence modal (list + index)
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceList, setEvidenceList] = useState([]); // array<string>
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState("");

  // ✅ Helper: reset action panels khi đổi report
  const resetActionPanels = () => {
    setBanMode(false);
    setBanReason("");
    setBanLoading(false);
    setUnbanConfirmOpen(false);
    setUnbanLoading(false);
    setEvidenceOpen(false);
    setEvidenceList([]);
    setEvidenceIndex(0);
    setEvidenceLoading(false);
    setEvidenceError("");
  };

  const filtered = useMemo(() => {
    let result = data;
    if (reasonFilter !== "All")
      result = result.filter((x) => x.reason === reasonFilter);

    if (statusFilter !== "All") {
      result = result.filter((x) => {
        const sourceUser =
          statusFilterTarget === "seller"
            ? reportedSellerMap[x.listingId]
            : userMap[x.userId];
        const status = resolveUserStatus(sourceUser);
        if (!status) return false;
        return status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    if (!searchTerm.trim()) return result;
    const q = searchTerm.trim().toLowerCase();
    return result.filter((x) => {
      const id = String(x.id || "").toLowerCase();
      const listingId = String(x.listingId || "").toLowerCase();
      const reason = String(x.reason || "").toLowerCase();
      const other = String(x.otherReason || "").toLowerCase();
      return (
        id.includes(q) ||
        listingId.includes(q) ||
        reason.includes(q) ||
        other.includes(q)
      );
    });
  }, [
    data,
    reasonFilter,
    searchTerm,
    statusFilter,
    statusFilterTarget,
    userMap,
    reportedSellerMap,
  ]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllReports({ pageIndex, pageSize });
      if (res?.error === 0) {
        const arr = Array.isArray(res?.data) ? res.data : [];
        setData(arr);
        // Prefetch reporter info
        const ids = [...new Set(arr.map((x) => x.userId).filter(Boolean))];
        const missing = ids.filter((id) => !userMap[id]);
        if (missing.length) {
          const results = await Promise.allSettled(
            missing.map((id) => userService.getById(id))
          );
          const next = { ...userMap };
          results.forEach((r, idx) => {
            const uid = missing[idx];
            if (r.status === "fulfilled") {
              const payload = r.value?.data;
              const u = payload?.data || payload || null;
              if (u) next[uid] = u;
            }
          });
          setUserMap(next);
        }

        const listingIds = [
          ...new Set(arr.map((x) => x.listingId).filter(Boolean)),
        ];
        const missingListingIds = listingIds.filter(
          (id) => !hasKey(reportedSellerMap, id)
        );
        if (missingListingIds.length) {
          const listingResults = await Promise.allSettled(
            missingListingIds.map((id) => listingService.getById(id))
          );
          const parsed = listingResults.map((res) => {
            if (res.status !== "fulfilled") return null;
            const payload = res.value?.data;
            let detail = null;
            if (payload?.error === 0 && payload?.data) detail = payload.data;
            else if (payload && typeof payload === "object")
              detail = payload.data || payload;
            return extractSellerInfo(detail);
          });

          const sellersNeedingStatus = [];

          setReportedSellerMap((prev) => {
            const next = { ...prev };
            missingListingIds.forEach((lid, idx) => {
              if (hasKey(prev, lid)) return;
              const info = parsed[idx] || null;
              next[lid] = info;
              if (info?.id && !resolveUserStatus(info)) {
                sellersNeedingStatus.push({ listingId: lid, userId: info.id });
              }
            });
            return next;
          });

          if (sellersNeedingStatus.length) {
            const statusResults = await Promise.allSettled(
              sellersNeedingStatus.map((item) =>
                userService.getById(item.userId)
              )
            );
            setReportedSellerMap((prev) => {
              const next = { ...prev };
              sellersNeedingStatus.forEach((item, idx) => {
                const res = statusResults[idx];
                if (res?.status !== "fulfilled") return;
                const payload = res.value?.data;
                const userPayload = payload?.data || payload || null;
                if (!userPayload) return;
                const userInfo = extractSellerInfo(userPayload);
                const current = next[item.listingId] || {};
                const updated = { ...current };
                if (userInfo?.id) updated.id = userInfo.id;
                if (userInfo?.name && userInfo.name !== "-")
                  updated.name = userInfo.name;
                if (userInfo?.email && userInfo.email !== "-")
                  updated.email = userInfo.email;
                if (userInfo?.phone && userInfo.phone !== "-")
                  updated.phone = userInfo.phone;
                if (userInfo?.status) updated.status = userInfo.status;
                next[item.listingId] = updated;
              });
              return next;
            });
          }
        }
      } else {
        setError(res?.message || "Tải danh sách báo cáo thất bại.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Đã xảy ra lỗi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  useEffect(() => {
    const idParam = searchParams.get("id");
    if ((idParam || null) !== (selectedId || null)) setSelectedId(idParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!selectedId) {
        setSelectedReport(null);
        setSelectedListing(null);
        setDetailError("");
        setDetailLoading(false);
        return;
      }
      setDetailLoading(true);
      setDetailError("");
      try {
        const rep = await getReportById(selectedId);
        const repData = rep?.data?.data || rep?.data || null;
        if (!repData)
          throw new Error(rep?.message || "Không lấy được thông tin báo cáo");
        if (!active) return;
        setSelectedReport(repData);

        if (repData.userId && !userMap[repData.userId]) {
          try {
            const ures = await userService.getById(repData.userId);
            const payload = ures?.data;
            const u = payload?.data || payload || null;
            if (u) setUserMap((prev) => ({ ...prev, [repData.userId]: u }));
          } catch {}
        }

        if (repData.listingId) {
          const lres = await listingService.getById(repData.listingId);
          const payload = lres?.data;
          let detail = null;
          if (payload?.error === 0 && payload?.data) detail = payload.data;
          else if (payload && typeof payload === "object")
            detail = payload.data || payload;
          if (!active) return;
          setSelectedListing(detail);
        } else {
          setSelectedListing(null);
        }
      } catch (e) {
        if (!active) return;
        setDetailError(e?.message || "Đã xảy ra lỗi");
      } finally {
        if (active) setDetailLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ✅ Reset UI mỗi lần đổi report
  useEffect(() => {
    resetActionPanels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId || !detailSectionRef.current) return;
    detailSectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedId]);

  // Resolve seller of the reported listing
  const sellerInfo = useMemo(() => {
    return (
      extractSellerInfo(selectedListing) || {
        id: null,
        name: "-",
        email: "-",
        phone: "-",
      }
    );
  }, [selectedListing]);

  useEffect(() => {
    if (!selectedListing) return;
    const listingId =
      selectedListing?.id ??
      selectedListing?.listingId ??
      selectedReport?.listingId ??
      null;
    if (!listingId) return;
    const info = extractSellerInfo(selectedListing);
    if (!info) return;
    setReportedSellerMap((prev) => {
      const existing = prev[listingId];
      if (
        existing &&
        existing.name === info.name &&
        existing.email === info.email &&
        existing.phone === info.phone
      ) {
        return prev;
      }
      return { ...prev, [listingId]: info };
    });
  }, [selectedListing, selectedReport]);

  // Ban
  const doBan = async () => {
    if (!sellerInfo.id) return;
    if (!banReason.trim()) {
      showNotification?.("Vui lòng nhập lý do ban.", "warning");
      return;
    }
    setBanLoading(true);
    try {
      const res = await userManagementService.banUser(
        sellerInfo.id,
        banReason.trim()
      );
      if (res?.success && res?.data?.error === 0) {
        showNotification?.("Đã ban người bán.", "success");
        setBanMode(false);
        setBanReason("");
      } else {
        showNotification?.(
          res?.data?.message || res?.error || "Không thể ban người dùng.",
          "error"
        );
      }
    } catch (e) {
      showNotification?.(e?.message || "Có lỗi khi ban.", "error");
    } finally {
      setBanLoading(false);
    }
  };

  // Unban
  const doUnban = async () => {
    if (!sellerInfo.id) return;
    setUnbanLoading(true);
    try {
      const res = await userManagementService.unbanUser(sellerInfo.id);
      if (res?.success && res?.data?.error === 0) {
        showNotification?.("Đã gỡ ban người bán.", "success");
        setUnbanConfirmOpen(false);
      } else {
        showNotification?.(
          res?.data?.message || res?.error || "Không thể gỡ ban.",
          "error"
        );
      }
    } catch (e) {
      showNotification?.(e?.message || "Có lỗi khi gỡ ban.", "error");
    } finally {
      setUnbanLoading(false);
    }
  };

  /* ===============================================
     Evidence: ưu tiên row -> selectedReport -> API
     =============================================== */
  const openEvidence = async () => {
    if (!selectedId) return;
    setEvidenceOpen(true);
    setEvidenceLoading(true);
    setEvidenceError("");
    setEvidenceList([]);
    setEvidenceIndex(0);

    try {
      let urls = [];

      // (0) từ row đang chọn trong bảng
      const row = data.find((x) => String(x.id) === String(selectedId));
      if (row) {
        urls = [
          ...normalizeEvidence(row.reportImages),
          ...normalizeEvidence(row.images),
          ...normalizeEvidence(row.imageReport),
        ];
      }

      // (1) từ selectedReport
      if (!urls.length && selectedReport) {
        urls = [
          ...normalizeEvidence(selectedReport.reportImages),
          ...normalizeEvidence(selectedReport.images),
          ...normalizeEvidence(selectedReport.imageReport),
        ];
      }

      // (2) API riêng
      if (!urls.length) {
        const resp = await getReportEvidenceUrl(selectedId);
        urls = normalizeEvidence(resp);
      }

      if (urls.length) {
        const uniq = Array.from(new Set(urls));
        setEvidenceList(uniq);
      } else {
        setEvidenceError("Không tìm thấy ảnh bằng chứng.");
      }
    } catch (e) {
      setEvidenceError(e?.message || "Không tải được ảnh bằng chứng.");
    } finally {
      setEvidenceLoading(false);
    }
  };

  // ✅ Đóng chi tiết + dọn UI
  const onCloseDetail = () => {
    resetActionPanels();
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
            Quản lý bài đăng vi phạm
          </h2>
          <p className="text-sm text-slate-400">
            Theo dõi và xử lý các báo cáo vi phạm từ người dùng.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-slate-300">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              Trong trang:{" "}
              <span className="font-semibold text-slate-100">
                {data.length}
              </span>{" "}
              báo cáo
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-700/60 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              Đã lọc:{" "}
              <span className="font-semibold text-emerald-300">
                {filtered.length}
              </span>{" "}
              báo cáo
            </span>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ID, lý do, nội dung…"
              className="w-full rounded-lg border border-slate-700 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            Page size
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1 text-slate-200 cursor-pointer focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {[10, 20, 50, 100].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800/80 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin text-emerald-400" : "text-slate-400"
              }`}
            />
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 shadow-lg backdrop-blur-xl">
        {/* Filters row: Lý do (trái) + Đối tượng (phải) */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {/* Lọc theo lý do */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200">
            <Filter className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium">Lọc theo lý do:</span>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="bg-slate-900/70 text-xs text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="All">Tất cả</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {getReasonLabel(r)}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn đối tượng: Người báo cáo / Người bị báo cáo (bên phải) */}
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 p-1 shadow-inner shadow-black/40">
            {STATUS_FILTER_TARGETS.map((target) => {
              const active = statusFilterTarget === target.value;
              return (
                <button
                  key={target.value}
                  type="button"
                  onClick={() => setStatusFilterTarget(target.value)}
                  className={`rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  {target.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hàng dưới: Trạng thái tài khoản (Tất cả / Đang hoạt động / Ngưng hoạt động) */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-slate-500">
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 p-1 shadow-inner shadow-black/40">
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                      active
                        ? "bg-slate-100 text-slate-900 shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${tab.dotClass}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/70 bg-slate-950/60">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950/80">
              <tr>
                <Th>#</Th>
                <Th>ID báo cáo</Th>
                <Th>ID bài đăng</Th>
                <Th>Người báo cáo</Th>
                <Th>Người bị báo cáo</Th>
                <Th>Lý do</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-300"
                  >
                    Đang tải dữ liệu…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-rose-400"
                  >
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-300"
                  >
                    Không có báo cáo phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`cursor-pointer transition-colors ${
                      selectedId === String(r.id)
                        ? "bg-slate-800/70 ring-1 ring-emerald-500/50"
                        : "hover:bg-slate-900/60"
                    }`}
                    onClick={() => {
                      resetActionPanels();
                      setSearchParams({ id: r.id });
                    }}
                    title="Xem chi tiết báo cáo"
                  >
                    <Td className="w-14 text-xs text-slate-400">
                      {(pageIndex - 1) * pageSize + idx + 1}
                    </Td>
                    <TdMono>
                      <span
                        className="inline-block max-w-[180px] truncate"
                        title={r.id}
                      >
                        {r.id}
                      </span>
                    </TdMono>
                    <TdMono>
                      {r.listingId ? (
                        <Link
                          to={`/staff/reports?id=${r.id}`}
                          className="text-xs text-emerald-300 underline-offset-2 hover:text-emerald-200 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                          title="Xem chi tiết báo cáo"
                        >
                          {r.listingId}
                        </Link>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TdMono>
                    <Td>
                      {(() => {
                        const u = userMap[r.userId];
                        if (!u)
                          return (
                            <span className="text-xs text-slate-400">
                              Đang tải thông tin…
                            </span>
                          );
                        const statusValue = resolveUserStatus(u);
                        const statusMeta = statusValue
                          ? USER_STATUS_META[statusValue] || null
                          : null;
                        const StatusIcon = statusMeta?.Icon;
                        return (
                          <div className="flex items-start gap-2 text-xs leading-5">
                            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/80 text-slate-300">
                              <User className="h-3.5 w-3.5" />
                            </span>
                            <div>
                              <div className="font-medium text-slate-100">
                                {u.userName || u.name || "(Không tên)"}
                              </div>
                              <div className="font-mono text-[11px] text-slate-400">
                                {u.email || "-"}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {u.phoneNumber || "-"}
                              </div>
                              {statusValue && (
                                <span
                                  className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                    statusMeta?.className ||
                                    "border-slate-600/60 bg-slate-800/70 text-slate-200"
                                  }`}
                                >
                                  {StatusIcon && (
                                    <StatusIcon className="h-3 w-3" />
                                  )}
                                  {statusMeta?.label || statusValue}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </Td>
                    <Td>
                      {(() => {
                        if (!r.listingId)
                          return (
                            <span className="text-xs text-slate-400">
                              Không có ID bài đăng
                            </span>
                          );
                        const hasSeller = hasKey(
                          reportedSellerMap,
                          r.listingId
                        );
                        if (!hasSeller)
                          return (
                            <span className="text-xs text-slate-400">
                              Dan t? ngu?i b�n.
                            </span>
                          );
                        const seller = reportedSellerMap[r.listingId];
                        if (!seller)
                          return (
                            <span className="text-xs text-slate-400">
                              Chưa có dữ liệu người bị báo cáo.
                            </span>
                          );
                        const sellerStatusValue = resolveUserStatus(seller);
                        const sellerStatusMeta =
                          sellerStatusValue &&
                          USER_STATUS_META[sellerStatusValue]
                            ? USER_STATUS_META[sellerStatusValue]
                            : null;
                        const SellerStatusIcon = sellerStatusMeta?.Icon;
                        return (
                          <div className="flex items-start gap-2 text-xs leading-5">
                            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-950/40 text-rose-200">
                              <UserX className="h-3.5 w-3.5" />
                            </span>
                            <div>
                              <div className="font-medium text-slate-100">
                                {seller.name || "-"}
                              </div>
                              <div className="font-mono text-[11px] text-slate-400">
                                {seller.email || "-"}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {seller.phone || "-"}
                              </div>
                              {sellerStatusValue && (
                                <span
                                  className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                    sellerStatusMeta?.className ||
                                    "border-slate-600/60 bg-slate-800/70 text-slate-200"
                                  }`}
                                >
                                  {SellerStatusIcon && (
                                    <SellerStatusIcon className="h-3 w-3" />
                                  )}
                                  {sellerStatusMeta?.label || sellerStatusValue}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </Td>
                    <Td>
                      <div className="space-y-1">
                        <ReasonBadge value={r.reason} />
                        {r.otherReason && (
                          <p
                            className="max-w-xs truncate text-xs text-slate-300"
                            title={r.otherReason}
                          >
                            {r.otherReason}
                          </p>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            disabled={pageIndex <= 1 || loading}
            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Trang trước
          </button>
          <span className="text-sm text-slate-300">
            Trang{" "}
            <span className="font-semibold text-slate-100">{pageIndex}</span>
          </span>
          <button
            disabled={loading || data.length < pageSize}
            onClick={() => setPageIndex((p) => p + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trang sau
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Detail section */}
        {selectedId && (
          <div
            ref={detailSectionRef}
            className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3"
          >
            {/* Listing detail */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-md">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-slate-50">
                  Bài đăng bị báo cáo
                </h3>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 cursor-pointer"
                  onClick={onCloseDetail}
                  title="Đóng chi tiết"
                >
                  <X className="h-3 w-3" />
                  Đóng
                </button>
              </div>
              {detailLoading ? (
                <div className="text-sm text-slate-300">
                  Đang tải chi tiết bài đăng…
                </div>
              ) : detailError ? (
                <div className="text-sm text-rose-400">{detailError}</div>
              ) : selectedListing ? (
                <ReportListingDetail listing={selectedListing} />
              ) : (
                <div className="text-sm text-slate-300">
                  Không có dữ liệu bài đăng.
                </div>
              )}
            </div>

            {/* Report info + Actions */}
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-md space-y-4">
              <h3 className="text-lg font-semibold text-slate-50">
                Thông tin báo cáo
              </h3>
              {detailLoading ? (
                <div className="text-sm text-slate-300">Đang tải…</div>
              ) : selectedReport ? (
                <>
                  {/* Reporter */}
                  {(() => {
                    const u = userMap[selectedReport.userId] || null;
                    return (
                      <div className="space-y-2">
                        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Người báo cáo
                        </div>
                        <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-3 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-200">
                              <User className="h-4 w-4" />
                            </span>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-300">Tên</span>
                                <span className="font-medium text-slate-100">
                                  {u?.userName || u?.name || "-"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-300">Email</span>
                                <span className="font-mono text-[11px] text-slate-100">
                                  {u?.email || "-"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-300">
                                  Số điện thoại
                                </span>
                                <span className="text-slate-100">
                                  {u?.phoneNumber || "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Reported user (seller) */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Người bị báo cáo
                    </div>
                    <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full  bg-rose-950/40 text-rose-200">
                          <UserX className="h-4 w-4" />
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-300">Tên</span>
                            <span className="font-medium text-slate-100">
                              {sellerInfo.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-300">Email</span>
                            <span className="font-mono text-[11px] text-slate-100">
                              {sellerInfo.email}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-300">
                              Số điện thoại
                            </span>
                            <span className="text-slate-100">
                              {sellerInfo.phone}
                            </span>
                          </div>
                          {sellerInfo.id && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-300">Seller ID</span>
                              <span className="font-mono text-[11px]">
                                {sellerInfo.id}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason + Evidence button */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Lý do
                      </div>
                      <Button
                        onClick={openEvidence}
                        className="rounded-lg bg-sky-600/90 text-white hover:bg-sky-600 px-3 py-1.5 text-xs gap-1.5"
                        title="Xem hình ảnh / bằng chứng"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Bằng chứng
                      </Button>
                    </div>
                    <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100">
                      <ReasonBadge value={selectedReport.reason} />
                    </div>
                  </div>

                  {selectedReport.otherReason && (
                    <Info
                      label="Lý do khác (mô tả chi tiết)"
                      value={selectedReport.otherReason}
                    />
                  )}
                  <Info label="Report ID" value={selectedReport.id} mono />
                  {selectedReport.listingId && (
                    <Info
                      label="Listing ID"
                      value={selectedReport.listingId}
                      mono
                    />
                  )}

                  {/* Hành động */}
                  <div className="pt-2 border-t border-slate-800/70">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Hành động
                    </div>

                    {/* Ban form toggle */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => {
                          setBanMode((v) => !v);
                          setBanReason("");
                        }}
                        disabled={!sellerInfo.id}
                        className="rounded-xl bg-rose-500/90 text-white hover:bg-rose-500 gap-2 px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        title={
                          sellerInfo.id
                            ? `Cấm người bán (${sellerInfo.id})`
                            : "Không tìm thấy ID người bán"
                        }
                      >
                        <UserX className="h-4 w-4" /> Ban người bán
                      </Button>

                      <Button
                        onClick={() => setUnbanConfirmOpen(true)}
                        disabled={!sellerInfo.id}
                        className="rounded-xl bg-emerald-600/90 text-white hover:bg-emerald-600 gap-2 px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        title={
                          sellerInfo.id
                            ? `Gỡ cấm người bán (${sellerInfo.id})`
                            : "Không tìm thấy ID người bán"
                        }
                      >
                        <UserCheck className="h-4 w-4" /> Unban người bán
                      </Button>
                    </div>

                    {/* Ban form */}
                    {banMode && (
                      <div className="mt-3 rounded-xl border border-rose-600/40 bg-rose-500/10 p-3">
                        <label
                          htmlFor="banReason"
                          className="text-sm font-medium text-rose-200"
                        >
                          Lý do ban (bắt buộc)
                        </label>
                        <textarea
                          id="banReason"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          rows={3}
                          className="mt-2 w-full rounded-lg border border-rose-600/50 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/60"
                          placeholder="Nhập lý do chi tiết…"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            onClick={doBan}
                            disabled={banLoading || !banReason.trim()}
                            className="rounded-lg bg-rose-600 text-white hover:bg-rose-500 px-3 py-1.5 text-sm disabled:opacity-60"
                          >
                            {banLoading ? "Đang xử lý…" : "Xác nhận ban"}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setBanMode(false);
                              setBanReason("");
                            }}
                            className="rounded-lg border border-slate-700/60 bg-slate-900/50 text-slate-100 hover:bg-slate-800/70 px-3 py-1.5 text-sm"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-300">
                  Không có dữ liệu báo cáo.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Evidence Modal (duyệt ảnh, KHÔNG zoom) */}
      {evidenceOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEvidenceOpen(false);
          }}
        >
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
            <button
              onClick={() => setEvidenceOpen(false)}
              className=" cursor-pointer absolute right-3 top-3 rounded-full border border-slate-700/60 bg-slate-800/70 p-2 text-slate-100 hover:bg-slate-700/80"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-3 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-sky-400" />
              <h4 className="text-lg font-semibold text-slate-100">
                Ảnh bằng chứng
              </h4>
            </div>

            {evidenceLoading ? (
              <div className="py-10 text-center text-slate-300">
                Đang tải ảnh…
              </div>
            ) : evidenceError ? (
              <div className="py-6 text-center text-rose-400">
                {evidenceError}
              </div>
            ) : evidenceList.length ? (
              <>
                <div className="relative flex justify-center">
                  {/* Prev */}
                  {evidenceList.length > 1 && (
                    <button
                      onClick={() =>
                        setEvidenceIndex(
                          (i) =>
                            (i - 1 + evidenceList.length) % evidenceList.length
                        )
                      }
                      className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-slate-700/60 bg-slate-800/70 p-2 text-slate-100 hover:bg-slate-700/80"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  )}

                  <img
                    src={evidenceList[evidenceIndex]}
                    alt={`evidence-${evidenceIndex + 1}`}
                    className="max-h-[60vh] rounded-lg border border-slate-700 object-contain"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />

                  {/* Next */}
                  {evidenceList.length > 1 && (
                    <button
                      onClick={() =>
                        setEvidenceIndex((i) => (i + 1) % evidenceList.length)
                      }
                      className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-slate-700/60 bg-slate-800/70 p-2 text-slate-100 hover:bg-slate-700/80 cursor-pointer"
                      aria-label="Ảnh tiếp theo"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  )}
                </div>

                {/* Thumbnails */}
                {evidenceList.length > 1 && (
                  <div className="mt-3 flex justify-center gap-2 overflow-x-auto">
                    {evidenceList.map((u, i) => (
                      <button
                        key={u + i}
                        onClick={() => setEvidenceIndex(i)}
                        className={`h-14 w-20 flex-shrink-0 overflow-hidden rounded-md border ${
                          i === evidenceIndex
                            ? "border-sky-400 ring-2 ring-sky-400/40"
                            : "border-slate-700 hover:border-slate-500"
                        }`}
                        aria-label={`Xem ảnh ${i + 1}`}
                      >
                        <img
                          src={u}
                          alt={`thumb-${i}`}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-2 text-center text-xs text-slate-400">
                  {evidenceIndex + 1} / {evidenceList.length}
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-slate-300">
                Không có ảnh bằng chứng.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unban confirm */}
      {unbanConfirmOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setUnbanConfirmOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <h4 className="text-lg font-semibold text-slate-100">
              Xác nhận gỡ ban
            </h4>

            <p className="mt-2 text-sm text-slate-300">
              Bạn có chắc muốn gỡ ban người bán này?
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                className="rounded-lg border border-slate-700/60 bg-slate-900/50 text-slate-100 hover:bg-slate-800/70 px-3 py-1.5 text-sm"
                onClick={() => setUnbanConfirmOpen(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={doUnban}
                disabled={unbanLoading}
                className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 px-3 py-1.5 text-sm disabled:opacity-60"
              >
                {unbanLoading ? "Đang xử lý…" : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
