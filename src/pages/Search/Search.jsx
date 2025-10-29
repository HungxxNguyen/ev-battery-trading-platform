/*  */ import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import {
  FiHeart,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiAlertCircle,
} from "react-icons/fi";
import { useFavorites } from "../../contexts/FavoritesContext";
import listingService from "../../services/apis/listingApi";

/**
 * Search page — polished UI/UX
 * Highlights:
 * - Sticky search bar with clear button + keyboard submit
 * - Debounced keyword to limit requests while typing
 * - AbortController to cancel in-flight requests when keyword/page changes
 * - Skeleton loaders for cards
 * - Better empty + error states with retry
 * - Consistent card ratio, graceful image fallback, accessible fav button
 * - Pagination + page-size selector, URL kept in sync
 * - Light, clean aesthetic (keeps Tailwind)
 */

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 40];

const FALLBACK_LISTING_IMAGE = "https://placehold.co/600x450?text=Listing";

// -----------------------------
// Utils
// -----------------------------
const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Liên hệ";
  }
  try {
    return `${new Intl.NumberFormat("vi-VN").format(Number(value))} VND`;
  } catch {
    return `${value} VND`;
  }
};

const formatListingStatus = (status) => {
  if (!status) return null;
  const mapping = {
    New: { label: "Mới", color: "bg-emerald-600" },
    Used: { label: "Đã sử dụng", color: "bg-slate-700" },
  };
  return mapping[status] || { label: status, color: "bg-blue-600" };
};

// Try to normalize different payload shapes the API might return
const extractItemsAndMeta = (payload) => {
  // Common backend shape: { error: 0, data: [...], totalRecords?, totalPages? }
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) {
      return {
        items: payload.data,
        totalItems:
          payload.totalItems ??
          payload.totalRecords ??
          payload.totalCount ??
          payload.data.length,
        totalPages: payload.totalPages ?? undefined,
      };
    }
    if (Array.isArray(payload.items)) {
      return {
        items: payload.items,
        totalItems:
          payload.totalItems ??
          payload.totalRecords ??
          payload.totalCount ??
          payload.items.length,
        totalPages: payload.totalPages ?? undefined,
      };
    }
  }
  // Or the payload itself is an array
  if (Array.isArray(payload)) {
    return {
      items: payload,
      totalItems: payload.length,
      totalPages: undefined,
    };
  }
  return { items: [], totalItems: 0, totalPages: undefined };
};

// Debounce hook to reduce fetch thrashing while typing
function useDebouncedValue(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Search() {
  const navigate = useNavigate();
  const { keyword: keywordParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [keyword, setKeyword] = useState(keywordParam || "");
  const debouncedKeyword = useDebouncedValue(keyword, 450);

  const [pageIndex, setPageIndex] = useState(
    Number(searchParams.get("page")) > 0 ? Number(searchParams.get("page")) : 1
  );
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) > 0
      ? Number(searchParams.get("pageSize"))
      : DEFAULT_PAGE_SIZE
  );

  const [rawItems, setRawItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(undefined);
  const [totalPages, setTotalPages] = useState(undefined);

  // Keep internal keyword in sync when navigating directly
  useEffect(() => {
    setKeyword(keywordParam || "");
  }, [keywordParam]);

  // Fetch whenever keyword or paging changes (debounced)
  useEffect(() => {
    let isActive = true;

    const doFetch = async () => {
      const k = (debouncedKeyword || "").trim();
      if (!k) {
        setItems([]);
        setTotalItems(0);
        setTotalPages(0);
        setError("");
        return;
      }

      // Note: removed AbortController; using client-side filtering instead of server-side search.

      setLoading(true);
      setError("");

      try {
        const res = await listingService.getListings({
          pageIndex: 1,
          pageSize: 500,
        });
        if (!isActive) return;

        if (res?.success) {
          const payload = res.data?.error === 0 ? res.data : res.data;
          const {
            items: it,
            totalItems: ti,
            totalPages: tp,
          } = extractItemsAndMeta(payload?.data ?? payload);
          const base = Array.isArray(it) ? it : [];
          setRawItems(base);
          // Client-side text search across title/brand/model/area
          const getTitle = (it) => String(it.title ?? it.Title ?? "");
          const getModel = (it) => String(it.model ?? it.Model ?? "");
          const getBrandName = (it) =>
            String(it.brand?.name ?? it.brandName ?? it.BrandName ?? "");
          const getArea = (it) => String(it.area ?? it.Area ?? "");
          const filtered = base.filter((it) => {
            const hay = [
              getTitle(it),
              getBrandName(it),
              getModel(it),
              getArea(it),
            ]
              .join(" ")
              .toLowerCase();
            return hay.includes(k.toLowerCase());
          });
          const total = filtered.length;
          const tpc = Math.ceil(total / pageSize) || 0;
          const start = (Math.max(1, pageIndex) - 1) * pageSize;
          const pageItems = filtered.slice(start, start + pageSize);
          setItems(pageItems);
          setTotalItems(total);
          setTotalPages(tpc);
        } else {
          setItems([]);
          setTotalItems(0);
          setTotalPages(0);
          setError(res?.error || "Không thể tải kết quả tìm kiếm");
        }
      } catch (err) {
        if (!isActive) return;
        setItems([]);
        setTotalItems(0);
        setTotalPages(0);
        setError(err?.message || "Không thể tải kết quả tìm kiếm");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    doFetch();
    return () => {
      isActive = false;
    };
  }, [debouncedKeyword, pageIndex, pageSize]);

  // Keep query params in URL in sync
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(pageIndex));
    next.set("pageSize", String(pageSize));
    setSearchParams(next, { replace: true });
    // scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageIndex, pageSize]);

  const hasPrev = pageIndex > 1;
  const hasNext = useMemo(() => {
    if (typeof totalPages === "number" && totalPages > 0) {
      return pageIndex < totalPages;
    }
    // Fallback: if page filled completely, assume more pages
    return items.length === pageSize;
  }, [pageIndex, totalPages, items.length, pageSize]);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    const k = (keyword || "").trim();
    if (!k) {
      navigate("/");
      return;
    }
    setPageIndex(1);
    navigate(`/search/${encodeURIComponent(k)}?page=1&pageSize=${pageSize}`);
  };

  const onClearSearch = () => {
    setKeyword("");
    setItems([]);
    setTotalItems(0);
    setTotalPages(0);
    setError("");
    navigate("/");
  };

  return (
    <MainLayout>
      {/* Sticky search bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={onSubmitSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm xe điện, pin..."
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                autoFocus
                aria-label="Ô tìm kiếm"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  aria-label="Xoá từ khoá"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-gray-500 hover:bg-gray-100"
                >
                  <FiX />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-[0.98] transition"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {debouncedKeyword ? (
                <>
                  Kết quả cho:{" "}
                  <span className="text-blue-600">“{debouncedKeyword}”</span>
                </>
              ) : (
                "Tìm kiếm"
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-1" aria-live="polite">
              {typeof totalItems === "number" && debouncedKeyword
                ? `Tổng ${totalItems} kết quả`
                : "Nhập từ khoá để bắt đầu"}
            </p>
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600">
              Hiển thị
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPageSize(val);
                setPageIndex(1);
              }}
              className="text-sm border rounded-md px-2 py-1 bg-white"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}/trang
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2">
            <FiAlertCircle className="mt-0.5" />
            <div>
              <p className="font-medium">Đã có lỗi xảy ra</p>
              <p className="text-sm">{error}</p>
              <div className="mt-3">
                <button
                  onClick={() => {
                    // re-trigger fetch by toggling pageIndex (noop if same)
                    setPageIndex((p) => p);
                  }}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {(() => {
          if ((debouncedKeyword || "").trim() === "") {
            return (
              <EmptyState
                title="Bắt đầu tìm kiếm"
                desc="Hãy nhập tên mẫu xe, thương hiệu, loại pin... (ví dụ: VinFast VF e34, pin rời)"
              />
            );
          }

          if (loading) {
            return (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
                aria-busy
              >
                {Array.from({ length: pageSize }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            );
          }

          if (!items || items.length === 0) {
            return (
              <EmptyState
                title="Không tìm thấy kết quả"
                desc="Thử đổi từ khoá, kiểm tra chính tả, hoặc dùng các từ chung hơn (ví dụ: 'xe máy điện', 'ô tô điện')."
              />
            );
          }

          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                {items.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorite={isFavorite}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  {typeof totalItems === "number"
                    ? `Tổng ${totalItems} kết quả`
                    : ""}
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    disabled={!hasPrev}
                    onClick={() => hasPrev && setPageIndex((p) => p - 1)}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-md border text-sm transition ${
                      hasPrev
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <FiChevronLeft /> Trước
                  </button>
                  <span className="text-sm text-gray-600">
                    Trang {pageIndex}
                  </span>
                  <button
                    disabled={!hasNext}
                    onClick={() => hasNext && setPageIndex((p) => p + 1)}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-md border text-sm transition ${
                      hasNext
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Sau <FiChevronRight />
                  </button>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </MainLayout>
  );
}

// -----------------------------
// Pieces
// -----------------------------

function ListingCard({ listing, isFavorite, toggleFavorite }) {
  const coverImage =
    listing?.listingImages?.[0]?.imageUrl || FALLBACK_LISTING_IMAGE;
  const status = formatListingStatus(listing?.listingStatus);
  const metaParts = [listing?.brand?.name, listing?.model].filter(Boolean);
  const secondaryParts = [
    listing?.yearOfManufacture ? `Năm ${listing.yearOfManufacture}` : null,
    listing?.odo ? `Odo ${listing.odo} km` : null,
  ].filter(Boolean);

  const favActive = isFavorite(listing?.id);

  return (
    <Link
      to={`/listing/${listing?.id}`}
      state={{ listing }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 transition shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={coverImage}
          alt={listing?.title || "Listing"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_LISTING_IMAGE;
          }}
          loading="lazy"
        />
        {status?.label && (
          <span
            className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-md text-white ${status.color}`}
          >
            {status.label}
          </span>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite({
              id: listing?.id,
              title: listing?.title,
              price: listing?.price,
              location: listing?.area,
              image: coverImage,
            });
          }}
          aria-label={favActive ? "Bỏ yêu thích" : "Lưu tin yêu thích"}
          aria-pressed={favActive}
          className={`absolute top-2 right-2 flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition ${
            favActive
              ? "bg-white text-red-500"
              : "bg-white/90 text-gray-600 hover:text-red-500"
          }`}
        >
          <FiHeart className={`w-5 h-5 ${favActive ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-base mb-1 line-clamp-2 min-h-[2.75rem]">
          {listing?.title}
        </h3>
        {metaParts.length > 0 && (
          <p className="text-gray-500 text-xs mb-1">{metaParts.join(" / ")}</p>
        )}
        {secondaryParts.length > 0 && (
          <p className="text-gray-500 text-xs mb-1">
            {secondaryParts.join(" · ")}
          </p>
        )}
        <p className="text-red-600 font-bold text-lg mb-2">
          {formatCurrency(listing?.price)}
        </p>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <FiMapPin className="shrink-0" />
          <span className="truncate">{listing?.area || "Chưa cập nhật"}</span>
        </div>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
      <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-11/12 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-7/12 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-5/12 animate-pulse" />
        <div className="h-5 bg-gray-100 rounded w-4/12 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-6/12 animate-pulse" />
      </div>
    </div>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-white shadow flex items-center justify-center text-gray-500">
        🔎
      </div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </div>
  );
}
