export const kpis = [
  { label: "Tổng User", value: 12480, sub: "+3.1% vs 7d" },
  { label: "Bài chờ duyệt", value: 128, sub: "24 quá hạn" },
  { label: "User bị báo xấu", value: 37, sub: "+5 hôm nay" },
  { label: "Doanh thu hôm nay", value: 92.4, sub: "+18% vs hôm qua" },
];

export const KPI_COLORS = ["bg-blue-600", "bg-amber-500", "bg-green-600", "bg-rose-600"];
export const COLORS = ["#0ea5e9", "#10b981", "#f59e0b"];

export const revenueData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  revenue: Math.round(50 + Math.random() * 120),
}));

export const categoryData = [
  { name: "Xe điện", posts: 320 },
  { name: "Pin", posts: 210 },
];

export const planMix = [
  { name: "Free", value: 56 },
  { name: "Pro", value: 34 },
  { name: "VIP", value: 10 },
];
