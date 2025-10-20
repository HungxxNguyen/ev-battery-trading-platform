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
  // List state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Pending");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  // Selection + details
  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(
    () => items.find((x) => x.id === selectedId) || null,
    [items, selectedId]
  );
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const images = selected?.listingImages || [];

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);

  const prevImage = useCallback(() => {
    if (!images.length) return;
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const nextImage = useCallback(() => {
    if (!images.length) return;
    setLightboxIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, prevImage, nextImage]);

  // Reject flow
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { showNotification } = useNotification() || { showNotification: null };

  const rejectCardRef = useRef(null);
  const rejectTextareaRef = useRef(null);

  useEffect(() => {
    if (rejectMode) {
      // chờ phần tử mount xong rồi cuộn
      requestAnimationFrame(() => {
        rejectCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // focus sau khi cuộn để tránh giật
        setTimeout(() => {
          rejectTextareaRef.current?.focus({ preventScroll: true });
        }, 250);
      });
    }
  }, [rejectMode]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const res = await listingService.getByStatus({
      pageIndex,
      pageSize,
      from: 0,
      to: 1000000000,
      status,
    });
    if (res.success && res.data?.error === 0) {
      setItems(res.data.data || []);
    } else {
      setError(res.error || res.data?.message || "Không thể tải danh sách");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pageIndex, pageSize]);

  const onSelectListing = (id) => {
    setSelectedId(id);
    setRejectMode(false);
    setRejectReason("");
    setLightboxOpen(false);
    setLightboxIndex(0);
  };

  const backToList = () => {
    setSelectedId(null);
    setRejectMode(false);
    setRejectReason("");
    setLightboxOpen(false);
    setLightboxIndex(0);
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
    if (!rejectReason.trim()) {
      showNotification?.("Vui lòng nhập lý do từ chối", "warning");
      return;
    }
    const res = await listingService.rejectListing(id, rejectReason.trim());
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

  if (!selectedId) {
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
        <Card className={GLASS_CARD}>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>Danh sách bài đăng ({status})</CardTitle>

            {/* Nút filter trạng thái: kiểu segmented, rõ trạng thái đang chọn */}
            <div className="flex items-center gap-2">
              <Button
                variant={status === "Pending" ? "default" : "ghost"}
                aria-pressed={status === "Pending"}
                className={`cursor-pointer rounded-lg transition-colors
                ${
                  status === "Pending"
                    ? "!bg-amber-500/90 !text-white hover:!bg-amber-500"
                    : "!bg-slate-800/70 !text-slate-200 hover:!bg-slate-700/70"
                }`}
                onClick={() => setStatus("Pending")}
              >
                Chờ Duyệt
              </Button>

              <Button
                variant={status === "Active" ? "default" : "ghost"}
                aria-pressed={status === "Active"}
                className={`cursor-pointer rounded-lg transition-colors
                ${
                  status === "Active"
                    ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                    : "bg-slate-800/70 text-slate-200 hover:bg-slate-700/70"
                }`}
                onClick={() => setStatus("Active")}
              >
                Đã Duyệt
              </Button>

              <Button
                variant={status === "Rejected" ? "default" : "ghost"}
                aria-pressed={status === "Rejected"}
                className={`cursor-pointer rounded-lg transition-colors
                ${
                  status === "Rejected"
                    ? "bg-rose-500/90 text-white hover:bg-rose-500"
                    : "bg-slate-800/70 text-slate-200 hover:bg-slate-700/70"
                }`}
                onClick={() => setStatus("Rejected")}
              >
                Đã Từ Chối
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <Loading />
            ) : error ? (
              <div className="text-rose-400 text-sm">{error}</div>
            ) : items.length === 0 ? (
              <div className="text-slate-300 text-sm py-6 text-center">
                Không có bài đăng nào trong trạng thái này.
              </div>
            ) : (
              <div className="relative overflow-x-auto rounded-xl">
                {/* Header dính để dễ quét mắt */}
                <Table className="text-slate-200 text-center">
                  <TableHeader className="sticky top-0 z-10 bg-slate-900/60 backdrop-blur border-b border-slate-800/60 [&_th]:text-slate-300">
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
                      <TableHead className="w-[140px] text-center">
                        Tạo lúc
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="[&_tr:last-child]:border-0 [&>tr>td]:py-3">
                    {items.map((p) => (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer border-b border-slate-800/60 bg-slate-900/35 transition-colors hover:bg-slate-800/60"
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

                        {/* Nếu muốn tất cả canh giữa tuyệt đối, giữ text-center; nếu muốn UX hơn, có thể đổi riêng cột tiêu đề về text-left */}
                        <TableCell className="font-medium underline text-primary text-center">
                          <span
                            className="inline-block max-w-[320px] truncate align-middle"
                            title={p.title}
                          >
                            {p.title}
                          </span>
                        </TableCell>

                        <TableCell className="hidden md:table-cell text-center">
                          {p.category}
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
                        <TableCell className="hidden sm:table-cell text-xs text-slate-400">
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

  // Detail view
  const st = selected?.status || "Pending";

  return (
    <div className="mx-auto max-w-6xl space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-2xl text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={backToList}
            className="cursor-pointer rounded-full border border-slate-700/50 bg-slate-900/40 p-2 text-slate-100 hover:bg-slate-800/60"
            aria-label="Quay lại danh sách duyệt bài"
            title="Quay lại danh sách duyệt bài"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-white">
            Chi tiết duyệt bài
          </h2>
        </div>
        <div className="space-x-2">
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
                className="cursor-pointer rounded-lg bg-emerald-500/90 text-white hover:bg-emerald-500"
                onClick={() => doAccept(selected.id)}
              >
                Duyệt
              </Button>
              {!rejectMode ? (
                <Button
                  className="cursor-pointer rounded-lg bg-rose-500/90 text-white hover:bg-rose-500"
                  onClick={() => setRejectMode(true)}
                >
                  Từ chối
                </Button>
              ) : (
                <span />
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <Card className="bg-slate-900/30 border border-slate-800/60">
            <CardHeader className="pb-3">
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-lg font-semibold text-white">
                {selected?.title}
              </div>
              <div className="text-cyan-300/90">{selected?.category}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300">
                <div>
                  Giá bán:{" "}
                  <span className="font-medium">
                    {currency(selected?.price || 0)}
                  </span>
                </div>
                <div>
                  Trạng thái:{" "}
                  <span className="font-medium">{selected?.listingStatus}</span>
                </div>
                <div>
                  Model: <span className="font-medium">{selected?.model}</span>
                </div>
                <div>
                  Năm SX:{" "}
                  <span className="font-medium">
                    {selected?.yearOfManufacture}
                  </span>
                </div>
                <div>
                  Khu vực: <span className="font-medium">{selected?.area}</span>
                </div>
                <div>
                  Màu sắc:{" "}
                  <span className="font-medium">{selected?.color}</span>
                </div>
                <div>
                  Dung lượng pin:{" "}
                  <span className="font-medium">
                    {selected?.batteryCapacity}
                  </span>
                </div>
                <div>
                  Phạm vi hoạt động:{" "}
                  <span className="font-medium">
                    {selected?.actualOperatingRange}
                  </span>
                </div>
                <div>
                  Thời gian sạc:{" "}
                  <span className="font-medium">{selected?.chargingTime}</span>
                </div>
                <div>
                  Khối lượng:{" "}
                  <span className="font-medium">{selected?.mass}</span>
                </div>
              </div>
              <div className="text-sm text-slate-300">
                Mô tả:{" "}
                <span className="font-normal text-slate-200">
                  {selected?.description}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                Người đăng:{" "}
                <span className="font-medium">
                  {selected?.user?.userName || selected?.user?.email}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                Email:{" "}
                <span className="font-medium">
                  {selected?.user?.email || "Chua c?p nh?t"}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                Số điện thoại:{" "}
                <span className="font-medium">
                  {selected?.user?.phoneNumber || "Chưa cập nhật"}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                Thương hiệu:{" "}
                <span className="font-medium">{selected?.brand?.name}</span>
              </div>
              <div className="text-sm text-slate-300">
                Gói:{" "}
                <span className="font-medium">{selected?.package?.name}</span>
              </div>
            </CardContent>
          </Card>

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
                        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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

          {st === "Pending" && rejectMode && (
            <div ref={rejectCardRef}>
              <Card className="bg-slate-900/30 border border-slate-800/60">
                <CardHeader className="pb-3">
                  <CardTitle>Lý do từ chối</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    ref={rejectTextareaRef}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối..."
                    className="w-full rounded-lg bg-slate-950/60 border border-slate-800/60 p-3 outline-none text-slate-200"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      className="cursor-pointer rounded-lg bg-rose-500/90 text-white hover:bg-rose-500"
                      onClick={() => doReject(selected.id)}
                    >
                      Xác nhận từ chối
                    </Button>
                    <Button
                      variant="ghost"
                      className="cursor-pointer rounded-lg border border-slate-700/50 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60"
                      onClick={() => {
                        setRejectMode(false);
                        setRejectReason("");
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

        <div className="space-y-3">
          <Card className="bg-slate-900/30 border border-slate-800/60">
            <CardHeader className="pb-3">
              <CardTitle>Tổng quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>ID</span>
                <span className="font-mono text-xs">{selected?.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái</span>
                <span>{selected?.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Giá</span>
                <span className="font-medium">
                  {currency(selected?.price || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
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
          <button
            onClick={prevImage}
            aria-label="Ảnh trước"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-slate-700/60 p-2 text-slate-100 hover:bg-slate-800/80"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Image */}
          <div className="max-w-[90vw] max-h-[85vh]">
            <img
              src={images[lightboxIndex].imageUrl}
              alt={`Ảnh ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
              draggable={false}
            />
            <div className="mt-3 text-center text-slate-200 text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>

          {/* Next */}
          <button
            onClick={nextImage}
            aria-label="Ảnh tiếp theo"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-slate-700/60 p-2 text-slate-100 hover:bg-slate-800/80"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
