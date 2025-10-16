// ===============================
// File: src/pages/Admin/ReviewPage.jsx
// ===============================
import React, { useEffect, useMemo, useState } from "react";
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
import { ArrowLeft } from "lucide-react";
import listingService from "../../services/apis/listingApi";
import Loading from "../../components/loading/Loading";
import { currency } from "../../utils/currency";
import { useNotification } from "../../contexts/NotificationContext";

const GLASS_CARD =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";

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

  // Reject flow
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { showNotification } = useNotification() || { showNotification: null };

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
  };

  const backToList = () => {
    setSelectedId(null);
    setRejectMode(false);
    setRejectReason("");
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
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Card className={GLASS_CARD}>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>Danh sách bài đăng ({status})</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                // Nếu Button có variant mặc định tô màu cyan, dùng ghost để trung tính
                variant="ghost"
                className={`cursor-pointer rounded-lg ${
                  status === "Pending"
                    ? "!bg-amber-500/80 !text-white hover:!bg-amber-500"
                    : "!bg-slate-800/70 !text-slate-200 hover:!bg-slate-700/70"
                }`}
                onClick={() => setStatus("Pending")}
              >
                Chờ Duyệt
              </Button>
              <Button
                className={`cursor-pointer rounded-lg ${
                  status === "Active"
                    ? "bg-emerald-500/80 text-white hover:bg-emerald-500"
                    : "bg-slate-800/70 text-slate-200 hover:bg-slate-700/70"
                }`}
                onClick={() => setStatus("Active")}
              >
                Đã Duyệt
              </Button>
              <Button
                className={`cursor-pointer rounded-lg ${
                  status === "Rejected"
                    ? "bg-rose-500/80 text-white hover:bg-rose-500"
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
            ) : (
              <Table className="text-slate-200">
                <TableHeader className="bg-slate-900/40 border-b border-slate-800/60 [&_th]:text-slate-300">
                  <TableRow>
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Danh mục
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Người bán
                    </TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="w-[140px]">Trạng thái</TableHead>
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
                      <TableCell className="font-mono text-xs">
                        {p.id}
                      </TableCell>
                      <TableCell className="font-medium text-primary underline">
                        {p.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.category}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {p.user?.userName || p.user?.email || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {currency(p.price)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {p.status === "Pending" ? (
                          <Badge className="px-2.5 py-1 bg-amber-500/80 text-white">
                            Đang chờ
                          </Badge>
                        ) : p.status === "Active" ? (
                          <Badge className="px-2.5 py-1 bg-emerald-500/80 text-white">
                            Đã duyệt
                          </Badge>
                        ) : (
                          <Badge className="px-2.5 py-1 bg-rose-500/80 text-white">
                            Đã từ chối
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                {selected?.listingImages?.length ? (
                  selected.listingImages.map((img) => (
                    <div
                      key={img.id}
                      className="overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/60"
                    >
                      <img
                        src={img.imageUrl}
                        alt="listing"
                        className="h-40 w-full object-cover"
                      />
                    </div>
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
            <Card className="bg-slate-900/30 border border-slate-800/60">
              <CardHeader className="pb-3">
                <CardTitle>Lý do từ chối</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
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
    </div>
  );
}
