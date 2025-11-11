import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowUpRight,
  FiTrendingUp,
  FiShoppingBag,
  FiDollarSign,
  FiFilter,
  FiSearch,
  FiPackage,
} from "react-icons/fi";
import { AuthContext } from "../../contexts/AuthContext";
import transactionService from "../../services/apis/transactionApi";
import listingService from "../../services/apis/listingApi";
import { currency } from "../../utils/currency";
import background2 from "../../assets/background2.png";

const FALLBACK_IMAGE = background2;

const ORDER_TABS = [
  { key: "all", label: "Tất cả", count: 0 },
  { key: "success", label: "Thành công", count: 0 },
  { key: "failed", label: "Thất bại", count: 0 },
];

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
  }
};

const STATUS_TOKEN = {
  success: {
    label: "Thành công",
    icon: <FiCheckCircle className="w-4 h-4" />,
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amountColor: "text-emerald-600",
  },
  failed: {
    label: "Thất bại",
    icon: <FiXCircle className="w-4 h-4" />,
    pill: "bg-rose-50 text-rose-700 border border-rose-200",
    amountColor: "text-rose-600",
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
    productThumb: FALLBACK_IMAGE,
    channel,
    listingId,
    manageHref: listingId ? `/manage-listing/${listingId}` : null,
    publicHref: listingId ? `/listing/${listingId}` : null,
  };
};

const TransactionCard = ({ item }) => {
  const statusInfo = STATUS_TOKEN[item.status];

  return (
    <div className="group relative flex flex-col sm:flex-row gap-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Image Section */}
      <div className="relative flex-shrink-0 w-full sm:w-36">
        <Link
          to={item.manageHref || "#"}
          onClick={(e) => !item.manageHref && e.preventDefault()}
          className="block"
        >
          <div className="w-full h-28 sm:h-36 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:border-gray-300 transition-colors">
            <img
              src={item.productThumb}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        {item.channel && (
          <span className="absolute -bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
            <FiArrowUpRight className="w-3 h-3" /> {item.channel}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            {item.manageHref ? (
              <Link
                to={item.manageHref}
                className="block text-lg font-semibold text-gray-900 leading-snug hover:text-blue-600 transition-colors line-clamp-2"
              >
                {item.title}
              </Link>
            ) : (
              <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">
                {item.title}
              </h3>
            )}

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {item.orderCode && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPackage className="w-4 h-4 text-gray-400" />
                  <span className="font-mono font-medium">
                    {item.orderCode}
                  </span>
                </div>
              )}
              {item.time && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <span>{item.time}</span>
                </div>
              )}
            </div>

            {item.manageHref && (
              <div className="mt-4">
                <Link
                  to={item.manageHref}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:gap-2 transition-all"
                >
                  Xem chi tiết bài đăng
                  <FiArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Status & Amount Section */}
          <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-3 lg:min-w-[160px]">
            <div className="flex flex-col items-start sm:items-end gap-2">
              <span className={`text-2xl font-bold ${statusInfo.amountColor}`}>
                {currency(item.amount)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusInfo.pill}`}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
            {item.statusNote && (
              <span className="text-xs text-gray-500 italic max-w-[140px] text-right">
                {item.statusNote}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col sm:flex-row gap-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div className="relative flex-shrink-0 w-full sm:w-36">
      <div className="w-full h-28 sm:h-36 rounded-xl bg-gray-100 border border-gray-200" />
    </div>
    <div className="flex flex-1 flex-col gap-4">
      <div className="h-6 w-2/3 bg-gray-100 rounded" />
      <div className="flex flex-wrap gap-4">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>
      <div className="h-4 w-32 bg-gray-100 rounded" />
    </div>
    <div className="flex flex-col items-end gap-2">
      <div className="h-8 w-24 bg-gray-100 rounded" />
      <div className="h-6 w-20 bg-gray-100 rounded-full" />
    </div>
  </div>
);

const EmptyState = ({ activeTab }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
      <FiShoppingBag className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {activeTab === "all"
        ? "Chưa có giao dịch"
        : `Không có giao dịch ${ORDER_TABS.find(
            (t) => t.key === activeTab
          )?.label.toLowerCase()}`}
    </h3>
    <p className="text-gray-600 text-center max-w-md mb-6">
      {activeTab === "all"
        ? "Lịch sử thanh toán của bạn sẽ hiển thị tại đây khi bạn thực hiện giao dịch."
        : "Thử chọn tab khác để xem các giao dịch với trạng thái khác nhau."}
    </p>
    {activeTab === "all" && (
      <Link
        to="/create-listing"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        <FiPackage className="w-5 h-5" />
        Tạo tin đăng mới
      </Link>
    )}
  </div>
);

const Transaction = () => {
  const { user } = useContext(AuthContext) || {};
  const userId = user?.id;

  const [activeTab, setActiveTab] = useState("all");
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

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter((item) => item.status === activeTab);
  }, [items, activeTab]);

  const stats = useMemo(() => {
    const success = items.filter((t) => t.status === "success");
    const failed = items.filter((t) => t.status === "failed");
    const totalAmount = success.reduce(
      (acc, cur) => acc + (Number(cur.amount) || 0),
      0
    );
    return {
      totalSuccess: success.length,
      totalFailed: failed.length,
      totalAmount,
      totalOrders:
        typeof count === "number" && count >= items.length
          ? count
          : items.length,
    };
  }, [items, count]);

  const tabsWithCounts = ORDER_TABS.map((tab) => {
    let count = 0;
    if (tab.key === "all") count = stats.totalOrders;
    else if (tab.key === "success") count = stats.totalSuccess;
    else if (tab.key === "failed") count = stats.totalFailed;
    return { ...tab, count };
  });

  const totalPages = Math.max(
    1,
    Math.ceil((count || items.length || 1) / pageSize)
  );
  const canPrev = pageIndex > 1;
  const canNext = pageIndex < totalPages;

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-8">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-8">
          {/* Header */}
          <header className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Lịch sử giao dịch
                </h1>
                <p className="text-base text-gray-600 max-w-2xl">
                  Theo dõi và quản lý toàn bộ giao dịch thanh toán cho các gói
                  dịch vụ và tin đăng của bạn.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <FiShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Tổng đơn hàng
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                      <FiCheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">
                    Đã thanh toán
                  </p>
                  <p className="text-3xl font-bold text-emerald-700">
                    {stats.totalSuccess}
                  </p>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                      <FiClock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-rose-700  mb-1">
                    Thất bại
                  </p>
                  <p className="text-3xl font-bold text-rose-700 mb-1">
                    {stats.totalFailed}
                  </p>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <FiDollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Tổng chi phí đã thanh toán
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currency(stats.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Filters & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              {tabsWithCounts.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setActiveTab(t.key);
                    setPageIndex(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    t.key === activeTab
                      ? "bg-gray-900 text-white border-gray-900 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {t.label}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      t.key === activeTab
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
              <label
                htmlFor="pageSize"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
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
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value={5}>5 giao dịch</option>
                <option value={10}>10 giao dịch</option>
                <option value={20}>20 giao dịch</option>
                <option value={50}>50 giao dịch</option>
              </select>
            </div>
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
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex items-start gap-3">
                <FiXCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-rose-900 mb-1">
                    Có lỗi xảy ra
                  </h3>
                  <p className="text-rose-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && filteredItems.length === 0 && (
              <EmptyState activeTab={activeTab} />
            )}

            {!loading &&
              !error &&
              filteredItems.map((it) => (
                <TransactionCard key={it.id} item={it} />
              ))}
          </div>

          {/* Pagination */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="text-sm text-gray-600 font-medium">
                Hiển thị{" "}
                <span className="font-bold text-gray-900">
                  {(pageIndex - 1) * pageSize + 1}
                </span>{" "}
                -{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(pageIndex * pageSize, count || items.length)}
                </span>{" "}
                của{" "}
                <span className="font-bold text-gray-900">
                  {count || items.length}
                </span>{" "}
                giao dịch
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!canPrev}
                  onClick={() =>
                    canPrev && setPageIndex((p) => Math.max(1, p - 1))
                  }
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    canPrev
                      ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Trước
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pageIndex <= 3) {
                      pageNum = i + 1;
                    } else if (pageIndex >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = pageIndex - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPageIndex(pageNum)}
                        className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                          pageNum === pageIndex
                            ? "bg-gray-900 text-white border-gray-900 shadow-md"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <div className="sm:hidden px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                  {pageIndex} / {totalPages}
                </div>

                <button
                  disabled={!canNext}
                  onClick={() => canNext && setPageIndex((p) => p + 1)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    canNext
                      ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
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
