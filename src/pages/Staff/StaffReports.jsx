// ===============================
// File: src/pages/Staff/StaffReports.jsx
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getAllReports,
  getReportById,
  REPORT_REASONS,
} from "../../services/apis/reportApi";
import listingService from "../../services/apis/listingApi";
import userService from "../../services/apis/userApi";
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
} from "lucide-react";

export default function StaffReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [reasonFilter, setReasonFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(null); // report id
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [userMap, setUserMap] = useState({}); // cache user info by id

  const filtered = useMemo(() => {
    let result = data;
    if (reasonFilter !== "All")
      result = result.filter((x) => x.reason === reasonFilter);
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
  }, [data, reasonFilter, searchTerm]);

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
  }, [selectedId]);

  // Helper to resolve Seller of the reported listing
  const sellerInfo = (() => {
    const u = selectedListing?.user || null;
    const id =
      u?.id ?? selectedListing?.userId ?? selectedListing?.sellerId ?? null;
    const name = u?.userName || u?.name || selectedListing?.sellerName || "-";
    const email = u?.email || selectedListing?.sellerEmail || "-";
    const phone = u?.phoneNumber || selectedListing?.sellerPhone || "-";
    return { id, name, email, phone };
  })();

  const onBanClick = () => {
    if (!sellerInfo.id) return;
    // Stub only: no API call per requirement
    alert(`(Stub) Ban người bán với ID: ${sellerInfo.id}.\nChưa kết nối API.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
            Báo cáo bài đăng
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
        {/* Filters row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
                  {r}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500">
            Nhấp vào một dòng để xem chi tiết báo cáo & bài đăng ở bên dưới.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/70 bg-slate-950/60">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950/80">
              <tr>
                <Th>#</Th>
                <Th>Report</Th>
                <Th>Listing</Th>
                <Th>Người báo cáo</Th>
                <Th>Lý do</Th>
                <Th>Thông tin thêm</Th>
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
                    onClick={() => setSearchParams({ id: r.id })}
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
                            </div>
                          </div>
                        );
                      })()}
                    </Td>
                    <Td>
                      <ReasonBadge value={r.reason} />
                    </Td>
                    <Td>
                      <p
                        className="max-w-xs truncate text-xs text-slate-300"
                        title={r.otherReason}
                      >
                        {r.otherReason || "—"}
                      </p>
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
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Listing detail */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-md">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-slate-50">
                  Bài đăng bị báo cáo
                </h3>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 cursor-pointer"
                  onClick={() => setSearchParams({})}
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

            {/* Report info + Ban button */}
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-md space-y-4">
              <h3 className="text-lg font-semibold text-slate-50">
                Thông tin báo cáo
              </h3>
              {detailLoading ? (
                <div className="text-sm text-slate-300">Đang tải…</div>
              ) : selectedReport ? (
                <>
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
                  <Info
                    label="Lý do"
                    value={<ReasonBadge value={selectedReport.reason} />}
                  />
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

                  {/* Ban Seller (stub) */}
                  <div className="pt-2 border-t border-slate-800/70">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Hành động
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={onBanClick}
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
                      <span className="text-xs text-slate-400">
                        (Chưa kết nối API)
                      </span>
                    </div>
                    {sellerInfo?.id && (
                      <div className="mt-2 rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
                        <div className="flex items-center justify-between">
                          <span>Seller ID</span>
                          <span className="font-mono text-[11px]">
                            {sellerInfo.id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tên</span>
                          <span>{sellerInfo.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Email</span>
                          <span className="font-mono text-[11px]">
                            {sellerInfo.email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>SĐT</span>
                          <span>{sellerInfo.phone}</span>
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
    </div>
  );
}

/* Small helpers (kept same as Admin/Reports) */
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
  const text = String(value);
  const lower = text.toLowerCase();
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

function ReportListingDetail({ listing }) {
  const rawImages = Array.isArray(listing?.listingImages)
    ? listing.listingImages
        .map((i) => (typeof i === "string" ? i : i?.imageUrl || i?.url || ""))
        .filter(Boolean)
    : [];
  const images = rawImages.length
    ? rawImages
    : ["https://placehold.co/1200x800?text=Listing"];
  const [active, setActive] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);

  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i + 1) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, images.length]);

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
      {/* Preview image + thumbnails */}
      <div className="overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950/60">
        <img
          src={images[active]}
          alt={listing?.title || "listing"}
          className="h-60 w-full cursor-zoom-in object-cover"
          onClick={() => {
            setLightboxIndex(active);
            setIsZoomed(false);
            setLightboxOpen(true);
          }}
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-auto">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border transition ${
                active === idx
                  ? "border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.35)]"
                  : "border-slate-800/70 hover:border-slate-600"
              }`}
            >
              <img
                src={src}
                alt={`thumb-${idx}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-auto bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh lớn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Đóng"
            className="absolute right-4 top-4 cursor-pointer rounded-full border border-slate-700/60 bg-slate-900/70 p-2 text-slate-100 hover:bg-slate-800/80"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(
                  (i) => (i - 1 + images.length) % images.length
                );
                setIsZoomed(false);
              }}
              aria-label="Ảnh trước"
              className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-slate-700/60 bg-slate-900/70 p-2 text-slate-100 hover:bg-slate-800/80 md:left-8"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="flex flex-col items-center">
            <img
              src={images[lightboxIndex]}
              alt={`image-${lightboxIndex + 1}`}
              className={
                isZoomed
                  ? "h-auto w-auto cursor-zoom-out"
                  : "max-h-[85vh] max-w-[90vw] cursor-zoom-in object-contain"
              }
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              draggable={false}
            />
            {images.length > 1 && (
              <div className="mt-3 text-sm text-slate-200">
                {lightboxIndex + 1} / {images.length}
              </div>
            )}
          </div>
          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i + 1) % images.length);
                setIsZoomed(false);
              }}
              aria-label="Ảnh tiếp theo"
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-slate-700/60 bg-slate-900/70 p-2 text-slate-100 hover:bg-slate-800/80 md:right-8"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
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
