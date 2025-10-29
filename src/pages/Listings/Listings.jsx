import React, { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronDown, FiHeart, FiMapPin, FiSearch, FiX } from "react-icons/fi";
import listingService from "../../services/apis/listingApi";
import brandService from "../../services/apis/brandApi";
import { useFavorites } from "../../contexts/FavoritesContext";

const DEFAULT_PAGE_SIZE = 20;
const FALLBACK_LISTING_IMAGE = "https://placehold.co/600x450?text=Listing";
const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả danh mục" },
  { value: "ElectricCar", label: "Ô tô điện" },
  { value: "ElectricMotorbike", label: "Xe máy điện" },
  { value: "RemovableBattery", label: "Pin rời" },
];

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

const statusLabel = (s) => (s === "New" ? "Mới" : s === "Used" ? "Đã sử dụng" : s || "");

// Normalize brand "type" to stable values used across the app
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
  type: normalizeBrandType(b.type ?? b.Type ?? b.category ?? b.Category ?? b.kind),
});

function useDebouncedValue(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

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

export default function Listings() {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebouncedValue(query, 450);
  const [category, setCategory] = useState(searchParams.get("cat") || "");
  const [priceFrom, setPriceFrom] = useState(Number(searchParams.get("from")) || 0);
  const [priceTo, setPriceTo] = useState(Number(searchParams.get("to")) || 5_000_000_000);
  const [yearFrom, setYearFrom] = useState(searchParams.get("yfrom") || "");
  const [yearTo, setYearTo] = useState(searchParams.get("yto") || "");
  const [brandId, setBrandId] = useState(searchParams.get("brandId") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  // UI paging
  const [uiPage, setUiPage] = useState(1);
  const [pageSize] = useState(
    Number(searchParams.get("pageSize")) > 0
      ? Number(searchParams.get("pageSize"))
      : DEFAULT_PAGE_SIZE
  );

  // Popovers
  const [openMenu, setOpenMenu] = useState(null);
  const priceRef = useRef(null);
  const yearRef = useRef(null);
  const brandRef = useRef(null);
  const statusRef = useRef(null);
  const categoryRef = useRef(null);
  useOnClickOutside(priceRef, () => openMenu === "price" && setOpenMenu(null));
  useOnClickOutside(yearRef, () => openMenu === "year" && setOpenMenu(null));
  useOnClickOutside(brandRef, () => openMenu === "brand" && setOpenMenu(null));
  useOnClickOutside(statusRef, () => openMenu === "status" && setOpenMenu(null));
  useOnClickOutside(categoryRef, () => openMenu === "category" && setOpenMenu(null));

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
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredBrandList = useMemo(() => {
    const byType = brands
      .map(toBrandModel)
      .filter((b) => !category || b.type === category);
    if (!brandSearch.trim()) return byType;
    return byType.filter((b) =>
      b.name.toLowerCase().includes(brandSearch.trim().toLowerCase())
    );
  }, [brands, category, brandSearch]);

  // Fetch
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          pageIndex: 1,
          pageSize: 500,
          // Note: do NOT pass text search to backend here.
          // Backend search does not include model, which breaks model queries.
          // We fetch broadly and apply robust client-side filtering below.
          from: Math.max(0, Number(priceFrom) || 0),
          to: Math.max(Number(priceFrom) || 0, Number(priceTo) || 0),
          category: category || undefined,
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
    setUiPage(1);
  }, [category, brandId, status, area, priceFrom, priceTo, yearFrom, yearTo]);

  // URL sync
  useEffect(() => {
    if (openMenu !== null) return;
    const next = new URLSearchParams(searchParams);
    query ? next.set("q", String(query)) : next.delete("q");
    category ? next.set("cat", String(category)) : next.delete("cat");
    next.set("from", String(priceFrom || 0));
    next.set("to", String(priceTo || 0));
    yearFrom ? next.set("yfrom", String(yearFrom)) : next.delete("yfrom");
    yearTo ? next.set("yto", String(yearTo)) : next.delete("yto");
    brandId ? next.set("brandId", String(brandId)) : next.delete("brandId");
    status ? next.set("status", String(status)) : next.delete("status");
    area ? next.set("area", String(area)) : next.delete("area");
    sortBy ? next.set("sort", String(sortBy)) : next.delete("sort");
    next.set("pageSize", String(pageSize));
    setSearchParams(next, { replace: true });
  }, [query, category, priceFrom, priceTo, yearFrom, yearTo, brandId, status, area, sortBy, pageSize, openMenu]);

  // Client filter + sort + slice (robust to backend param mismatches)
  const clientFilteredSorted = useMemo(() => {
    const arr = Array.isArray(rawItems) ? rawItems : [];

    const fromPrice = Math.max(0, Number(priceFrom) || 0);
    const toPrice = Math.max(fromPrice, Number(priceTo) || 0);
    const yFrom = Number(yearFrom) || 0;
    const yTo = Number(yearTo) || 0;

    const getNum = (v) => (isNaN(Number(v)) ? 0 : Number(v));
    const getYear = (it) => getNum(it.yearOfManufacture ?? it.YearOfManufacture ?? 0);
    const getPrice = (it) => getNum(it.price ?? it.Price ?? 0);
    const getStatus = (it) => String(it.listingStatus ?? it.ListingStatus ?? "");
    const getCat = (it) => normalizeBrandType(it.category ?? it.Category ?? "");
    const getBrandId = (it) => String(it.brand?.id ?? it.brandId ?? it.BrandId ?? it.BrandID ?? "");
    const getArea = (it) => String(it.area ?? it.Area ?? "");
    const getTitle = (it) => String(it.title ?? it.Title ?? "");
    const getModel = (it) => String(it.model ?? it.Model ?? "");
    const getBrandName = (it) => String(it.brand?.name ?? it.brandName ?? it.BrandName ?? "");
    const getDateVal = (it) => {
      const d = it.activatedAt ?? it.creationDate ?? it.createdAt ?? it.postedOn ?? null;
      const t = d ? new Date(d).getTime() : 0;
      return Number.isFinite(t) ? t : 0;
    };

    const filtered = arr.filter((it) => {
      // Text query across title/brand/model/area
      if (debouncedQuery && debouncedQuery.trim()) {
        const q = debouncedQuery.trim().toLowerCase();
        const hay = [getTitle(it), getBrandName(it), getModel(it), getArea(it)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Category
      if (category) {
        const cat = getCat(it);
        if (cat && cat !== category) return false;
      }

      // Price range
      const p = getPrice(it);
      if (p < fromPrice || p > toPrice) return false;

      // Year range
      const y = getYear(it);
      if (yearFrom && (!y || y < yFrom)) return false;
      if (yearTo && (!y || y > yTo)) return false;

      // Brand
      if (brandId) {
        const bId = getBrandId(it);
        if (!bId || String(bId) !== String(brandId)) return false;
      }

      // Status
      if (status) {
        const st = getStatus(it);
        if (!st || String(st) !== String(status)) return false;
      }

      // Area (contains, case-insensitive)
      if (area && area.trim()) {
        const ar = getArea(it).toLowerCase();
        if (!ar.includes(area.trim().toLowerCase())) return false;
      }

      return true;
    });

    const sorted = filtered.sort((a, b) => {
      if (sortBy === "priceAsc") return getPrice(a) - getPrice(b);
      if (sortBy === "priceDesc") return getPrice(b) - getPrice(a);
      if (sortBy === "yearAsc") return getYear(a) - getYear(b);
      if (sortBy === "yearDesc") return getYear(b) - getYear(a);
      return getDateVal(b) - getDateVal(a);
    });

    return sorted;
  }, [
    rawItems,
    debouncedQuery,
    category,
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
    setQuery("");
    setCategory("");
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

  const PricePopover = () => {
    const [localFrom, setLocalFrom] = useState(priceFrom);
    const [localTo, setLocalTo] = useState(priceTo);
    const apply = () => {
      setPriceFrom(localFrom);
      setPriceTo(localTo);
      setOpenMenu(null);
    };
    const reset = () => {
      setLocalFrom(0);
      setLocalTo(5_000_000_000);
    };
    return (
      <div
        ref={priceRef}
        className="absolute z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-sm text-gray-700 font-medium">Khoảng giá</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localFrom}
            onChange={(e) => setLocalFrom(Number(e.target.value) || 0)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
            placeholder="Giá tối thiểu"
          />
          <span>-</span>
          <input
            type="number"
            value={localTo}
            onChange={(e) => setLocalTo(Number(e.target.value) || 0)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
            placeholder="Giá tối đa"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setLocalFrom(p.from);
                setLocalTo(p.to || 5_000_000_000);
              }}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button onClick={reset} className="rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer">Xóa lọc</button>
          <button onClick={apply} className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white cursor-pointer">Áp dụng</button>
        </div>
      </div>
    );
  };

  const YearPopover = () => {
    const [localFrom, setLocalFrom] = useState(yearFrom);
    const [localTo, setLocalTo] = useState(yearTo);
    const apply = () => {
      setYearFrom(localFrom);
      setYearTo(localTo);
      setOpenMenu(null);
    };
    const reset = () => {
      setLocalFrom("");
      setLocalTo("");
    };
    return (
      <div ref={yearRef} className="absolute z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className="mb-3 text-sm text-gray-700 font-medium">Năm sản xuất</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localFrom}
            onChange={(e) => setLocalFrom(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
            placeholder="Từ năm"
          />
          <span>-</span>
          <input
            type="number"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
            placeholder="Đến năm"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {YEAR_PRESETS.map((y) => (
            <button
              key={y.label}
              onClick={() => {
                setLocalFrom(y.from);
                setLocalTo(y.to);
              }}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              {y.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button onClick={reset} className="rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer">Xóa lọc</button>
          <button onClick={apply} className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white cursor-pointer">Áp dụng</button>
        </div>
      </div>
    );
  };

  const BrandPopover = () => {
    const [localBrandId, setLocalBrandId] = useState(brandId);
    const apply = () => {
      setBrandId(localBrandId);
      setOpenMenu(null);
    };
    const reset = () => setLocalBrandId("");
    return (
      <div ref={brandRef} className="absolute z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className="mb-2 text-sm text-gray-700 font-medium">Thương hiệu</div>
        <input
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          placeholder="Tìm thương hiệu"
          className="mb-3 w-full rounded border border-gray-300 px-3 py-2"
        />
        <div className="max-h-64 overflow-auto space-y-1">
          {filteredBrandList.map((b) => (
            <label key={b.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
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
          <button onClick={reset} className="rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer">Xóa lọc</button>
          <button onClick={apply} className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white cursor-pointer">Áp dụng</button>
        </div>
      </div>
    );
  };

  const StatusPopover = () => {
    const [localStatus, setLocalStatus] = useState(status);
    const apply = () => {
      setStatus(localStatus);
      setOpenMenu(null);
    };
    const reset = () => setLocalStatus("");
    return (
      <div ref={statusRef} className="absolute z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className="mb-2 text-sm text-gray-700 font-medium">Tình trạng</div>
        {[{ value: "New", label: "Mới" }, { value: "Used", label: "Đã sử dụng" }].map((opt) => (
          <label key={opt.value} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
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
          <button onClick={reset} className="rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer">Xóa lọc</button>
          <button onClick={apply} className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white cursor-pointer">Áp dụng</button>
        </div>
      </div>
    );
  };

  const CategoryPopover = () => {
    const [localCat, setLocalCat] = useState(category);
    const apply = () => {
      setCategory(localCat);
      setOpenMenu(null);
    };
    const reset = () => setLocalCat("");
    return (
      <div ref={categoryRef} className="absolute z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className="mb-2 text-sm text-gray-700 font-medium">Danh mục</div>
        {CATEGORY_OPTIONS.map((opt) => (
          <label key={opt.value || "all"} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
            <span>{opt.label}</span>
            <input
              type="radio"
              name="cat"
              value={opt.value}
              checked={String(localCat) === String(opt.value)}
              onChange={() => setLocalCat(opt.value)}
            />
          </label>
        ))}
        <div className="mt-2 pt-2 flex items-center justify-between border-t">
          <button onClick={reset} className="rounded border border-gray-300 px-3 py-1.5 text-sm cursor-pointer">Xóa lọc</button>
          <button onClick={apply} className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white cursor-pointer">Áp dụng</button>
        </div>
      </div>
    );
  };

  const ListingCard = ({ listing }) => {
    const coverImage = listing?.listingImages?.[0]?.imageUrl || FALLBACK_LISTING_IMAGE;
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
          {listing?.listingStatus && (
            <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-md text-white bg-blue-600">
              {statusLabel(listing.listingStatus)}
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
              favActive ? "bg-white text-red-500" : "bg-white/90 text-gray-600 hover:text-red-500"
            }`}
          >
            <FiHeart className={`w-5 h-5 ${favActive ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-base mb-1 line-clamp-2 min-h-[2.75rem]">{listing?.title}</h3>
          {metaParts.length > 0 && (
            <p className="text-gray-500 text-xs mb-1">{metaParts.join(" / ")}</p>
          )}
          {secondaryParts.length > 0 && (
            <p className="text-gray-500 text-xs mb-1">{secondaryParts.join(" · ")}</p>
          )}
          <p className="text-red-600 font-bold text-lg mb-2">{formatCurrency(listing?.price)}</p>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <FiMapPin className="shrink-0" />
            <span className="truncate">{listing?.area || "Chưa cập nhật"}</span>
          </div>
        </div>
      </Link>
    );
  };

  const hasActiveFilters = useMemo(() => {
    return (
      !!query ||
      !!category ||
      priceFrom !== 0 ||
      priceTo !== 5_000_000_000 ||
      !!yearFrom ||
      !!yearTo ||
      !!brandId ||
      !!status ||
      !!area ||
      sortBy !== "newest"
    );
  }, [query, category, priceFrom, priceTo, yearFrom, yearTo, brandId, status, area, sortBy]);

  return (
    <MainLayout>
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm sản phẩm, thương hiệu, model..."
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Xóa tìm kiếm"
                >
                  <FiX />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <FilterChip
                  label={category ? CATEGORY_OPTIONS.find((c) => c.value === category)?.label || "Danh mục" : "Danh mục"}
                  active={openMenu === "category"}
                  onClick={() => setOpenMenu((m) => (m === "category" ? null : "category"))}
                  ariaLabel="Chọn danh mục"
                />
                {openMenu === "category" && <CategoryPopover />}
              </div>
              <div className="relative">
                <FilterChip
                  label={brandId ? `Hãng: ${filteredBrandList.find((b) => String(b.id) === String(brandId))?.name || brandId}` : "Thương hiệu"}
                  active={openMenu === "brand"}
                  onClick={() => setOpenMenu((m) => (m === "brand" ? null : "brand"))}
                  ariaLabel="Chọn thương hiệu"
                />
                {openMenu === "brand" && <BrandPopover />}
              </div>
              <div className="relative">
                <FilterChip
                  label={priceFrom !== 0 || priceTo !== 5_000_000_000 ? `Giá: ${priceFrom.toLocaleString("vi-VN")} - ${priceTo.toLocaleString("vi-VN")}` : "Khoảng giá"}
                  active={openMenu === "price"}
                  onClick={() => setOpenMenu((m) => (m === "price" ? null : "price"))}
                  ariaLabel="Chọn khoảng giá"
                />
                {openMenu === "price" && <PricePopover />}
              </div>
              <div className="relative">
                <FilterChip
                  label={yearFrom || yearTo ? `Năm: ${yearFrom || "-"} - ${yearTo || "-"}` : "Năm sản xuất"}
                  active={openMenu === "year"}
                  onClick={() => setOpenMenu((m) => (m === "year" ? null : "year"))}
                  ariaLabel="Chọn năm sản xuất"
                />
                {openMenu === "year" && <YearPopover />}
              </div>
              <div className="relative">
                <FilterChip
                  label={status ? `Tình trạng: ${statusLabel(status)}` : "Tình trạng"}
                  active={openMenu === "status"}
                  onClick={() => setOpenMenu((m) => (m === "status" ? null : "status"))}
                  ariaLabel="Chọn tình trạng"
                />
                {openMenu === "status" && <StatusPopover />}
              </div>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Khu vực"
                className="w-36 rounded-lg border border-gray-300 px-3 py-2"
              />
              <div className="flex items-center gap-2">
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
              </div>
              <button
                type="button"
                onClick={onClearAll}
                className="text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {query ? (
                <ActivePill text={`Tìm: ${query}`} onClear={() => setQuery("")} />
              ) : null}
              {category ? (
                <ActivePill
                  text={`Danh mục: ${CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category}`}
                  onClear={() => setCategory("")}
                />
              ) : null}
              {priceFrom !== 0 || priceTo !== 5_000_000_000 ? (
                <ActivePill
                  text={`Giá: ${priceFrom.toLocaleString("vi-VN")} - ${priceTo.toLocaleString("vi-VN")}`}
                  onClear={() => {
                    setPriceFrom(0);
                    setPriceTo(5_000_000_000);
                  }}
                />
              ) : null}
              {yearFrom ? (
                <ActivePill text={`Năm ≥ ${yearFrom}`} onClear={() => setYearFrom("")} />
              ) : null}
              {yearTo ? (
                <ActivePill text={`Năm ≤ ${yearTo}`} onClear={() => setYearTo("")} />
              ) : null}
              {brandId ? (
                <ActivePill
                  text={`Hãng: ${filteredBrandList.find((b) => String(b.id) === String(brandId))?.name || brandId}`}
                  onClear={() => setBrandId("")}
                />
              ) : null}
              {status ? (
                <ActivePill text={`Tình trạng: ${statusLabel(status)}`} onClear={() => setStatus("")} />
              ) : null}
              {area ? <ActivePill text={`Khu vực: ${area}`} onClear={() => setArea("")} /> : null}
              {sortBy !== "newest" ? (
                <ActivePill text={`Sort: ${sortBy}`} onClear={() => setSortBy("newest")} />
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
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
                ))
              : visibleItems.length > 0
              ? visibleItems.map((l) => <ListingCard key={l.id} listing={l} />)
              : (
                  <div className="col-span-full text-center text-gray-600">Không có kết quả phù hợp.</div>
                )}
          </div>
          {!loading && visibleItems.length < totalItems && (
            <div className="flex justify-center">
              <button
                onClick={() => setUiPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm cursor-pointer"
              >
                Xem thêm {Math.min(pageSize, totalItems - visibleItems.length)} / {totalItems - visibleItems.length}
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
