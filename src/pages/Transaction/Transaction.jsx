import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowUpRight,
} from "react-icons/fi";
import { AuthContext } from "../../contexts/AuthContext";
import transactionService from "../../services/apis/transactionApi";
import listingService from "../../services/apis/listingApi";
import { currency } from "../../utils/currency";

const FALLBACK_IMAGE = "https://placehold.co/160?text=Listing";

const ORDER_TABS = [{ key: "orders", label: "Đơn hàng" }];

// Normalize backend status to UI tokens
const asStatusToken = (raw) => {
  switch (String(raw || "").toLowerCase()) {
    case "success":
      return "success";
    case "failed":
    case "canceled":
    case "cancelled":
    case "expired":
      return "failed";
    case "pending":
    case "awaitingpayment":
    default:
      return "pending";
  }
};

const STATUS_TOKEN = {
  success: {
    label: "Thành công",
    icon: <FiCheckCircle className="mr-1" />,
    pill: "bg-green-50 text-green-700 border border-green-200",
    amountColor: "text-green-600",
  },
  failed: {
    label: "Thất bại",
    icon: <FiXCircle className="mr-1" />,
    pill: "bg-red-50 text-red-700 border border-red-200",
    amountColor: "text-red-600",
  },
  pending: {
    label: "Chờ xử lý",
    icon: <FiClock className="mr-1" />,
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    amountColor: "text-amber-600",
  },
};

const formatVNDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${time} - ${day}/${month}/${year}`;
};

const toCardModel = (tx) => {
  const listing = tx?.listing || {};
  // Resolve thumbnail robustly from multiple possible fields
  let ImageUrl =
    listing?.thumbnail ||
    listing?.ImageUrl ||
    (Array.isArray(listing?.images) && listing.images.find(Boolean)) ||
    (Array.isArray(listing?.listingImages)
      ? listing.listingImages
          .map((i) => (typeof i === "string" ? i : i?.ImageUrl || i?.url || ""))
          .find(Boolean)
      : null) ||
    tx?.ImageUrl ||
    tx?.thumbnail ||
    FALLBACK_IMAGE;
  const title = listing?.title || "Tin đăng";
  const pkgName = tx?.package?.name || listing?.package?.name || "";
  const finalTitle = pkgName ? `${title} • ${pkgName}` : title;
  const orderCode = tx?.paymentId
    ? String(tx.paymentId).slice(0, 8).toUpperCase()
    : "";
  const channel = listing?.paymentMethod || tx?.paymentMethod || "";
  const statusKey = asStatusToken(tx?.status);
  const statusNote = tx?.notes || "";
  const time = formatVNDateTime(tx?.transactionDate);
  const amount = Number(tx?.amount || 0);
  const listingId =
    listing?.id || listing?.Id || tx?.listingId || tx?.ListingId || null;
  return {
    id: orderCode || String(tx?.paymentId || Math.random()),
    title: finalTitle,
    orderCode,
    time,
    amount,
    status: statusKey,
    statusNote,
    productThumb: ImageUrl,
    channel,
    listingId,
    manageHref: listingId ? `/manage-listing/${listingId}` : null,
    publicHref: listingId ? `/listing/${listingId}` : null,
  };
};

const TransactionCard = ({ item }) => {
  const statusInfo = STATUS_TOKEN[item.status] ?? STATUS_TOKEN.pending;

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="relative flex-shrink-0 w-full sm:w-32">
        <Link
          to={item.manageHref || "#"}
          onClick={(e) => !item.manageHref && e.preventDefault()}
        >
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
            <img
              src={item.productThumb}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>
        {item.channel && (
          <span className="absolute -bottom-3 left-3 flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <FiArrowUpRight /> {item.channel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            {item.manageHref ? (
              <Link
                to={item.manageHref}
                className="text-lg font-semibold text-gray-900 leading-snug hover:text-blue-600"
              >
                {item.title}
              </Link>
            ) : (
              <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                {item.title}
              </h3>
            )}
            <div className="mt-2 grid gap-x-8 gap-y-1 text-sm text-gray-600 sm:grid-cols-2">
              {item.orderCode && (
                <span>
                  <span className="text-gray-500">Mã đơn hàng:</span>{" "}
                  {item.orderCode}
                </span>
              )}
              {item.time && (
                <span>
                  <span className="text-gray-500">Thời gian:</span> {item.time}
                </span>
              )}
              {item.channel && (
                <span>
                  <span className="text-gray-500">Kênh thanh toán:</span>{" "}
                  {item.channel}
                </span>
              )}
            </div>
            {item.manageHref && (
              <div className="mt-3">
                <Link
                  to={item.manageHref}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Xem chi tiết bài đăng <FiArrowUpRight />
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`text-xl font-bold ${statusInfo.amountColor}`}>
              {currency(item.amount)}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.pill}`}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>
            {item.statusNote && (
              <span className="text-xs text-gray-500">{item.statusNote}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col sm:flex-row gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
    <div className="relative flex-shrink-0 w-full sm:w-32">
      <div className="aspect-square w-full rounded-xl bg-gray-100 border border-gray-200" />
    </div>
    <div className="flex flex-1 flex-col gap-4">
      <div className="h-5 w-2/3 bg-gray-100 rounded" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-4 bg-gray-100 rounded" />
        <div className="h-4 bg-gray-100 rounded" />
        <div className="h-4 bg-gray-100 rounded" />
        <div className="h-4 bg-gray-100 rounded" />
      </div>
    </div>
  </div>
);

const Transaction = () => {
  const { user } = useContext(AuthContext) || {};
  const userId = user?.id;

  const [activeTab] = useState("orders");
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        setError("");
        const resp = await transactionService.getByUserId(
          userId,
          pageIndex,
          pageSize
        );
        if (!mounted) return;
        if (resp?.success) {
          const payload = resp.data;
          const raw = Array.isArray(payload?.data) ? payload.data : [];

          // Enrich transactions with listing detail if backend omitted it
          let enriched = [...raw];
          const needFetch = enriched.filter(
            (t) => !t?.listing && (t?.listingId || t?.ListingId)
          );
          if (needFetch.length) {
            const results = await Promise.all(
              needFetch.map(async (t) => {
                const id = t.listingId || t.ListingId;
                try {
                  const res = await listingService.getById(id);
                  const data = res?.data?.data || res?.data || null;
                  return { id, listing: data };
                } catch {
                  return { id, listing: null };
                }
              })
            );
            enriched = enriched.map((t) => {
              const id = t.listingId || t.ListingId;
              const hit = results.find((r) => r.id === id && r.listing);
              return hit ? { ...t, listing: hit.listing } : t;
            });
          }

          setItems(enriched.map(toCardModel));
          const total =
            typeof payload?.count === "number" ? payload.count : raw.length;
          setCount(total);
        } else {
          setError(resp?.error || "Không thể tải giao dịch");
          setItems([]);
          setCount(0);
        }
      } catch (e) {
        if (!mounted) return;
        setError("Lỗi khi tải giao dịch");
        setItems([]);
        setCount(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [userId, pageIndex, pageSize]);

  const stats = useMemo(() => {
    const success = items.filter((t) => t.status === "success");
    const totalAmount = success.reduce(
      (acc, cur) => acc + (Number(cur.amount) || 0),
      0
    );
    return {
      totalSuccess: success.length,
      totalAmount,
      totalOrders:
        typeof count === "number" && count >= items.length
          ? count
          : items.length,
    };
  }, [items, count]);

  const totalPages = Math.max(
    1,
    Math.ceil((count || items.length || 1) / pageSize)
  );
  const canPrev = pageIndex > 1;
  const canNext = pageIndex < totalPages; // advance while we know total pages

  return (
    <MainLayout>
      <div className="bg-white min-h-screen py-8">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 space-y-8">
          {/* Header */}
          <header className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="mt-3 text-3xl font-bold text-gray-800">
                  Lịch sử giao dịch
                </h1>
                <p className="mt-2 text-base text-gray-600 max-w-xl">
                  Theo dõi trạng thái thanh toán cho các gói và dịch vụ của tin
                  đăng.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Tổng đơn
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-green-700">
                    Đã thanh toán
                  </p>
                  <p className="mt-2 text-2xl font-bold text-green-700">
                    {stats.totalSuccess}
                  </p>
                </div>
                <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Doanh thu thành công
                      </p>
                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {currency(stats.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="pageSize"
                        className="text-sm text-gray-600"
                      >
                        Hiển thị
                      </label>
                      <select
                        id="pageSize"
                        value={pageSize}
                        onChange={(e) => {
                          setPageIndex(1);
                          setPageSize(Number(e.target.value));
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Tabs (reserved for future filters) */}
          <div className="flex items-center gap-2">
            {ORDER_TABS.map((t) => (
              <button
                key={t.key}
                className={`px-4 py-2 rounded-full border text-sm ${
                  t.key === activeTab
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {loading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                Chưa có giao dịch nào.
              </div>
            )}

            {!loading &&
              !error &&
              items.map((it) => <TransactionCard key={it.id} item={it} />)}
          </div>

          {/* Pagination */}
          {!loading && !error && items.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-600">
                Trang {pageIndex}/{totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!canPrev}
                  onClick={() =>
                    canPrev && setPageIndex((p) => Math.max(1, p - 1))
                  }
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    canPrev
                      ? "bg-white border-gray-300 text-gray-700"
                      : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Trước
                </button>
                <button
                  disabled={!canNext}
                  onClick={() => canNext && setPageIndex((p) => p + 1)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    canNext
                      ? "bg-white border-gray-300 text-gray-700"
                      : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Transaction;
