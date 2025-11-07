// ===============================
// File: src/pages/Admin/DashboardPage.jsx (legend sorted, slices keep order, fix missing slice)
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card/card";
import listingService from "../../services/apis/listingApi";
import adminService from "../../services/apis/adminApi";
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

// ===== Colors (outside component) =====
const CORE_COLORS = ["#2563EB", "#F59E0B", "#22C55E"]; // blue, orange, green
const OTHERS_COLOR = "#9CA3AF"; // gray
const BAR_NEW_COLOR = "#10B981"; // green
const BAR_USED_COLOR = "#EF4444"; // red

const GLASS_CARD =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";
const KPI_CARD_STYLES = [
  "bg-gradient-to-br from-cyan-500/90 via-sky-500/90 to-blue-600/90",
  "bg-gradient-to-br from-indigo-500/90 via-purple-500/90 to-fuchsia-500/90",
  "bg-gradient-to-br from-emerald-500/90 via-teal-500/90 to-cyan-500/90",
  "bg-gradient-to-br from-amber-500/90 via-orange-500/90 to-rose-500/90",
];

// ===== Helpers =====
const formatKpiValue = (k) =>
  k.label.includes("Doanh thu")
    ? `${k.value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}m₫`
    : k.value.toLocaleString("vi-VN");

function formatVND(value) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  } catch (e) {
    return `${value}`;
  }
}

function compactNumber(value) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value || 0);
  } catch (e) {
    return `${value}`;
  }
}

function percent(value, total) {
  if (!total) return 0;
  return (value / total) * 100;
}

// Deterministic pseudo-random generator (demo-only)
function seededRevenue(seed) {
  const x = Math.sin(seed) * 10000;
  const base = Math.floor((x - Math.floor(x)) * 9_000_000) + 1_000_000; // 1m - 10m
  return base + (seed % 5) * 350_000; // slight trend
}

// ===== Tooltip style =====
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

export default function DashboardPage() {
  // ====== KPI ======
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
      } catch {
        // keep 0
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listingService.getByStatus(1, 1000, "Pending");
        if (cancelled) return;
        if (res?.success && res?.data) {
          const d = res.data;
          const total =
            (typeof d.totalRecords === "number" && d.totalRecords) ||
            (typeof d.total === "number" && d.total) ||
            (typeof d.totalCount === "number" && d.totalCount) ||
            (typeof d.count === "number" && d.count) ||
            (Array.isArray(d.data) ? d.data.length : 0);
          setPendingCount(Number(total) || 0);
        }
      } catch {
        // keep 0
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpiList = useMemo(
    () => [
      { label: "Tổng User", value: userCount },
      { label: "Bài chờ duyệt", value: pendingCount, sub: "" },
      { label: "User bị báo xấu", value: 37, sub: "+5 hôm nay" },
      { label: "Doanh thu hôm nay", value: 92.4, sub: "+18% vs hôm qua" },
    ],
    [userCount, pendingCount]
  );

  // ====== Demo data for charts ======
  const [view, setView] = useState("day"); // "day" | "quarter"
  const [brandMode, setBrandMode] = useState("car"); // "car" | "motorbike" | "battery"

  const dailyData = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      const key = Number(`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`);
      arr.push({ date: label, revenue: seededRevenue(key) });
    }
    return arr;
  }, []);

  const quarterlyData = useMemo(() => {
    const year = new Date().getFullYear();
    return [
      { quarter: `Q1 ${year}`, revenue: 78_500_000 },
      { quarter: `Q2 ${year}`, revenue: 91_200_000 },
      { quarter: `Q3 ${year}`, revenue: 86_400_000 },
      { quarter: `Q4 ${year}`, revenue: 102_300_000 },
    ];
  }, []);

  const totalRevenueSum = useMemo(() => {
    const list = view === "day" ? dailyData : quarterlyData;
    return list.reduce((sum, i) => sum + (i.revenue || 0), 0);
  }, [view, dailyData, quarterlyData]);

  // ====== Demo posts for aggregation ======
  const demoPosts = useMemo(
    () => [
      // Cars
      { id: 1, category: "car", brand: "VinFast", condition: "new", expiresAt: "2026-01-10" },
      { id: 2, category: "car", brand: "Tesla", condition: "used", expiresAt: "2025-12-31" },
      { id: 3, category: "car", brand: "Hyundai", condition: "new", expiresAt: "2025-08-01" },
      { id: 4, category: "car", brand: "Kia", condition: "used", expiresAt: "2025-11-20" },
      { id: 5, category: "car", brand: "BYD", condition: "new", expiresAt: "2025-12-15" },
      { id: 6, category: "car", brand: "Nissan", condition: "used", expiresAt: "2024-10-01" },
      { id: 7, category: "car", brand: "VinFast", condition: "used", expiresAt: "2026-03-01" },
      // Motorbikes
      { id: 11, category: "motorbike", brand: "Honda", condition: "new", expiresAt: "2026-02-01" },
      { id: 12, category: "motorbike", brand: "Yamaha", condition: "used", expiresAt: "2025-10-10" },
      { id: 13, category: "motorbike", brand: "VinFast", condition: "new", expiresAt: "2025-12-31" },
      { id: 14, category: "motorbike", brand: "Piaggio", condition: "used", expiresAt: "2026-01-20" },
      { id: 15, category: "motorbike", brand: "SYM", condition: "new", expiresAt: "2025-11-25" },
      { id: 16, category: "motorbike", brand: "Suzuki", condition: "used", expiresAt: "2025-07-01" },
      // Batteries
      { id: 21, category: "battery", brand: "CATL", condition: "new", expiresAt: "2026-05-01" },
      { id: 22, category: "battery", brand: "Panasonic", condition: "used", expiresAt: "2025-09-01" },
      { id: 23, category: "battery", brand: "LG Energy", condition: "new", expiresAt: "2025-12-30" },
      { id: 24, category: "battery", brand: "Samsung SDI", condition: "used", expiresAt: "2026-03-15" },
      { id: 25, category: "battery", brand: "BYD", condition: "new", expiresAt: "2025-12-01" },
      { id: 26, category: "battery", brand: "VinES", condition: "used", expiresAt: "2025-10-20" },
    ],
    []
  );

  const now = new Date();
  const isActivePost = (p) => {
    if (!p?.expiresAt) return true;
    return new Date(p.expiresAt) >= now;
  };

  // ===== Pie data (keep original slice order), legend sorted =====
  const rawBrandData = useMemo(() => {
    const list = demoPosts.filter((p) => p.category === brandMode);
    const map = new Map();
    for (const p of list) map.set(p.brand, (map.get(p.brand) || 0) + 1);
    const arr = Array.from(map.entries()).map(([brand, count]) => ({ brand, count }));
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [demoPosts, brandMode]);

  function top3WithOthers(data) {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const top3 = sorted.slice(0, 3);
    const othersCount = sorted.slice(3).reduce((s, i) => s + (i.count || 0), 0);
    return othersCount > 0 ? [...top3, { brand: "Others", count: othersCount }] : top3;
  }

  // Keep slice order as returned by top3WithOthers
  const pieData = useMemo(() => top3WithOthers(rawBrandData), [rawBrandData]);
  const pieTotal = useMemo(() => pieData.reduce((s, i) => s + i.count, 0), [pieData]);

  // Assign colors to brands following the slice order
  const brandColorMap = useMemo(() => {
    const m = new Map();
    let colorIdx = 0;
    for (const item of pieData) {
      const color = item.brand === "Others"
        ? OTHERS_COLOR
        : (CORE_COLORS[colorIdx] || CORE_COLORS[CORE_COLORS.length - 1]);
      if (item.brand !== "Others") colorIdx += 1;
      m.set(item.brand, color);
    }
    return m;
  }, [pieData]);

  // Remove zero values and add small gap to avoid flat join
  const pieCleanData = useMemo(() => pieData.filter((d) => (d.count || 0) > 0), [pieData]);

  // Legend sorted by percentage (desc) but uses brandColorMap colors
  const legendPayload = useMemo(() => {
    const sorted = [...pieCleanData].sort((a, b) => b.count - a.count);
    return sorted.map((item) => ({
      value: item.brand,
      id: item.brand,
      type: "circle",
      color: brandColorMap.get(item.brand),
    }));
  }, [pieCleanData, brandColorMap]);

  // ===== Bar data: active posts only =====
  const postsTypeConditionData = useMemo(() => {
    const cats = [
      { key: "car", label: "Xe hơi" },
      { key: "motorbike", label: "Xe máy" },
      { key: "battery", label: "Pin điện" },
    ];
    return cats.map(({ key, label }) => {
      const list = demoPosts.filter((p) => p.category === key && isActivePost(p));
      const newCount = list.filter((p) => p.condition === "new").length;
      const usedCount = list.filter((p) => p.condition === "used").length;
      return { type: label, new: newCount, used: usedCount };
    });
  }, [demoPosts]);

  return (
    <div className="mx-auto max-w-7xl grid gap-6 text-slate-100">
      {/* KPI */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiList.map((k, i) => (
          <div
            key={i}
            className={`${KPI_CARD_STYLES[i % KPI_CARD_STYLES.length]} text-white rounded-xl ring-1 ring-white/10 p-5 backdrop-blur-lg`}
          >
            <div className="text-sm opacity-90">{k.label}</div>
            <div className="text-3xl font-extrabold mt-2">{formatKpiValue(k)}</div>
            {k.sub ? <div className="text-xs opacity-90 mt-2">{k.sub}</div> : null}
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8">
        {/* Chart 1: Revenue */}
        <Card className={`col-span-1 lg:col-span-2 ${GLASS_CARD}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Doanh Thu
              </CardTitle>
              <div className="inline-flex rounded-xl border border-slate-700 bg-slate-800/60 p-1 text-sm shadow-sm">
                <button
                  type="button"
                  onClick={() => setView("day")}
                  aria-pressed={view === "day"}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition ${
                    view === "day" ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-slate-700/50"
                  }`}
                >
                  <CalendarRange className="h-4 w-4" />
                  Theo ngày
                </button>
                <button
                  type="button"
                  onClick={() => setView("quarter")}
                  aria-pressed={view === "quarter"}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition ${
                    view === "quarter" ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-slate-700/50"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Theo quý
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Tổng: <span className="font-semibold text-blue-300">{formatVND(totalRevenueSum)}</span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {view === "day" ? (
                  <BarChart data={dailyData} barCategoryGap={16}>
                    <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                    <XAxis dataKey="date" tickMargin={8} stroke="#7dd3fc" tick={{ fill: "#7dd3fc" }} />
                    <YAxis tickFormatter={compactNumber} width={60} stroke="#7dd3fc" tick={{ fill: "#7dd3fc" }} />
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
                        <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="revenue" name="Doanh thu" radius={[8, 8, 0, 0]} fill="url(#blueBar)" />
                  </BarChart>
                ) : (
                  <BarChart data={quarterlyData} barCategoryGap={24}>
                    <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                    <XAxis dataKey="quarter" tickMargin={8} stroke="#7dd3fc" tick={{ fill: "#7dd3fc" }} />
                    <YAxis tickFormatter={compactNumber} width={60} stroke="#7dd3fc" tick={{ fill: "#7dd3fc" }} />
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
                        <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="revenue" name="Doanh thu" radius={[8, 8, 0, 0]} fill="url(#blueBar)" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Posts by Brand (Pie) */}
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
                className={`rounded-lg px-3 py-1.5 ${brandMode === "car" ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-slate-700/50"}`}
              >
                Xe hơi
              </button>
              <button
                type="button"
                onClick={() => setBrandMode("motorbike")}
                aria-pressed={brandMode === "motorbike"}
                className={`rounded-lg px-3 py-1.5 ${brandMode === "motorbike" ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-slate-700/50"}`}
              >
                Xe máy
              </button>
              <button
                type="button"
                onClick={() => setBrandMode("battery")}
                aria-pressed={brandMode === "battery"}
                className={`rounded-lg px-3 py-1.5 ${brandMode === "battery" ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-slate-700/50"}`}
              >
                Pin
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 16, bottom: 36, left: 16 }}>
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
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Posts by Type & Condition (Bar) */}
        <Card className={`col-span-1 lg:col-span-3 ${GLASS_CARD}`}>
          <CardHeader>
            <CardTitle className="flex items:center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bài đăng theo loại và tình trạng
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={postsTypeConditionData} barCategoryGap={24}>
                  <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                  <XAxis dataKey="type" tickMargin={8} stroke="#ffffff" tick={{ fill: "#ffffff" }} />
                  <YAxis allowDecimals={false} stroke="#a7f3d0" tick={{ fill: "#a7f3d0" }} />
                  <ChartTooltip
                    formatter={(value, key) => [`${value} bài đăng`, key === "new" ? "Hàng mới" : key === "used" ? "Hàng cũ" : key]}
                    contentStyle={darkTip}
                    itemStyle={darkItem}
                    labelStyle={darkLabel}
                  />
                  <Legend />
                  <Bar dataKey="used" name="Hàng cũ" fill={BAR_USED_COLOR} radius={[6, 6, 0, 0]} />$1<Bar dataKey="new" name="Hàng mới" fill={BAR_NEW_COLOR} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
