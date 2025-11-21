// ===============================
// File: src/pages/Admin/DashboardPage.jsx
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card/card";

import adminService from "../../services/apis/adminApi";
import dashboardService from "../../services/apis/dashboardApi";
import transactionService from "../../services/apis/transactionApi";
import listingService from "../../services/apis/listingApi";
import brandService from "../../services/apis/brandApi";

import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_LISTING } from "../../constants/apiEndPoint";

import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from "recharts";
import { BarChart3, CalendarRange } from "lucide-react";

/* ===== Colors & styles ===== */
const CORE_COLORS = ["#2563EB", "#F59E0B", "#22C55E"];
const OTHERS_COLOR = "#9CA3AF";
const BAR_NEW_COLOR = "#10B981";
const BAR_USED_COLOR = "#EF4444";

const GLASS_CARD =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";
const KPI_CARD_STYLES = [
  "bg-gradient-to-br from-cyan-500/90 via-sky-500/90 to-blue-600/90",
  "bg-gradient-to-br from-amber-500/90 via-orange-500/90 to-rose-500/90",
];

/* ===== Utilities ===== */
function formatVND(value) {
  const n = Number(value) || 0;
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n}`;
  }
}

const formatKpiValue = (k) => {
  const n = Number(k?.value) || 0;
  return k?.label?.toLowerCase?.().includes("doanh thu")
    ? formatVND(n) // Hiển thị VND đầy đủ, không rút gọn mđ
    : n.toLocaleString("vi-VN");
};

function compactNumber(value) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value || 0);
  } catch {
    return `${value}`;
  }
}

function percent(value, total) {
  if (!total) return 0;
  return (value / total) * 100;
}

function extractItems(payload) {
  const p = payload?.data ?? payload;
  if (Array.isArray(p)) return p;
  if (Array.isArray(p?.items)) return p.items;
  if (Array.isArray(p?.data)) return p.data;
  if (p && typeof p === "object") {
    for (const k of Object.keys(p)) if (Array.isArray(p[k])) return p[k];
  }
  return [];
}

function ymd(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
function getQuarter(d) {
  return Math.floor(d.getMonth() / 3) + 1;
}

/* ===== Transaction helpers (field detection) ===== */
function pickAmount(tx) {
  const cand = [
    "amount",
    "totalAmount",
    "grandTotal",
    "total",
    "price",
    "value",
    "finalAmount",
  ];
  for (const k of cand) {
    if (tx && typeof tx[k] !== "undefined") {
      const n = Number(tx[k]);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

// Chỉ tính doanh thu khi giao dịch thành công.
// Ưu tiên mã số (1) nếu có; fallback chuỗi "success"
function isSuccess(tx) {
  const candidates = [
    tx?.status,
    tx?.paymentStatus,
    tx?.Status,
    tx?.PaymentStatus,
  ];

  for (const s of candidates) {
    if (typeof s === "number") return s === 1;

    if (typeof s === "string") {
      const v = s.trim();

      // Nếu API trả "1" dạng string
      if (/^\d+$/.test(v)) return Number(v) === 1;

      // Chuỗi mô tả thành công
      const t = v.toLowerCase();
      if (t.includes("success")) {
        return true;
      }
    }
  }
  return false;
}

function pickDate(tx) {
  const cand = [
    "paidAt",
    "createdAt",
    "transactionDate",
    "timestamp",
    "date",
    "created_on",
  ];
  for (const k of cand) {
    if (tx?.[k]) {
      const d = new Date(tx[k]);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return new Date();
}

/* ===== Tooltip theme ===== */
const darkTip = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  color: "#e5e7eb",
  borderRadius: 10,
  padding: 10,
  boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
};
const darkLabel = { color: "#e5e7eb" };
const darkItem = { color: "#e5e7eb" };

/* ===== Brand / Listing helpers ===== */
function resolveBrandName(listing, brandIdToMeta) {
  const brandId =
    listing?.brandId ??
    listing?.brandID ??
    listing?.brand?.id ??
    listing?.brand?.brandId ??
    listing?.brand?.Id;

  const brandName =
    listing?.brand?.name ??
    listing?.brandName ??
    (brandId ? brandIdToMeta.get(brandId)?.name : undefined);

  return brandName || "Unknown";
}
function resolveBucketByCategory(listing, brandIdToMeta) {
  const cat = String(listing?.category || listing?.type || "").toLowerCase();
  if (cat.includes("car")) return "car";
  if (cat.includes("bike")) return "motorbike";
  if (cat.includes("battery")) return "battery";

  // Fallback theo brand.type
  const brandId =
    listing?.brandId ??
    listing?.brandID ??
    listing?.brand?.id ??
    listing?.brand?.brandId ??
    listing?.brand?.Id;
  const t = (brandId ? brandIdToMeta.get(brandId)?.type : "") || "";
  const tl = String(t).toLowerCase();
  if (tl.includes("car")) return "car";
  if (tl.includes("bike")) return "motorbike";
  if (tl.includes("battery")) return "battery";

  return null;
}
function top3WithOthers(data) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const top3 = sorted.slice(0, 3);
  const othersCount = sorted.slice(3).reduce((s, i) => s + (i.count || 0), 0);
  return othersCount > 0
    ? [...top3, { brand: "Others", count: othersCount }]
    : top3;
}

/* ===== Fallback fetchers ===== */
async function safeGetAllListings() {
  // Ưu tiên dùng listingService.getAllListingsAllPages nếu có
  if (typeof listingService.getAllListingsAllPages === "function") {
    return listingService.getAllListingsAllPages({
      pageSize: 200,
      maxPages: 30,
    });
  }
  // Fallback: gọi trực tiếp endpoint với phân trang
  const all = [];
  for (let page = 1; page <= 30; page++) {
    const res = await performApiRequest(API_ENDPOINTS_LISTING.GET_ALL, {
      method: "GET",
      params: { pageIndex: page, pageSize: 200 },
    });
    const items = extractItems(res);
    all.push(...items);
    if (!items || items.length < 200) break;
  }
  return all;
}
async function safeGetBrandMap() {
  if (typeof brandService.getBrandsAsMap === "function") {
    return brandService.getBrandsAsMap();
  }
  const res = await brandService.getBrands();
  const items = extractItems(res);
  return new Map(
    items.map((b) => [
      b?.id ?? b?.brandId ?? b?.Id,
      {
        name: b?.name ?? b?.brandName ?? "Unknown",
        type: b?.type ?? b?.category ?? "",
      },
    ])
  );
}

export default function DashboardPage() {
  /* ===== KPI: Tổng user ===== */
  const [userCount, setUserCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminService.getCountUser();
        if (cancelled) return;
        const payload = res?.data ?? res;
        let total = 0;
        if (Array.isArray(payload?.data)) total = payload.data.length;
        else if (typeof payload?.count === "number") total = payload.count;
        else if (Array.isArray(res?.data)) total = res.data.length;
        setUserCount(Number(total) || 0);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ===== Listing dashboard (new/old counts) ===== */
  const [dashStats, setDashStats] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await dashboardService.getListingDashboard();
        if (cancelled) return;
        if (res?.success && res?.data?.error === 0) {
          setDashStats(res.data.data || null);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ===== Revenue from transactions ===== */
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState([]); // [{date, revenue}]
  const [quarterRevenue, setQuarterRevenue] = useState([]); // [{quarter, revenue}]
  const [view, setView] = useState("day"); // "day" | "quarter" | "range"
  const [completedTransactions, setCompletedTransactions] = useState([]);

  // Custom date range (default: first day of current month -> today)
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return ymd(d);
  });
  const [rangeEnd, setRangeEnd] = useState(() => ymd(new Date()));
  const [rangeRevenue, setRangeRevenue] = useState([]); // [{date, revenue}]

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingRevenue(true);
      try {
        // Lấy tất cả users (gom trang)
        const users =
          typeof adminService.getAllUsersAllPages === "function"
            ? await adminService.getAllUsersAllPages({
                pageSize: 200,
                maxPages: 20,
              })
            : [];

        const userIds = users
          .map(
            (u) =>
              u?.id ?? u?.userId ?? u?.userID ?? u?.Id ?? u?.ID ?? u?.UserId
          )
          .filter(Boolean);

        // Lấy toàn bộ giao dịch cho tất cả users (batch)
        const getAllTx =
          transactionService.getAllByUserId ||
          transactionService.getAllTransactionsByUserId;
        const results = [];
        if (getAllTx && userIds.length) {
          for (let i = 0; i < userIds.length; i += 6) {
            const batch = userIds.slice(i, i + 6);
            const settled = await Promise.allSettled(
              batch.map((uid) =>
                getAllTx.call(transactionService, uid, {
                  pageSize: 200,
                  maxPages: 5,
                })
              )
            );
            settled.forEach(
              (s) =>
                s.status === "fulfilled" &&
                Array.isArray(s.value) &&
                results.push(...s.value)
            );
          }
        }

        if (cancelled) return;

        const completed = results.filter(isSuccess);
        setCompletedTransactions(completed);

        // KPI: hôm nay
        const todayKey = ymd(new Date());
        const todaySum = completed
          .filter((t) => ymd(pickDate(t)) === todayKey)
          .reduce((s, t) => s + pickAmount(t), 0);
        setTodayRevenue(todaySum);

        // Theo ngày (15 ngày gần nhất)
        const days = [];
        const dayMap = new Map();
        for (let i = 14; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = ymd(d);
          const label = d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
          days.push({ key, label, revenue: 0 });
          dayMap.set(key, days[days.length - 1]);
        }

        for (const t of completed) {
          const k = ymd(pickDate(t));
          const slot = dayMap.get(k);
          if (slot) slot.revenue += pickAmount(t);
        }
        setDailyRevenue(
          days.map(({ label, revenue }) => ({ date: label, revenue }))
        );

        // Theo quý (năm hiện tại)
        const y = new Date().getFullYear();
        const qMap = new Map([
          ["Q1", 0],
          ["Q2", 0],
          ["Q3", 0],
          ["Q4", 0],
        ]);
        for (const t of completed) {
          const d = pickDate(t);
          if (d.getFullYear() !== y) continue;
          const q = `Q${getQuarter(d)}`;
          qMap.set(q, qMap.get(q) + pickAmount(t));
        }
        setQuarterRevenue([
          { quarter: `Q1 ${y}`, revenue: qMap.get("Q1") },
          { quarter: `Q2 ${y}`, revenue: qMap.get("Q2") },
          { quarter: `Q3 ${y}`, revenue: qMap.get("Q3") },
          { quarter: `Q4 ${y}`, revenue: qMap.get("Q4") },
        ]);
      } catch {
      } finally {
        if (!cancelled) setLoadingRevenue(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Compute rangeRevenue whenever range or transactions change
  useEffect(() => {
    try {
      const start = new Date(rangeStart);
      const end = new Date(rangeEnd);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setRangeRevenue([]);
        return;
      }
      // ensure start <= end
      let s = start;
      let e = end;
      if (start > end) {
        s = end;
        e = start;
      }
      const days = [];
      const dayMap = new Map();
      const cur = new Date(s);
      while (cur <= e) {
        const key = ymd(cur);
        const label = cur.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });
        const obj = { key, label, revenue: 0 };
        days.push(obj);
        dayMap.set(key, obj);
        cur.setDate(cur.getDate() + 1);
      }
      for (const t of completedTransactions) {
        const k = ymd(pickDate(t));
        const slot = dayMap.get(k);
        if (slot) slot.revenue += pickAmount(t);
      }
      setRangeRevenue(
        days.map(({ label, revenue }) => ({ date: label, revenue }))
      );
    } catch {
      setRangeRevenue([]);
    }
  }, [completedTransactions, rangeStart, rangeEnd]);

  /* ===== KPI list ===== */
  const kpiList = useMemo(
    () => [
      { label: "Tổng User", value: userCount },
      { label: "Doanh thu hôm nay", value: todayRevenue }, // VND đầy đủ
    ],
    [userCount, todayRevenue]
  );

  /* ===== Pie: số bài đăng theo brand ===== */
  const [brandMode, setBrandMode] = useState("car"); // "car" | "motorbike" | "battery"
  const [brandLoading, setBrandLoading] = useState(true);
  const [brandBreakdown, setBrandBreakdown] = useState({
    car: [],
    motorbike: [],
    battery: [],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBrandLoading(true);
      try {
        const [brandMap, listings] = await Promise.all([
          safeGetBrandMap(),
          safeGetAllListings(),
        ]);

        const buckets = {
          car: new Map(),
          motorbike: new Map(),
          battery: new Map(),
        };
        for (const l of listings) {
          const bucket = resolveBucketByCategory(l, brandMap);
          if (!bucket) continue;
          const brandName = resolveBrandName(l, brandMap);
          buckets[bucket].set(
            brandName,
            (buckets[bucket].get(brandName) || 0) + 1
          );
        }
        const toArr = (m) =>
          Array.from(m.entries())
            .map(([brand, count]) => ({ brand, count }))
            .sort((a, b) => b.count - a.count);

        if (!cancelled) {
          setBrandBreakdown({
            car: toArr(buckets.car),
            motorbike: toArr(buckets.motorbike),
            battery: toArr(buckets.battery),
          });
        }
      } catch {
      } finally {
        if (!cancelled) setBrandLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rawBrandData = useMemo(
    () => brandBreakdown[brandMode] || [],
    [brandBreakdown, brandMode]
  );
  const pieData = useMemo(() => top3WithOthers(rawBrandData), [rawBrandData]);
  const pieCleanData = useMemo(
    () => pieData.filter((d) => (d.count || 0) > 0),
    [pieData]
  );
  const pieTotal = useMemo(
    () => pieCleanData.reduce((s, i) => s + i.count, 0),
    [pieCleanData]
  );

  const brandColorMap = useMemo(() => {
    const m = new Map();
    let colorIdx = 0;
    for (const item of pieCleanData) {
      const color =
        item.brand === "Others"
          ? OTHERS_COLOR
          : CORE_COLORS[colorIdx] || CORE_COLORS[CORE_COLORS.length - 1];
      if (item.brand !== "Others") colorIdx += 1;
      m.set(item.brand, color);
    }
    return m;
  }, [pieCleanData]);

  const legendPayload = useMemo(
    () =>
      [...pieCleanData]
        .sort((a, b) => b.count - a.count)
        .map((item) => ({
          value: item.brand,
          id: item.brand,
          type: "circle",
          color: brandColorMap.get(item.brand),
        })),
    [pieCleanData, brandColorMap]
  );

  /* ===== Bar: bài đăng theo loại & tình trạng ===== */
  const postsTypeConditionData = useMemo(() => {
    if (dashStats) {
      const d = dashStats;
      return [
        {
          type: "Xe hơi",
          new: Number(d.totalNewCars || 0),
          used: Number(d.totalOldCars || 0),
        },
        {
          type: "Xe máy",
          new: Number(d.totalNewBikes || 0),
          used: Number(d.totalOldBikes || 0),
        },
        {
          type: "Pin điện",
          new: Number(d.totalNewBateries || 0),
          used: Number(d.totalOldBateries || 0),
        },
      ];
    }
    return [];
  }, [dashStats]);

  const totalRevenueSum = useMemo(() => {
    const list =
      view === "day"
        ? dailyRevenue
        : view === "quarter"
        ? quarterRevenue
        : rangeRevenue;
    return list.reduce((sum, i) => sum + (i.revenue || 0), 0);
  }, [view, dailyRevenue, quarterRevenue, rangeRevenue]);

  return (
    <div className="mx-auto max-w-7xl grid gap-6 text-slate-100">
      {/* KPI */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {kpiList.map((k, i) => (
          <div
            key={i}
            className={`${
              KPI_CARD_STYLES[i % KPI_CARD_STYLES.length]
            } text-white rounded-xl ring-1 ring-white/10 p-5 backdrop-blur-lg`}
          >
            <div className="text-sm opacity-90">{k.label}</div>
            <div className="text-3xl font-extrabold mt-2">
              {formatKpiValue(k)}
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8">
        {/* Chart 1: Doanh thu */}
        <Card className={`col-span-1 lg:col-span-2 ${GLASS_CARD}`}>
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Tiêu đề + mô tả nhỏ */}
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Doanh Thu
                </CardTitle>
                <p className="mt-1 text-xs text-slate-400">
                  Tổng doanh thu{" "}
                  {view === "day"
                    ? "15 ngày gần nhất"
                    : view === "quarter"
                    ? "theo quý trong năm hiện tại"
                    : "theo khoảng ngày bạn chọn"}
                </p>
              </div>

              {/* Tổng + nút đổi view */}
              <div className="flex flex-col items-end gap-2">
                {/* Tổng doanh thu – làm nổi bật */}
                <div className="inline-flex items-baseline gap-2 rounded-2xl bg-blue-500/90 px-4 py-2 shadow-lg  border border-white/10">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-white/80">
                    Tổng
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-white whitespace-nowrap">
                    {formatVND(totalRevenueSum)}
                  </span>
                </div>

                {/* Nút chọn view */}
                <div className="inline-flex rounded-xl border border-slate-700 bg-slate-800/60 p-1 text-xs sm:text-sm shadow-sm">
                  <button
                    type="button"
                    onClick={() => setView("day")}
                    aria-pressed={view === "day"}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition cursor-pointer ${
                      view === "day"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/40"
                        : "text-slate-200 hover:bg-slate-700/50"
                    }`}
                  >
                    <CalendarRange className="h-4 w-4" />
                    Theo ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("quarter")}
                    aria-pressed={view === "quarter"}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition cursor-pointer ${
                      view === "quarter"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/40"
                        : "text-slate-200 hover:bg-slate-700/50"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Theo quý
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("range")}
                    aria-pressed={view === "range"}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition cursor-pointer ${
                      view === "range"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/40"
                        : "text-slate-200 hover:bg-slate-700/50"
                    }`}
                  >
                    <CalendarRange className="h-4 w-4" />
                    Khoảng ngày
                  </button>
                </div>
              </div>
            </div>

            {/* Chọn khoảng ngày */}
            {view === "range" && (
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span>Từ</span>
                <div className="relative">
                  <input
                    id="rangeStart"
                    type="date"
                    className="
            rounded-md bg-slate-800/60 border border-slate-700
            pl-2 pr-8 py-1 text-slate-100 text-xs cursor-pointer
            appearance-none
            [&::-webkit-calendar-picker-indicator]:hidden
          "
                    value={rangeStart}
                    max={rangeEnd}
                    onChange={(e) => setRangeStart(e.target.value)}
                  />
                  <CalendarRange
                    className="h-4 w-4 text-white absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => {
                      const el = document.getElementById("rangeStart");
                      if (el?.showPicker) el.showPicker();
                      else el?.focus();
                    }}
                  />
                </div>

                <span>Đến</span>
                <div className="relative">
                  <input
                    id="rangeEnd"
                    type="date"
                    className="
            rounded-md bg-slate-800/60 border border-slate-700
            pl-2 pr-8 py-1 text-slate-100 text-xs cursor-pointer
            appearance-none
            [&::-webkit-calendar-picker-indicator]:hidden
          "
                    value={rangeEnd}
                    min={rangeStart}
                    onChange={(e) => setRangeEnd(e.target.value)}
                  />
                  <CalendarRange
                    className="h-4 w-4 text-white absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => {
                      const el = document.getElementById("rangeEnd");
                      if (el?.showPicker) el.showPicker();
                      else el?.focus();
                    }}
                  />
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <div className="h-72">
              {loadingRevenue ? (
                <div className="h-full grid place-items-center text-slate-400">
                  Đang tải dữ liệu...
                </div>
              ) : view === "day" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRevenue} barCategoryGap={16}>
                    <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      tickMargin={8}
                      stroke="#7dd3fc"
                      tick={{ fill: "#7dd3fc" }}
                    />
                    <YAxis
                      tickFormatter={compactNumber}
                      width={60}
                      stroke="#7dd3fc"
                      tick={{ fill: "#7dd3fc" }}
                    />
                    <ChartTooltip
                      formatter={(value) => [formatVND(value), "Doanh thu"]}
                      labelFormatter={(l) => `Ngày ${l}`}
                      contentStyle={darkTip}
                      itemStyle={darkItem}
                      labelStyle={darkLabel}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="blueBar" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#1d4ed8"
                          stopOpacity={0.95}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1d4ed8"
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="revenue"
                      name="Doanh thu"
                      radius={[8, 8, 0, 0]}
                      fill="url(#blueBar)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : view === "quarter" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterRevenue} barCategoryGap={24}>
                    <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                    <XAxis
                      dataKey="quarter"
                      tickMargin={8}
                      stroke="#7dd3fc"
                      tick={{ fill: "#7dd3fc" }}
                    />
                    <YAxis
                      tickFormatter={compactNumber}
                      width={60}
                      stroke="#7dd3fc"
                      tick={{ fill: "#7dd3fc" }}
                    />
                    <ChartTooltip
                      formatter={(value) => [formatVND(value), "Doanh thu"]}
                      labelFormatter={(l) => `Kỳ ${l}`}
                      contentStyle={darkTip}
                      itemStyle={darkItem}
                      labelStyle={darkLabel}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="blueBar" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#1d4ed8"
                          stopOpacity={0.95}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1d4ed8"
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="revenue"
                      name="Doanh thu"
                      radius={[8, 8, 0, 0]}
                      fill="url(#blueBar)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rangeRevenue} barCategoryGap={16}>
                    <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      tickMargin={8}
                      stroke="#7dd3fc"
                      tick={{ fill: "#7dd3fc" }}
                    />
                    <YAxis
                      tickFormatter={compactNumber}
                      width={60}
                      stroke="#7dd3fc"
                      tick={{ fill: "#7dd3fc" }}
                    />
                    <ChartTooltip
                      formatter={(value) => [formatVND(value), "Doanh thu"]}
                      labelFormatter={(l) => `Ngày ${l}`}
                      contentStyle={darkTip}
                      itemStyle={darkItem}
                      labelStyle={darkLabel}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="blueBar" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#1d4ed8"
                          stopOpacity={0.95}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1d4ed8"
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="revenue"
                      name="Doanh thu"
                      radius={[8, 8, 0, 0]}
                      fill="url(#blueBar)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Pie theo brand */}
        <Card className={GLASS_CARD}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bài đăng theo nhãn hiệu
            </CardTitle>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-800/60 p-1 text-sm shadow-sm">
              <button
                type="button"
                onClick={() => setBrandMode("car")}
                aria-pressed={brandMode === "car"}
                className={`rounded-lg px-3 py-1.5 cursor-pointer ${
                  brandMode === "car"
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                Xe hơi
              </button>
              <button
                type="button"
                onClick={() => setBrandMode("motorbike")}
                aria-pressed={brandMode === "motorbike"}
                className={`rounded-lg px-3 py-1.5 cursor-pointer ${
                  brandMode === "motorbike"
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                Xe máy
              </button>
              <button
                type="button"
                onClick={() => setBrandMode("battery")}
                aria-pressed={brandMode === "battery"}
                className={`rounded-lg px-3 py-1.5 cursor-pointer ${
                  brandMode === "battery"
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                Pin
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {brandLoading ? (
                <div className="h-full grid place-items-center text-slate-400">
                  Đang tải thương hiệu & bài đăng...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart
                    margin={{ top: 8, right: 16, bottom: 36, left: 16 }}
                  >
                    <ChartTooltip
                      formatter={(v, name) => {
                        const val = Number(v);
                        const pct = percent(val, pieTotal).toFixed(1) + "%";
                        return [`${val} bài đăng (${pct})`, name];
                      }}
                      contentStyle={darkTip}
                      itemStyle={darkItem}
                      labelStyle={darkLabel}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      payload={legendPayload}
                      wrapperStyle={{ paddingTop: 8, color: "#e5e7eb" }}
                    />
                    <Pie
                      data={pieCleanData}
                      dataKey="count"
                      nameKey="brand"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={70}
                      paddingAngle={2}
                      minAngle={1}
                      label={false}
                      labelLine={false}
                    >
                      {pieCleanData.map((entry) => (
                        <Cell
                          key={`slice-${entry.brand}`}
                          fill={brandColorMap.get(entry.brand)}
                          stroke="#111827"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Bài đăng theo loại & tình trạng */}
        <Card className={`col-span-1 lg:col-span-3 ${GLASS_CARD}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bài đăng theo loại và tình trạng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={postsTypeConditionData} barCategoryGap={24}>
                  <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                  <XAxis
                    dataKey="type"
                    tickMargin={8}
                    stroke="#ffffff"
                    tick={{ fill: "#ffffff" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#a7f3d0"
                    tick={{ fill: "#a7f3d0" }}
                  />
                  <ChartTooltip
                    formatter={(value, key) => [
                      `${value} bài đăng`,
                      key === "new"
                        ? "Hàng mới"
                        : key === "used"
                        ? "Hàng cũ"
                        : key,
                    ]}
                    contentStyle={darkTip}
                    itemStyle={darkItem}
                    labelStyle={darkLabel}
                  />
                  <Legend />
                  <Bar
                    dataKey="used"
                    name="Hàng cũ"
                    fill={BAR_USED_COLOR}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="new"
                    name="Hàng mới"
                    fill={BAR_NEW_COLOR}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
