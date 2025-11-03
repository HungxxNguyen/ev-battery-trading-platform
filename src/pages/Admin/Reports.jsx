import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllReports, getReportById, REPORT_REASONS } from "../../services/apis/reportApi";
import listingService from "../../services/apis/listingApi";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import userService from "../../services/apis/userApi";

export default function ReportsAdminPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [reasonFilter, setReasonFilter] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(null); // report id
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [userMap, setUserMap] = useState({}); // cache user info by id

  const filtered = useMemo(() => {
    if (reasonFilter === "All") return data;
    return data.filter((x) => x.reason === reasonFilter);
  }, [data, reasonFilter]);

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
      setError(err?.response?.data?.message || err?.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  // Sync selected report id with URL (?id=)
  useEffect(() => {
    const idParam = searchParams.get("id");
    if ((idParam || null) !== (selectedId || null)) {
      setSelectedId(idParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fetch selected report + listing detail
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
        if (!repData) throw new Error(rep?.message || "Không lấy được thông tin báo cáo");
        if (!active) return;
        setSelectedReport(repData);

        // Ensure reporter info is cached
        if (repData.userId && !userMap[repData.userId]) {
          try {
            const ures = await userService.getById(repData.userId);
            const payload = ures?.data;
            const u = payload?.data || payload || null;
            if (u) setUserMap((prev) => ({ ...prev, [repData.userId]: u }));
          } catch {}
        }

        // Fetch listing
        if (repData.listingId) {
          const lres = await listingService.getById(repData.listingId);
          const payload = lres?.data;
          let detail = null;
          if (payload?.error === 0 && payload?.data) detail = payload.data;
          else if (payload && typeof payload === "object") detail = payload.data || payload;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Báo cáo bài đăng</h2>
          <p className="text-sm text-slate-300/80">Theo dõi và xử lý các báo cáo từ người dùng</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-300">
            Page size
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="ml-2 rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1 text-slate-200 cursor-pointer"
            >
              {[10, 20, 50, 100].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
        <div className="mb-3 flex items-center gap-3">
          <label className="text-sm text-slate-300">
            Lý do
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="ml-2 rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-slate-200 cursor-pointer"
            >
              <option value="All">Tất cả</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/70">
              <tr>
                <Th>#</Th>
                <Th>Report ID</Th>
                <Th>Listing</Th>
                <Th>Reporter</Th>
                <Th>Reason</Th>
                <Th>Other</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-300">Đang tải...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-300">Không có báo cáo</td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-900/40 cursor-pointer"
                    onClick={() => setSearchParams({ id: r.id })}
                    title="Xem chi tiết báo cáo"
                  >
                    <Td>{(pageIndex - 1) * pageSize + idx + 1}</Td>
                    <TdMono>{r.id}</TdMono>
                    <TdMono>
                      {r.listingId ? (
                        <Link
                          to={`/admin/reports?id=${r.id}`}
                          className="text-blue-400 hover:underline cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          title="Xem chi tiết báo cáo"
                        >
                          {r.listingId}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TdMono>
                    <Td>
                      {(() => {
                        const u = userMap[r.userId];
                        if (!u) return <span className="text-slate-400">Đang tải...</span>;
                        return (
                          <div className="text-xs leading-5">
                            <div className="text-slate-200 font-medium">{u.userName || u.name || "(Không tên)"}</div>
                            <div className="text-slate-400">{u.email || "-"}</div>
                            <div className="text-slate-400">{u.phoneNumber || "-"}</div>
                          </div>
                        );
                      })()}
                    </Td>
                    <Td>{r.reason}</Td>
                    <Td>{r.otherReason || ""}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={pageIndex <= 1 || loading}
            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trang trước
          </button>
          <span className="text-slate-300">Trang {pageIndex}</span>
          <button
            disabled={loading || data.length < pageSize}
            onClick={() => setPageIndex((p) => p + 1)}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trang sau
          </button>
        </div>

        {/* Detail section (same page) */}
        {selectedId && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Bài đăng</h3>
                <button
                  className="text-sm text-slate-300 hover:underline cursor-pointer"
                  onClick={() => setSearchParams({})}
                  title="Đóng chi tiết"
                >
                  Đóng
                </button>
              </div>
              {detailLoading ? (
                <div className="text-slate-300">Đang tải chi tiết…</div>
              ) : detailError ? (
                <div className="text-rose-400">{detailError}</div>
              ) : selectedListing ? (
                <ReportListingDetail listing={selectedListing} />
              ) : (
                <div className="text-slate-300">Không có dữ liệu bài đăng.</div>
              )}
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white">Thông tin báo cáo</h3>
              {detailLoading ? (
                <div className="text-slate-300">Đang tải…</div>
              ) : selectedReport ? (
                <>
                  <Info label="Report ID" value={selectedReport.id} mono />
                  <Info label="Listing ID" value={selectedReport.listingId} mono />
                  {(() => {
                    const u = userMap[selectedReport.userId] || null;
                    return (
                      <div>
                        <div className="text-sm text-slate-400">Người báo cáo</div>
                        <div className="mt-1 rounded-lg border border-slate-800/60 bg-slate-900/50 p-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-300">Tên</span>
                            <span className="text-slate-100 font-medium">{u?.userName || u?.name || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Email</span>
                            <span className="text-slate-100 font-mono text-xs">{u?.email || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Số điện thoại</span>
                            <span className="text-slate-100">{u?.phoneNumber || "-"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <Info label="Lý do" value={selectedReport.reason} />
                  {selectedReport.otherReason && (
                    <Info label="Lý do khác" value={selectedReport.otherReason} />
                  )}
                  {/* Quick links removed by request */}
                </>
              ) : (
                <div className="text-slate-300">Không có dữ liệu báo cáo.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-4 py-2 text-slate-200">{children}</td>;
}

function TdMono({ children }) {
  return (
    <td className="px-4 py-2 font-mono text-xs text-slate-300 break-all">
      {children}
    </td>
  );
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

  // Keyboard controls when lightbox open
  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % images.length);
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
          { label: "Dung lượng pin", value: listing?.batteryCapacity },
          { label: "Tầm hoạt động (km)", value: listing?.actualOperatingRange },
          { label: "Thời gian sạc (giờ)", value: listing?.chargingTime },
        ];
    }
  })();

  return (
    <div>
      <div className="overflow-hidden rounded-lg">
        <img
          src={images[active]}
          alt={listing?.title || "listing"}
          className="h-60 w-full object-cover cursor-zoom-in"
          onClick={() => {
            setLightboxIndex(active);
            setIsZoomed(false);
            setLightboxOpen(true);
          }}
        />
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-auto">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              className={`h-14 w-20 flex-shrink-0 overflow-hidden rounded border ${
                active === idx ? "border-blue-400" : "border-slate-800/60"
              }`}
            >
              <img src={src} alt={`thumb-${idx}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-start justify-between gap-3">
        <h4 className="text-white text-lg font-semibold">{listing?.title || "(Không tiêu đề)"}</h4>
        {listing?.price != null && (
          <div className="text-rose-300 font-semibold">
            {(Number(listing.price) || 0).toLocaleString("vi-VN")} VND
          </div>
        )}
      </div>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <Field label="Danh mục" value={listing?.category} />
        <Field label="Thương hiệu" value={brandName} />
        <Field label="Model" value={listing?.model} />
        <Field label="Khu vực" value={listing?.area} />
        <Field label="Năm sản xuất" value={listing?.yearOfManufacture} />
        <Field label="Tình trạng" value={listing?.listingStatus} />
      </div>

      {specFields?.length > 0 && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {specFields.map((f) => (
            <Field key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      )}

      {/* Seller (if available) */}
      {(listing?.user || listing?.sellerName) && (
        <div className="mt-3 rounded-lg border border-slate-800/60 bg-slate-900/50 p-3">
          <h5 className="mb-2 text-slate-200">Người bán</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <Field label="Tên" value={listing?.user?.userName || listing?.sellerName} />
            <Field label="Email" value={listing?.user?.email || listing?.sellerEmail} />
            <Field label="Số điện thoại" value={listing?.user?.phoneNumber || listing?.sellerPhone} />
          </div>
        </div>
      )}

      <div className="mt-3">
        <h5 className="mb-1 text-slate-200">Mô tả</h5>
        <div className="rounded-lg border border-slate-800/60 bg-slate-900/50 p-3 text-slate-300 text-sm whitespace-pre-line">
          {listing?.description || "Người bán chưa cập nhật mô tả."}
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-auto"
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
            className="absolute top-4 right-4 rounded-full bg-slate-900/70 border border-slate-700/60 p-2 text-slate-100 hover:bg-slate-800/80 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i - 1 + images.length) % images.length);
                setIsZoomed(false);
              }}
              aria-label="Ảnh trước"
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-slate-700/60 p-2 text-slate-100 hover:bg-slate-800/80 cursor-pointer"
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
                  ? "cursor-zoom-out w-auto h-auto"
                  : "cursor-zoom-in max-w-[90vw] max-h-[85vh] object-contain"
              }
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              draggable={false}
            />
            {images.length > 1 && (
              <div className="mt-3 text-center text-slate-200 text-sm">
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
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-slate-700/60 p-2 text-slate-100 hover:bg-slate-800/80 cursor-pointer"
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
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/60 bg-slate-900/50 px-3 py-2">
      <span className="text-slate-300">{label}</span>
      <span className="text-slate-100">{value ?? "-"}</span>
    </div>
  );
}

function Info({ label, value, mono }) {
  return (
    <div>
      <div className="text-sm text-slate-400">{label}</div>
      <div className={"text-slate-200 " + (mono ? "font-mono text-xs break-all" : "")}>{value ?? "-"}</div>
    </div>
  );
}
