import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  FiChevronDown,
  FiSearch,
  FiFilter,
  FiX,
  FiHeart,
} from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import listingService from "../../services/apis/listingApi";
import brandService from "../../services/apis/brandApi";
import { useFavorites } from "../../contexts/FavoritesContext";

// -----------------------------
// Helpers
// -----------------------------
const CATEGORY_MAP = {
  car: { api: "ElectricCar", label: "Ô tô" },
  bike: { api: "ElectricMotorbike", label: "Xe máy" },
  battery: { api: "RemovableBattery", label: "Pin" },
};

const PRICE_PRESETS = [
  { label: "< 50tr", from: 0, to: 50_000_000 },
  { label: "50 - 200tr", from: 50_000_000, to: 200_000_000 },
  { label: "200 - 500tr", from: 200_000_000, to: 500_000_000 },
  { label: "500tr - 1tỷ", from: 500_000_000, to: 1_000_000_000 },
  { label: "> 1tỷ", from: 1_000_000_000, to: 5_000_000_000 },
];

const YEAR_PRESETS = [
  { label: ">= 2023", from: 2023, to: "" },
  { label: "2018 - 2022", from: 2018, to: 2022 },
  { label: "2015 - 2017", from: 2015, to: 2017 },
  { label: "<= 2014", from: "", to: 2014 },
];

const DEFAULT_PAGE_SIZE = 20;
const FALLBACK_LISTING_IMAGE = "https://placehold.co/600x450?text=Listing";

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
  const mapping = { New: "Mới", Used: "Đã sử dụng" };
  return mapping[status] || status;
};

// Normalize brand model from various backend shapes
const normalizeBrandType = (t) => {
  if (t == null) return "";
  const raw = String(t?.value ?? t?.type ?? t?.Type ?? t ?? "").trim();
  if (/^electric\s*car$/i.test(raw)) return "ElectricCar";
  if (/^electric\s*motorbike$/i.test(raw)) return "ElectricMotorbike";
  if (/^removable\s*battery$/i.test(raw)) return "RemovableBattery";
  if (["ElectricCar", "ElectricMotorbike", "RemovableBattery"].includes(raw))
    return raw;
  return raw;
};

const toBrandModel = (b) => ({
  id: String(
    b.id ?? b.Id ?? b.ID ?? b.brandId ?? b.BrandId ?? b.BrandID ?? b.uuid ?? ""
  ),
  name: String(
    b.name ?? b.Name ?? b.brandName ?? b.BrandName ?? b.title ?? b.Title ?? ""
  ),
  type: normalizeBrandType(
    b.type ?? b.Type ?? b.category ?? b.Category ?? b.kind
  ),
});

// Simple click outside hook
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// -----------------------------
// Component
// -----------------------------
const Category = () => {
  const { categoryId } = useParams();
  const mapping = CATEGORY_MAP[categoryId];
  const [searchParams, setSearchParams] = useSearchParams();
  const { isFavorite } = useFavorites();

  // Data
  const [rawItems, setRawItems] = useState([]); // unfiltered from API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UI paging (client-side load more)
  const [uiPage, setUiPage] = useState(1);
  const [pageSize] = useState(
    Number(searchParams.get("pageSize")) > 0
      ? Number(searchParams.get("pageSize"))
      : DEFAULT_PAGE_SIZE
  );

  // Filters
  const [priceFrom, setPriceFrom] = useState(
    Number(searchParams.get("from")) >= 0 ? Number(searchParams.get("from")) : 0
  );
  const [priceTo, setPriceTo] = useState(
    Number(searchParams.get("to")) > 0
      ? Number(searchParams.get("to"))
      : 5_000_000_000
  );
  const [yearFrom, setYearFrom] = useState(
    Number(searchParams.get("yfrom")) > 0
      ? Number(searchParams.get("yfrom"))
      : ""
  );
  const [yearTo, setYearTo] = useState(
    Number(searchParams.get("yto")) > 0 ? Number(searchParams.get("yto")) : ""
  );
  const [brandId, setBrandId] = useState(searchParams.get("brandId") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  // Popover: only one open at a time
  const [openMenu, setOpenMenu] = useState(null); // 'price' | 'year' | 'brand' | 'status' | 'area' | null

  const priceRef = useRef(null);
  const yearRef = useRef(null);
  const brandRef = useRef(null);
  const statusRef = useRef(null);
  const areaRef = useRef(null);

  // useOnClickOutside(priceRef, () => openMenu === "price" && setOpenMenu(null));
  // useOnClickOutside(yearRef, () => openMenu === "year" && setOpenMenu(null));
  // useOnClickOutside(brandRef, () => openMenu === "brand" && setOpenMenu(null));
  // useOnClickOutside(
  //   statusRef,
  //   () => openMenu === "status" && setOpenMenu(null)
  // );
  // useOnClickOutside(areaRef, () => openMenu === "area" && setOpenMenu(null));

  // ESC to close popover
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Brands
  const [brands, setBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await brandService.getBrands();
        if (!active) return;
        if (res?.success) {
          const list = Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : [];
          setBrands(list.map(toBrandModel));
        }
      } catch {
        // ignore silently
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Server fetch: lenient params
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          pageIndex: 1, // always get the freshest set; UI paging is client-side
          pageSize: 500, // reasonable cap to avoid huge payloads
          from: Math.max(0, Number(priceFrom) || 0),
          to: Math.max(Number(priceFrom) || 0, Number(priceTo) || 0),
          category: mapping?.api,
          brandId: brandId || undefined,
          status: status || undefined,
          yearFrom: yearFrom || undefined,
          yearTo: yearTo || undefined,
          area: area || undefined,
        };

        const res = await listingService.getListings(params);
        if (!active) return;
        if (res?.success) {
          const payload = res.data;
          const arr = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
            ? payload
            : [];
          setRawItems(arr);
        } else {
          setRawItems([]);
          setError(res?.error || "Không thể tải danh sách");
        }
      } catch (err) {
        if (!active) return;
        setRawItems([]);
        setError(err?.message || "Không thể tải danh sách");
      } finally {
        if (active) setLoading(false);
      }
    })();
    // reset UI paging when filter base changes
    setUiPage(1);
  }, [categoryId, brandId, status, area, priceFrom, priceTo, yearFrom, yearTo]);

  // URL sync (shareable filters)
  useEffect(() => {
    // Avoid updating URL while a popover is open to prevent input blur
    if (openMenu !== null) return;
    const next = new URLSearchParams(searchParams);
    next.set("pageSize", String(pageSize));
    next.set("from", String(priceFrom || 0));
    next.set("to", String(priceTo || 0));
    yearFrom ? next.set("yfrom", String(yearFrom)) : next.delete("yfrom");
    yearTo ? next.set("yto", String(yearTo)) : next.delete("yto");
    brandId ? next.set("brandId", String(brandId)) : next.delete("brandId");
    status ? next.set("status", String(status)) : next.delete("status");
    area ? next.set("area", String(area)) : next.delete("area");
    sortBy ? next.set("sort", String(sortBy)) : next.delete("sort");
    setSearchParams(next, { replace: true });
  }, [
    pageSize,
    priceFrom,
    priceTo,
    yearFrom,
    yearTo,
    brandId,
    status,
    area,
    sortBy,
    openMenu,
  ]);

  // Derived brand list
  const filteredBrandList = useMemo(() => {
    const byType = brands
      .map(toBrandModel)
      .filter((b) => !mapping?.api || b.type === mapping.api);
    if (!brandSearch.trim()) return byType;
    return byType.filter((b) =>
      b.name.toLowerCase().includes(brandSearch.trim().toLowerCase())
    );
  }, [brands, mapping?.api, brandSearch]);

  const selectedCategoryLabel = mapping?.label || "Danh mục";

  // Client filter + sort
  const clientFilteredSorted = useMemo(() => {
    const arr = Array.isArray(rawItems) ? rawItems : [];
    const from = Math.max(0, Number(priceFrom) || 0);
    const to = Math.max(from, Number(priceTo) || 0);

    const getNum = (v) => (isNaN(Number(v)) ? 0 : Number(v));
    const getYear = (it) =>
      getNum(it.yearOfManufacture ?? it.YearOfManufacture ?? 0);
    const getPrice = (it) => getNum(it.price ?? it.Price ?? 0);
    const getStatus = (it) =>
      String(it.listingStatus ?? it.ListingStatus ?? "");
    const getCat = (it) => String(it.category ?? it.Category ?? "");
    const getBrandId = (it) =>
      String(it.brand?.id ?? it.brandId ?? it.BrandId ?? it.BrandID ?? "");
    const getArea = (it) => String(it.area ?? it.Area ?? "");
    const getDateVal = (it) => {
      const d =
        it.activatedAt ??
        it.creationDate ??
        it.createdAt ??
        it.postedOn ??
        null;
      const t = d ? new Date(d).getTime() : 0;
      return Number.isFinite(t) ? t : 0;
    };

    const filtered = arr.filter((it) => {
      if (mapping?.api) {
        const cat = getCat(it);
        if (cat && cat !== mapping.api) return false;
      }
      const p = getPrice(it);
      const y = getYear(it);
      const st = getStatus(it);
      const bId = getBrandId(it);
      const ar = getArea(it);
      if (p < from || p > to) return false;
      if (yearFrom && (!y || y < Number(yearFrom))) return false;
      if (yearTo && (!y || y > Number(yearTo))) return false;
      if (status && st !== status) return false;
      if (brandId && bId !== String(brandId)) return false;
      if (area && !ar.toLowerCase().includes(area.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "priceAsc") return getPrice(a) - getPrice(b);
      if (sortBy === "priceDesc") return getPrice(b) - getPrice(a);
      if (sortBy === "yearAsc") return getYear(a) - getYear(b);
      if (sortBy === "yearDesc") return getYear(b) - getYear(a);
      // newest
      return getDateVal(b) - getDateVal(a);
    });

    return sorted;
  }, [
    rawItems,
    mapping?.api,
    priceFrom,
    priceTo,
    yearFrom,
    yearTo,
    brandId,
    status,
    area,
    sortBy,
  ]);

  const totalItems = clientFilteredSorted.length;
  const visibleItems = useMemo(
    () => clientFilteredSorted.slice(0, uiPage * pageSize),
    [clientFilteredSorted, uiPage, pageSize]
  );

  const onClearAll = () => {
    setPriceFrom(0);
    setPriceTo(5_000_000_000);
    setYearFrom("");
    setYearTo("");
    setBrandId("");
    setStatus("");
    setArea("");
    setSortBy("newest");
    setUiPage(1);
  };

  // ---- UI Parts ----
  const FilterChip = ({ label, active, onClick, ariaLabel }) => (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-label={ariaLabel || label}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition cursor-pointer ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span>{label}</span>
      <FiChevronDown className="opacity-70" />
    </button>
  );

  const ActivePill = ({ text, onClear }) => (
    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 border border-gray-200 rounded-full px-2 py-1">
      {text}
      <button
        onClick={onClear}
        className="p-0.5 hover:text-red-600 cursor-pointer"
        aria-label={`Bỏ lọc ${text}`}
      >
        <FiX />
      </button>
    </span>
  );

  const Summary = () => (
    <div className="text-gray-700">
      <div className="font-semibold text-xl">
        {totalItems.toLocaleString("vi-VN")} tin{" "}
        {selectedCategoryLabel.toLowerCase()} phù hợp
      </div>
      <div className="text-sm text-gray-500">
        Cập nhật {new Date().toLocaleDateString("vi-VN")}
      </div>
    </div>
  );

  const PricePopover = () => {
    const [localPriceFrom, setLocalPriceFrom] = useState(priceFrom);
    const [localPriceTo, setLocalPriceTo] = useState(priceTo);

    const handleApply = () => {
      setPriceFrom(localPriceFrom);
      setPriceTo(localPriceTo);
      setOpenMenu(null);
    };

    const handleReset = () => {
      setLocalPriceFrom(0);
      setLocalPriceTo(5_000_000_000);
    };

    return (
      <div
        ref={priceRef}
        className="absolute z-20 mt-2 w-150 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-sm text-gray-700 font-medium">Khoảng giá</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localPriceFrom}
            onChange={(e) => setLocalPriceFrom(Number(e.target.value) || 0)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
            placeholder="Giá tối thiểu"
          />
          <span>-</span>
          <input
            type="number"
            value={localPriceTo}
            onChange={(e) => setLocalPriceTo(Number(e.target.value) || 0)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
            placeholder="Giá tối đa"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setLocalPriceFrom(p.from);
                setLocalPriceTo(p.to || 5_000_000_000);
              }}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    );
  };

  const YearPopover = () => {
    const [localYearFrom, setLocalYearFrom] = useState(yearFrom);
    const [localYearTo, setLocalYearTo] = useState(yearTo);

    const handleApply = () => {
      setYearFrom(localYearFrom);
      setYearTo(localYearTo);
      setOpenMenu(null);
    };

    const handleReset = () => {
      setLocalYearFrom("");
      setLocalYearTo("");
    };

    return (
      <div
        ref={yearRef}
        className="absolute z-20 mt-2 w-150 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-sm text-gray-700 font-medium">
          Năm sản xuất
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localYearFrom}
            onChange={(e) => setLocalYearFrom(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
            placeholder="Năm tối thiểu"
          />
          <span>-</span>
          <input
            type="number"
            value={localYearTo}
            onChange={(e) => setLocalYearTo(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
            placeholder="Năm tối đa"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {YEAR_PRESETS.map((y) => (
            <button
              key={y.label}
              onClick={() => {
                setLocalYearFrom(y.from);
                setLocalYearTo(y.to);
              }}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              {y.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    );
  };

  const BrandPopover = () => {
    const [localBrandSearch, setLocalBrandSearch] = useState(brandSearch);
    const [localBrandId, setLocalBrandId] = useState(brandId);

    const handleApply = () => {
      setBrandId(localBrandId);
      setBrandSearch(localBrandSearch);
      setOpenMenu(null);
    };

    const handleReset = () => {
      setLocalBrandId("");
      setLocalBrandSearch("");
    };

    const filteredBrandList = useMemo(() => {
      const byType = brands
        .map(toBrandModel)
        .filter((b) => !mapping?.api || b.type === mapping.api);
      if (!localBrandSearch.trim()) return byType;
      return byType.filter((b) =>
        b.name.toLowerCase().includes(localBrandSearch.trim().toLowerCase())
      );
    }, [brands, mapping?.api, localBrandSearch]);

    return (
      <div
        ref={brandRef}
        className="absolute z-20 mt-2 w-96 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-3">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localBrandSearch}
            onChange={(e) => setLocalBrandSearch(e.target.value)}
            placeholder="Nhập tìm hãng"
            className="w-full rounded border border-gray-300 pl-10 pr-3 py-2"
          />
        </div>
        <div className="max-h-60 overflow-auto space-y-2 pr-1">
          {filteredBrandList.map((b) => (
            <label
              key={b.id}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <span>{b.name}</span>
              <input
                type="radio"
                name="brand"
                value={b.id}
                checked={String(localBrandId) === String(b.id)}
                onChange={() => setLocalBrandId(b.id)}
              />
            </label>
          ))}
          {filteredBrandList.length === 0 && (
            <div className="text-sm text-gray-500">Không có hãng phù hợp</div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    );
  };

  const StatusPopover = () => {
    const [localStatus, setLocalStatus] = useState(status);

    const handleApply = () => {
      setStatus(localStatus);
      setOpenMenu(null);
    };

    const handleReset = () => {
      setLocalStatus("");
    };

    return (
      <div
        ref={statusRef}
        className="absolute z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
      >
        <div className="mb-2 text-sm text-gray-700 font-medium">Tình trạng</div>
        {[
          { value: "New", label: "Mới" },
          { value: "Used", label: "Đã sử dụng" },
        ].map((opt) => (
          <label
            key={opt.value}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <span>{opt.label}</span>
            <input
              type="radio"
              name="status"
              value={opt.value}
              checked={localStatus === opt.value}
              onChange={() => setLocalStatus(opt.value)}
            />
          </label>
        ))}
        <div className="mt-2 pt-2 flex items-center justify-between border-t">
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    );
  };

  // Card renderer
  const renderCards = () => {
    if (loading) {
      return Array.from({ length: 10 }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="bg-white rounded-lg overflow-hidden border border-gray-200 p-3 animate-pulse"
        >
          <div className="h-40 bg-gray-200 rounded mb-3" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-3 bg-gray-100 rounded mb-1" />
          <div className="h-3 bg-gray-100 rounded mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ));
    }

    if (!visibleItems || visibleItems.length === 0) {
      return (
        <div className="col-span-full text-center text-gray-600">
          Không có kết quả phù hợp.
        </div>
      );
    }

    return visibleItems.map((listing) => {
      const coverImage =
        listing.listingImages?.[0]?.imageUrl || FALLBACK_LISTING_IMAGE;
      const statusLabel = formatListingStatus(listing.listingStatus);
      const metaParts = [listing.brand?.name, listing.model].filter(Boolean);
      const secondaryParts = [
        listing.yearOfManufacture ? `Năm ${listing.yearOfManufacture}` : null,
        listing.odo ? `Odo ${listing.odo} km` : null,
      ].filter(Boolean);

      return (
        <Link
          to={`/listing/${listing.id}`}
          state={{ listing }}
          key={listing.id}
          className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <div className="h-40 bg-gray-200 overflow-hidden relative">
            <img
              src={coverImage}
              alt={listing.title}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_LISTING_IMAGE;
              }}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {statusLabel && (
              <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-blue-500 text-white">
                {statusLabel}
              </span>
            )}
            {/* Favorite indicator (read-only) */}
            <span
              className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur bg-black/40 ${
                isFavorite?.(listing.id) ? "text-red-400" : "text-white"
              }`}
            >
              <FiHeart />
            </span>
          </div>

          <div className="p-3">
            <h3 className="font-semibold text-base mb-1 line-clamp-2 h-12">
              {listing.title}
            </h3>
            {metaParts.length > 0 && (
              <p className="text-gray-500 text-xs mb-1">
                {metaParts.join(" / ")}
              </p>
            )}
            {secondaryParts.length > 0 && (
              <p className="text-gray-500 text-xs mb-1">
                {secondaryParts.join(" - ")}
              </p>
            )}
            <p className="text-red-600 font-bold text-lg mb-1">
              {formatCurrency(listing.price)}
            </p>
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-xs">{listing.area || ""}</p>
            </div>
          </div>
        </Link>
      );
    });
  };

  const hasActiveFilters =
    priceFrom !== 0 ||
    priceTo !== 5_000_000_000 ||
    yearFrom ||
    yearTo ||
    brandId ||
    status ||
    area ||
    sortBy !== "newest";

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {openMenu !== null && (
          <div
            className="fixed inset-0 z-10 bg-black/0" // có thể dùng bg-black/20 nếu muốn mờ nền
            onClick={() => setOpenMenu(null)}
            onPointerDown={() => setOpenMenu(null)}
            aria-hidden="true"
          />
        )}
        {/* Sticky filter bar */}
        <div className="sticky top-0 z-20 -mx-4 px-4 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between gap-4">
              <Summary />
            </div>

            {/* Filter chips */}
            <div className="relative mt-4 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-full text-sm bg-black text-white">
                {selectedCategoryLabel}
              </span>

              <div className="relative">
                <FilterChip
                  label="Giá"
                  active={
                    openMenu === "price" ||
                    priceFrom !== 0 ||
                    priceTo !== 5_000_000_000
                  }
                  onClick={() =>
                    setOpenMenu(openMenu === "price" ? null : "price")
                  }
                />
                {openMenu === "price" && <PricePopover />}
              </div>

              <div className="relative">
                <FilterChip
                  label="Năm sản xuất"
                  active={openMenu === "year" || !!yearFrom || !!yearTo}
                  onClick={() =>
                    setOpenMenu(openMenu === "year" ? null : "year")
                  }
                />
                {openMenu === "year" && <YearPopover />}
              </div>

              <div className="relative">
                <FilterChip
                  label="Hãng xe"
                  active={openMenu === "brand" || !!brandId}
                  onClick={() =>
                    setOpenMenu(openMenu === "brand" ? null : "brand")
                  }
                />
                {openMenu === "brand" && <BrandPopover />}
              </div>

              <div className="relative">
                <FilterChip
                  label="Tình trạng"
                  active={openMenu === "status" || !!status}
                  onClick={() =>
                    setOpenMenu(openMenu === "status" ? null : "status")
                  }
                />
                {openMenu === "status" && <StatusPopover />}
              </div>

              {/* Sort */}
              <div className="ml-auto flex items-center gap-2">
                <label className="text-sm text-gray-600">Sắp xếp</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded border border-gray-300 text-sm px-2 py-1.5"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="priceAsc">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                  <option value="yearDesc">Năm ↓</option>
                  <option value="yearAsc">Năm ↑</option>
                </select>

                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>

            {/* Active filter pills */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {priceFrom !== 0 || priceTo !== 5_000_000_000 ? (
                  <ActivePill
                    text={`Giá: ${priceFrom.toLocaleString(
                      "vi-VN"
                    )} - ${priceTo.toLocaleString("vi-VN")}`}
                    onClear={() => {
                      setPriceFrom(0);
                      setPriceTo(5_000_000_000);
                    }}
                  />
                ) : null}
                {yearFrom ? (
                  <ActivePill
                    text={`Năm ≥ ${yearFrom}`}
                    onClear={() => setYearFrom("")}
                  />
                ) : null}
                {yearTo ? (
                  <ActivePill
                    text={`Năm ≤ ${yearTo}`}
                    onClear={() => setYearTo("")}
                  />
                ) : null}
                {brandId ? (
                  <ActivePill
                    text={`Hãng: ${
                      filteredBrandList.find(
                        (b) => String(b.id) === String(brandId)
                      )?.name || brandId
                    }`}
                    onClear={() => setBrandId("")}
                  />
                ) : null}
                {status ? (
                  <ActivePill
                    text={`Tình trạng: ${formatListingStatus(status)}`}
                    onClear={() => setStatus("")}
                  />
                ) : null}

                {sortBy !== "newest" ? (
                  <ActivePill
                    text={`Sort: ${sortBy}`}
                    onClear={() => setSortBy("newest")}
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Brand scroller (optional) */}
        {filteredBrandList.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
            <div className="flex gap-6 overflow-auto">
              {filteredBrandList.slice(0, 12).map((b) => (
                <button
                  key={`brand-chip-${b.id}`}
                  onClick={() => setBrandId(b.id)}
                  className={`min-w-[64px] text-sm text-gray-700 hover:text-gray-900 cursor-pointer ${
                    String(brandId) === String(b.id) ? "font-semibold" : ""
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Listing grid */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {renderCards()}
          </div>

          {/* Load more */}
          {!loading && visibleItems.length < totalItems && (
            <div className="flex justify-center">
              <button
                onClick={() => setUiPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm cursor-pointer"
              >
                Xem thêm {Math.min(pageSize, totalItems - visibleItems.length)}{" "}
                / {totalItems - visibleItems.length}
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Category;
