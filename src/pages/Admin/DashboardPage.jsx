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
import { Button } from "../../components/Button/button";
import { Badge } from "../../components/Badge/badge";
import listingService from "../../services/apis/listingApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const GLASS_CARD =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";
const KPI_CARD_STYLES = [
  "bg-gradient-to-br from-cyan-500/90 via-sky-500/90 to-blue-600/90",
  "bg-gradient-to-br from-indigo-500/90 via-purple-500/90 to-fuchsia-500/90",
  "bg-gradient-to-br from-emerald-500/90 via-teal-500/90 to-cyan-500/90",
  "bg-gradient-to-br from-amber-500/90 via-orange-500/90 to-rose-500/90",
];
const COLORS = ["#0ea5e9", "#10b981", "#f59e0b"]; // pie colors

const revenueData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  revenue: Math.round(50 + Math.random() * 120),
}));
const categoryData = [
  { name: "Xe điện", posts: 320 },
  { name: "Pin", posts: 210 },
];
const planMix = [
  { name: "Free", value: 56 },
  { name: "Pro", value: 34 },
  { name: "VIP", value: 10 },
];
const openTickets = [
  {
    id: "tkt_101",
    subject: "Không thanh toán được gói Pro",
    user: "Hoàng V.",
    tag: "billing",
    sla: "1h còn lại",
    status: "open",
  },
  {
    id: "tkt_102",
    subject: "Bài bị từ chối nhưng thiếu lý do",
    user: "Thu T.",
    tag: "moderation",
    sla: "3h còn lại",
    status: "open",
  },
];

const formatKpiValue = (k) =>
  k.label.includes("Doanh thu")
    ? `${k.value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}m₫`
    : k.value.toLocaleString("vi-VN");

export default function DashboardPage({ onSelectListing, onSelectTicket }) {
  const totalRevenue = useMemo(
    () => revenueData.reduce((a, b) => a + b.revenue, 0),
    []
  );
  // Fetch total pending listings for KPI
  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listingService.getByStatus({
          pageIndex: 1,
          pageSize: 1,
          from: 0,
          to: 1000000000,
          status: "Pending",
        });
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
      } catch (_) {
        // silent fail; keep 0
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpiList = useMemo(
    () => [
      { label: "Tổng User", value: 12480, sub: "+3.1% vs 7d" },
      { label: "Bài chờ duyệt", value: pendingCount, sub: "" },
      { label: "User bị báo xấu", value: 37, sub: "+5 hôm nay" },
      { label: "Doanh thu hôm nay", value: 92.4, sub: "+18% vs hôm qua" },
    ],
    [pendingCount]
  );

  const onTicketKey = (e, id) => {
    if (e.key === "Enter") onSelectTicket?.(id);
  };

  return (
    <div className="mx-auto max-w-7xl grid gap-6 text-slate-100">
      {/* KPI */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
            {k.sub ? (
              <div className="text-xs opacity-90 mt-2">{k.sub}</div>
            ) : null}
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8">
        <Card className={`col-span-2 ${GLASS_CARD}`}>
          <CardHeader>
            <CardTitle>Doanh thu 30 ngày gần nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    stroke="#0ea5e9"
                    tick={{ fill: "#0ea5e9" }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}m`}
                    width={40}
                    stroke="#0ea5e9"
                    tick={{ fill: "#0ea5e9" }}
                  />
                  <ChartTooltip
                    formatter={(v) => `${v} triệu ₫`}
                    labelFormatter={(l) => `Ngày ${l}`}
                    contentStyle={{ color: "#0ea5e9" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 rounded-lg bg-slate-800/60 p-2 text-center text-sm font-medium text-cyan-200">
              Tổng: {Math.round(totalRevenue)} triệu ₫
            </div>
          </CardContent>
        </Card>

        <Card className={GLASS_CARD}>
          <CardHeader>
            <CardTitle>Bài đăng theo danh mục</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  stroke="#10b981"
                  tick={{ fill: "#10b981" }}
                />
                <YAxis width={32} stroke="#10b981" tick={{ fill: "#10b981" }} />
                <ChartTooltip contentStyle={{ color: "#10b981" }} />
                <Bar dataKey="posts" radius={[6, 6, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={GLASS_CARD}>
          <CardHeader>
            <CardTitle>Tỷ lệ gói</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={planMix}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {planMix.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: "#10b981" }} />
                <ChartTooltip contentStyle={{ color: "#10b981" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Support */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-x-6 gap-y-8">
        <Card className={`xl:col-span-3 ${GLASS_CARD}`}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Hỗ trợ (Open)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 cursor-pointer">
              {openTickets.map((t) => (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  title="Mở ticket để xử lý"
                  onClick={() => onSelectTicket?.(t.id)}
                  onKeyDown={(e) => onTicketKey(e, t.id)}
                  className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/35 hover:bg-slate-800/60 transition focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{t.subject}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        #{t.id} · {t.user}
                      </p>
                    </div>
                    <Badge className="uppercase">{t.tag}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-3">
                    <span className="text-slate-400">SLA: {t.sla || "-"}</span>
                    <Button
                      className="cursor-pointer bg-black text-white hover:bg-neutral-800 px-4 py-1.5 text-sm rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTicket?.(t.id);
                      }}
                    >
                      Xử lý
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
