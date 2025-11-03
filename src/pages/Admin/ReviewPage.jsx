// ===============================
// File: src/pages/Admin/ReviewPage.jsx
// ===============================
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/Table/table";
import { Button } from "../../components/Button/button";
import { Badge } from "../../components/Badge/badge";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import listingService from "../../services/apis/listingApi";
import Loading from "../../components/loading/Loading";
import { currency } from "../../utils/currency";
import { useNotification } from "../../contexts/NotificationContext";

const GLASS_CARD =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";

// Tabs trạng thái
const STATUS_TABS = [
  { value: "Pending", label: "Chờ duyệt", dotClass: "bg-amber-400" },
  { value: "Active", label: "Đã duyệt", dotClass: "bg-emerald-400" },
  { value: "Rejected", label: "Đã từ chối", dotClass: "bg-rose-400" },
];

const STATUS_LABEL_MAP = {
  Pending: "Chờ duyệt",
  Active: "Đã duyệt",
  Rejected: "Đã từ chối",
};

// Format: DD-MM-YYYY, HH : mm
const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, "0");
  const Min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy}, ${HH}:${Min}`;
};

export default function ReviewPage() {
  const translateCategory = (value) =>
    ({
      RemovableBattery: "Pin điện rời",
      ElectricMotorbike: "Xe máy điện",
      ElectricCar: "Xe ô tô điện",
    }[value] || value);

  // List state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Pending");
  const [pageIndex] = useState(1);
  const [pageSize] = useState(10);

  // Selection + details
  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(() => {
    const sid = selectedId == null ? null : String(selectedId);
    return items.find((x) => String(x.id) === sid) || null;
  }, [items, selectedId]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Sync selectedId with URL (?id=)
  useEffect(() => {
    const idParam = searchParams.get("id");
    const parsed = idParam ?? null; // keep as string to avoid type mismatch
    if ((parsed || null) !== (selectedId || null)) {
      setSelectedId(parsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const images = selected?.listingImages || [];

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setIsZoomed(false);
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    setIsZoomed(false);
  };

  const prevImage = useCallback(() => {
    if (!images.length) return;
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const nextImage = useCallback(() => {
    if (!images.length) return;
    setLightboxIndex((i) => (i + 1) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, prevImage, nextImage]);

  // Reject flow
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [descriptionReject, setDescriptionReject] = useState("");

  const { showNotification } = useNotification() || { showNotification: null };

  const rejectCardRef = useRef(null);

  useEffect(() => {
    if (rejectMode) {
      requestAnimationFrame(() => {
        rejectCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [rejectMode]);

  // Description expand/collapse
  const [descExpanded, setDescExpanded] = useState(false);
  useEffect(() => {
    setDescExpanded(false);
  }, [selectedId]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listingService.getByStatus(pageIndex, pageSize, status);
      if (res.success && res.data?.error === 0) {
        setItems(res.data.data || []);
      } else {
        setError(
          res.error ||
            res.data?.message ||
            "Không thể tải danh sách bài đăng, vui lòng thử lại."
        );
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải danh sách, vui lòng thử lại.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pageIndex, pageSize]);

  const onSelectListing = (id) => {
    setSelectedId(String(id));
    setRejectMode(false);
    setRejectReason("");
    setDescriptionReject("");
    setLightboxOpen(false);
    setLightboxIndex(0);
    setIsZoomed(false);
    const next = new URLSearchParams(searchParams);
    next.set("id", String(id));
    setSearchParams(next);
  };

  const backToList = () => {
    setSelectedId(null);
    setRejectMode(false);
    setRejectReason("");
    setDescriptionReject("");
    setLightboxOpen(false);
    setLightboxIndex(0);
    setIsZoomed(false);
    const next = new URLSearchParams(searchParams);
    next.delete("id");
    setSearchParams(next, { replace: true });
  };

  const doAccept = async (id) => {
    const res = await listingService.acceptListing(id);
    if (res.success && res.data?.error === 0) {
      showNotification?.("Duyệt bài đăng thành công", "success");
      backToList();
      fetchData();
    } else {
      showNotification?.(
        res.data?.message || res.error || "Không thể duyệt bài đăng",
        "error"
      );
    }
  };

  const doReject = async (id) => {
    if (!rejectReason) {
      showNotification?.("Vui lòng chọn lý do từ chối", "warning");
      return;
    }
    if (!descriptionReject.trim()) {
      showNotification?.("Vui lòng nhập mô tả lý do từ chối", "warning");
      return;
    }
    const res = await listingService.rejectListing(
      id,
      rejectReason,
      descriptionReject
    );
    if (res.success && res.data?.error === 0) {
      showNotification?.("Từ chối bài đăng thành công", "success");
      backToList();
      fetchData();
    } else {
      showNotification?.(
        res.data?.message || res.error || "Không thể từ chối bài đăng",
        "error"
      );
    }
  };

  // ===============================
  // LIST VIEW
  // ===============================
  if (!selected) {
    const renderPaymentBadge = (s) => {
      switch (s) {
        case "Success":
          return (
            <Badge className="px-2.5 py-1 bg-emerald-500/80 text-white">
              Thành công
            </Badge>
          );
        case "Failed":
          return (
            <Badge className="px-2.5 py-1 bg-rose-500/80 text-white">
              Thất bại
            </Badge>
          );
        case "Expired":
          return (
            <Badge className="px-2.5 py-1 bg-slate-500/80 text-white">
              Hết hạn
            </Badge>
          );
        case "AwaitingPayment":
          return (
            <Badge className="px-2.5 py-1 bg-amber-500/80 text-white">
              Chờ thanh toán
            </Badge>
          );
        default:
          return (
            <Badge className="px-2.5 py-1 bg-slate-500/80 text-white">
              Chưa thanh toán
            </Badge>
          );
      }
    };

    const renderListingStatus = (s) => {
      if (s === "Pending")
        return (
          <Badge className="px-2.5 py-1 bg-amber-500/80 text-white">
            Đang chờ
          </Badge>
        );
      if (s === "Active")
        return (
          <Badge className="px-2.5 py-1 bg-emerald-500/80 text-white">
            Đã duyệt
          </Badge>
        );
      return (
        <Badge className="px-2.5 py-1 bg-rose-500/80 text-white">
          Đã từ chối
        </Badge>
      );
    };

    return (
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header page */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Duyệt bài đăng
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {STATUS_LABEL_MAP[status] || status} ·{" "}
              {loading ? "Đang tải..." : `${items.length} tin`}
            </p>
          </div>
        </div>

        <Card className={GLASS_CARD + " shadow-xl shadow-black/40"}>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Danh sách bài đăng
              </CardTitle>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Nhấn vào một dòng để mở chi tiết và duyệt/từ chối.
              </p>
            </div>

            {/* Tabs trạng thái */}
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 p-1 shadow-inner shadow-black/40">
              {STATUS_TABS.map((tab) => {
                const active = status === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatus(tab.value)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium cursor-pointer transition-all
                    ${
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
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-10">
                <Loading />
              </div>
            ) : error ? (
              <div className="text-rose-400 text-sm py-4 text-center">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="text-slate-300 text-sm py-6 text-center">
                Không có bài đăng nào trong trạng thái này.
              </div>
            ) : (
              <div className="relative overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-950/40">
                <Table className="text-slate-200 text-center">
                  <TableHeader className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-slate-800/60 [&_th]:text-slate-300">
                    <TableRow>
                      <TableHead className="w-[120px] text-center">
                        ID
                      </TableHead>
                      <TableHead className="text-center">Tiêu đề</TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        Danh mục
                      </TableHead>
                      <TableHead className="hidden lg:table-cell text-center">
                        Người bán
                      </TableHead>
                      <TableHead className="hidden lg:table-cell text-center">
                        Thanh toán
                      </TableHead>
                      <TableHead className="text-center">Giá</TableHead>
                      <TableHead className="w-[140px] text-center">
                        Trạng thái
                      </TableHead>
                      <TableHead className="w-[160px] text-center">
                        Tạo lúc
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="[&_tr:last-child]:border-0 [&>tr>td]:py-3">
                    {items.map((p) => (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer border-b border-slate-800/60 odd:bg-slate-900/40 even:bg-slate-900/20 transition-colors hover:bg-slate-800/70"
                        onClick={() => onSelectListing(p.id)}
                        title="Mở chi tiết bài đăng"
                      >
                        <TableCell className="font-mono text-xs text-center">
                          <span
                            className="inline-block max-w-[108px] truncate align-middle"
                            title={p.id}
                          >
                            {p.id}
                          </span>
                        </TableCell>

                        <TableCell className="font-medium text-primary text-center">
                          <span
                            className="inline-block max-w-[320px] truncate align-middle underline decoration-slate-500/60 decoration-dotted"
                            title={p.title}
                          >
                            {p.title}
                          </span>
                        </TableCell>

                        <TableCell className="hidden md:table-cell text-center">
                          {translateCategory(p.category)}
                        </TableCell>

                        <TableCell className="hidden lg:table-cell text-center">
                          {p.user?.userName || p.user?.email || "-"}
                        </TableCell>

                        <TableCell className="hidden lg:table-cell text-center">
                          {renderPaymentBadge(p.paymentStatus)}
                        </TableCell>

                        <TableCell className="text-center">
                          {currency(p.price)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-center">
                          {renderListingStatus(p.status)}
                        </TableCell>

                        <TableCell className="hidden sm:table-cell text-xs text-slate-400 text-center">
                          {formatDateTime(p.createdAt || p.creationDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===============================
  // DETAIL VIEW
  // ===============================
  const st = selected?.status || "Pending";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 sm:p-6 backdrop-blur-2xl text-slate-100 shadow-xl shadow-black/40">
        {/* Header chi tiết */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={backToList}
              className="cursor-pointer flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/40 px-3 py-1.5 text-slate-100 hover:bg-slate-800/70"
              aria-label="Quay lại danh sách duyệt bài"
              title="Quay lại danh sách duyệt bài"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Quay lại</span>
            </Button>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-white">
                Chi tiết duyệt bài
              </h2>
              <p className="text-xs text-slate-400">
                ID:{" "}
                <span className="font-mono text-[11px]">
                  {selected?.id || "-"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              className={
                st === "Active"
                  ? "bg-emerald-500/80 text-white"
                  : st === "Rejected"
                  ? "bg-rose-500/80 text-white"
                  : "bg-amber-500/80 text-white"
              }
            >
              {st === "Active"
                ? "Đã duyệt"
                : st === "Rejected"
                ? "Đã từ chối"
                : "Đang chờ"}
            </Badge>

            {st === "Pending" && (
              <>
                <Button
                  className="cursor-pointer rounded-lg bg-emerald-500/90 text-white hover:bg-emerald-500 px-3 py-1.5 text-sm"
                  onClick={() => doAccept(selected.id)}
                >
                  Duyệt
                </Button>
                {!rejectMode && (
                  <Button
                    className="cursor-pointer rounded-lg bg-rose-500/90 text-white hover:bg-rose-500 px-3 py-1.5 text-sm"
                    onClick={() => setRejectMode(true)}
                  >
                    Từ chối
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Nội dung chi tiết */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            {/* Thông tin chi tiết */}
            <Card className="bg-slate-900/30 border border-slate-800/60">
              <CardHeader className="pb-3">
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-lg font-semibold text-white">
                    {selected?.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Tạo lúc:{" "}
                    {formatDateTime(
                      selected?.createdAt || selected?.creationDate
                    )}
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-xs text-cyan-200">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span>{translateCategory(selected?.category)}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300">
                  <div>
                    Giá bán:{" "}
                    <span className="font-medium">
                      {currency(selected?.price || 0)}
                    </span>
                  </div>
                  <div>
                    Trạng thái tin:{" "}
                    <span className="font-medium">
                      {selected?.listingStatus}
                    </span>
                  </div>
                  <div>
                    Model:{" "}
                    <span className="font-medium">
                      {selected?.model || "-"}
                    </span>
                  </div>
                  <div>
                    Năm SX:{" "}
                    <span className="font-medium">
                      {selected?.yearOfManufacture || "-"}
                    </span>
                  </div>
                  <div>
                    Khu vực:{" "}
                    <span className="font-medium">{selected?.area || "-"}</span>
                  </div>
                  <div>
                    Màu sắc:{" "}
                    <span className="font-medium">
                      {selected?.color || "-"}
                    </span>
                  </div>
                  <div>
                    Dung lượng pin:{" "}
                    <span className="font-medium">
                      {selected?.batteryCapacity || "-"}
                    </span>
                  </div>
                  <div>
                    Phạm vi hoạt động:{" "}
                    <span className="font-medium">
                      {selected?.actualOperatingRange || "-"}
                    </span>
                  </div>
                  <div>
                    Thời gian sạc:{" "}
                    <span className="font-medium">
                      {selected?.chargingTime || "-"}
                    </span>
                  </div>
                  <div>
                    Khối lượng:{" "}
                    <span className="font-medium">{selected?.mass || "-"}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-800/60 my-2" />

                <div className="space-y-1 text-sm text-slate-300">
                  <div>
                    Người đăng:{" "}
                    <span className="font-medium">
                      {selected?.user?.userName || selected?.user?.email || "-"}
                    </span>
                  </div>
                  <div>
                    Email:{" "}
                    <span className="font-medium">
                      {selected?.user?.email || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div>
                    Số điện thoại:{" "}
                    <span className="font-medium">
                      {selected?.user?.phoneNumber || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div>
                    Thương hiệu:{" "}
                    <span className="font-medium">
                      {selected?.brand?.name || "-"}
                    </span>
                  </div>
                  <div>
                    Gói đăng tin:{" "}
                    <span className="font-medium">
                      {selected?.package?.name || "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hình ảnh */}
            <Card className="bg-slate-900/30 border border-slate-800/60">
              <CardHeader className="pb-3">
                <CardTitle>Hình ảnh tin đăng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {images.length ? (
                    images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => openLightbox(idx)}
                        title="Xem ảnh lớn"
                        className="group overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/60 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                      >
                        <img
                          src={img.imageUrl}
                          alt={`listing-${idx + 1}`}
                          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400">
                      Không có hình ảnh
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mô tả bài đăng */}
            <Card className="bg-slate-900/30 border border-slate-800/60">
              <CardHeader className="pb-3">
                <CardTitle>Mô tả bài đăng</CardTitle>
              </CardHeader>
              <CardContent>
                {selected?.description &&
                typeof selected.description === "string" &&
                selected.description.trim() !== "" ? (
                  <div className="relative">
                    <p
                      className={`text-slate-200 leading-relaxed whitespace-pre-line transition-all ${
                        descExpanded ? "max-h-none" : "max-h-40 overflow-hidden"
                      }`}
                    >
                      {selected.description}
                    </p>

                    {!descExpanded &&
                      typeof selected.description === "string" &&
                      selected.description.length > 240 && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900/40 to-transparent" />
                      )}

                    {typeof selected.description === "string" &&
                      selected.description.length > 240 && (
                        <button
                          type="button"
                          onClick={() => setDescExpanded((v) => !v)}
                          className="mt-3 text-sm font-medium text-cyan-300 hover:text-cyan-200 cursor-pointer"
                        >
                          {descExpanded ? "Thu gọn" : "Xem thêm"}
                        </button>
                      )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Người bán chưa cập nhật mô tả chi tiết.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Form từ chối */}
            {st === "Pending" && rejectMode && (
              <div ref={rejectCardRef}>
                <Card className="bg-slate-900/30 border border-slate-800/60">
                  <CardHeader className="pb-3">
                    <CardTitle>Lý do từ chối</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="reasonReject"
                        className="text-sm font-medium text-slate-200"
                      >
                        Chọn lý do:
                      </label>
                      <select
                        id="reasonReject"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full rounded-lg bg-slate-950/60 border border-slate-800/60 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/60"
                      >
                        <option value="">-- Chọn lý do từ chối --</option>
                        <option value="CATEGORY_MISMATCH">
                          Đăng sai danh mục (ô tô/xe máy/pin rời)
                        </option>
                        <option value="INFORMATION_MISSING">
                          Thiếu thông tin cụ thể
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="descriptionReject"
                        className="text-sm font-medium text-slate-200"
                      >
                        Mô tả thêm (bắt buộc):
                      </label>
                      <textarea
                        id="descriptionReject"
                        value={descriptionReject}
                        onChange={(e) => setDescriptionReject(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-slate-950/60 border border-slate-800/60 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/60"
                        rows={3}
                        placeholder="Mô tả chi tiết lý do từ chối để người đăng hiểu rõ hơn."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        className="cursor-pointer rounded-lg bg-rose-500/90 text-white hover:bg-rose-500 px-3 py-1.5 text-sm"
                        onClick={() => doReject(selected.id)}
                      >
                        Xác nhận từ chối
                      </Button>
                      <Button
                        variant="ghost"
                        className="cursor-pointer rounded-lg border border-slate-700/50 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60 px-3 py-1.5 text-sm"
                        onClick={() => {
                          setRejectMode(false);
                          setRejectReason("");
                          setDescriptionReject("");
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Cột tổng quan bên phải */}
          <div className="space-y-3">
            <Card className="bg-slate-900/30 border border-slate-800/60">
              <CardHeader className="pb-3">
                <CardTitle>Tổng quan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-lg bg-slate-950/70 px-3 py-2">
                  <span>ID</span>
                  <span className="font-mono text-[11px] max-w-[160px] truncate text-right">
                    {selected?.id}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-950/70 px-3 py-2">
                  <span>Trạng thái</span>
                  <span>
                    {st === "Active"
                      ? "Đã duyệt"
                      : st === "Rejected"
                      ? "Đã từ chối"
                      : "Đang chờ"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-950/70 px-3 py-2">
                  <span>Giá đăng</span>
                  <span className="font-medium">
                    {currency(selected?.price || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-950/70 px-3 py-2">
                  <span>Danh mục</span>
                  <span className="text-right">
                    {translateCategory(selected?.category)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-950/70 px-3 py-2">
                  <span>Ngày tạo</span>
                  <span className="text-right text-xs text-slate-400">
                    {formatDateTime(
                      selected?.createdAt || selected?.creationDate
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lightbox ảnh */}
        {lightboxOpen && images.length > 0 && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh gốc"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              aria-label="Đóng"
              className="absolute top-4 right-4 rounded-full bg-slate-900/70 border border-slate-700/60 p-2 text-slate-100 hover:bg-slate-800/80"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                aria-label="Ảnh trước"
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-slate-700/60 p-2 text-slate-100 hover:bg-slate-800/80"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Image */}
            <div className="flex flex-col items-center">
              <img
                src={images[lightboxIndex].imageUrl}
                alt={`Ảnh ${lightboxIndex + 1}`}
                className={`rounded-lg shadow-2xl ${
                  isZoomed
                    ? "cursor-zoom-out w-auto h-auto"
                    : "cursor-zoom-in max-w-[90vw] max-h-[85vh] object-contain"
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
                draggable={false}
              />
              <div className="mt-3 text-center text-slate-200 text-sm">
                {lightboxIndex + 1} / {images.length}
              </div>
            </div>

            {/* Next */}
            {images.length > 1 && (
              <button
                onClick={nextImage}
                aria-label="Ảnh tiếp theo"
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-slate-700/60 p-2 text-slate-100 hover:bg-slate-800/80"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
