import { useMemo, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card/card";
import { Button } from "../../components/Button/button";
import { Badge } from "../../components/Badge/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/Table/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/Tabs/tabs";
import {
  LayoutDashboard,
  ClipboardCheck,
  Headphones,
  LogOut,
  FileText,
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
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
import logo3 from "./../../assets/logo3.png";
import { AuthContext } from "../../contexts/AuthContext";

/* ------------------------------------------------------------------ */
/* Mock data & helpers                                                */
/* ------------------------------------------------------------------ */

const kpis = [
  { label: "Tổng User", value: 12480, sub: "+3.1% vs 7d" },
  { label: "Bài chờ duyệt", value: 128, sub: "24 quá hạn" },
  { label: "User bị báo xấu", value: 37, sub: "+5 hôm nay" },
  { label: "Doanh thu hôm nay", value: 92.4, sub: "+18% vs hôm qua" }, // triệu ₫
];

const KPI_CARD_STYLES = [
  "bg-gradient-to-br from-cyan-500/90 via-sky-500/90 to-blue-600/90",
  "bg-gradient-to-br from-indigo-500/90 via-purple-500/90 to-fuchsia-500/90",
  "bg-gradient-to-br from-emerald-500/90 via-teal-500/90 to-cyan-500/90",
  "bg-gradient-to-br from-amber-500/90 via-orange-500/90 to-rose-500/90",
];

const GLASS_CARD =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b"];

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

const pendingPosts = [
  {
    id: "lst_001",
    title: "Xe điện VinFast Vento S 2022",
    seller: "Nguyễn A",
    price: 18500000,
    createdAt: "2025-09-24 09:12",
    category: "Xe điện",
  },
  {
    id: "lst_002",
    title: "Pin Lithium 60V - 48Ah (cũ 80%)",
    seller: "Trần B",
    price: 4200000,
    createdAt: "2025-09-24 08:41",
    category: "Pin",
  },
  {
    id: "lst_003",
    title: "Xe đạp điện Pega Aura 2021",
    seller: "Lâm C",
    price: 6900000,
    createdAt: "2025-09-25 10:05",
    category: "Xe điện",
  },
];

const initialListingStatuses = {
  lst_001: "pending",
  lst_002: "rejected",
  lst_003: "approved",
};

const LISTING_DETAILS = [
  {
    id: "lst_001",
    title: "Xe điện VinFast Vento S 2022",
    category: "Xe điện",
    seller: { name: "Nguyễn A" },
    price: 18500000,
    images: ["/demo/vento-1.jpg", "/demo/vento-2.jpg"],
    evidence: [{ name: "hoa_don_vento.pdf" }, { name: "phieu_bao_hanh.jpg" }],
  },
  {
    id: "lst_002",
    title: "Pin Lithium 60V - 48Ah (cũ 80%)",
    category: "Pin",
    seller: { name: "Trần B" },
    price: 4200000,
    images: ["/demo/pin-1.jpg", "/demo/pin-2.jpg"],
    evidence: [{ name: "hoa_don_pin.pdf" }],
  },
  {
    id: "lst_003",
    title: "Xe đạp điện Pega Aura 2021",
    category: "Xe điện",
    seller: { name: "Lâm C" },
    price: 6900000,
    images: ["/demo/pega-1.jpg", "/demo/pega-2.jpg"],
    evidence: [{ name: "hoa_don_pega.pdf" }],
  },
];

const allTickets = [
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
  {
    id: "tkt_090",
    subject: "Không nhận được email kích hoạt",
    user: "Minh K.",
    tag: "account",
    status: "closed",
  },
  {
    id: "tkt_045",
    subject: "Lỗi upload hình ảnh",
    user: "Lan P.",
    tag: "bug",
    status: "closed",
  },
];

const openTickets = allTickets.filter((t) => t.status === "open");

const currency = (v) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);
const formatKpiValue = (k) =>
  k.label.includes("Doanh thu")
    ? `${k.value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}m₫`
    : k.value.toLocaleString("vi-VN");

/* ------------------------------------------------------------------ */
/* App shell                                                           */
/* ------------------------------------------------------------------ */

export default function Admin() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [page, setPage] = useState("dashboard"); // "dashboard" | "review" | "support" | "plans"
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [listingStatus, setListingStatus] = useState(initialListingStatuses);

  // Plans state
  const [plans, setPlans] = useState([
    { id: "pln_001", name: "Free", days: 7, price: 0 },
    { id: "pln_002", name: "Pro", days: 30, price: 99000 },
  ]);
  const [openPlanForm, setOpenPlanForm] = useState(false);

  const goToReviewWith = (id) => {
    setSelectedListingId(id);
    setPage("review");
  };
  const goToSupportWith = (id) => {
    setSelectedTicketId(id);
    setPage("support");
  };
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-800/60 bg-slate-900/40 backdrop-blur-2xl">
        <div className="flex h-full flex-col px-6 py-8">
          <div className="mb-8 flex items-center gap-3">
            <img src={logo3} alt="VoltX Exchange" className="h-10 w-auto" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/80">
                VoltX Control
              </p>
              <h1 className="text-lg font-semibold text-white leading-tight">
                Admin Panel
              </h1>
            </div>
          </div>

          {/* ▶️ Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
            <SideItem
              active={page === "dashboard"}
              onClick={() => setPage("dashboard")}
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              title="System overview"
            />
            <SideItem
              active={page === "review"}
              onClick={() => setPage("review")}
              icon={<ClipboardCheck className="h-4 w-4" />}
              label="Review"
              title="Moderate listings"
            />
            <SideItem
              active={page === "support"}
              onClick={() => setPage("support")}
              icon={<Headphones className="h-4 w-4" />}
              label="Support"
              title="Customer tickets"
            />
            <SideItem
              active={page === "plans"}
              onClick={() => {
                setPage("plans");
                setOpenPlanForm(false);
              }}
              icon={<FileText className="h-4 w-4" />}
              label="Plans"
              title="Manage listing plans"
            />
          </nav>

          {/* ▶️ Logout */}
          <div className="mt-8 border-t border-slate-800/60 pt-6">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500/80 to-red-500/80 text-white hover:from-rose-500 hover:to-red-400 cursor-pointer"
              title="Sign out of admin"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      <main className="ml-72 min-h-screen overflow-y-auto px-10 pb-12 pt-24">
        {page === "dashboard" && (
          <DashboardPage
            onSelectListing={goToReviewWith}
            onSelectTicket={goToSupportWith}
            listingStatus={listingStatus}
          />
        )}
        {page === "review" && (
          <ReviewPage
            selectedId={selectedListingId}
            onBackToDashboard={() => setSelectedListingId(null)}
            status={
              (selectedListingId && listingStatus[selectedListingId]) ||
              "pending"
            }
            onApprove={() =>
              selectedListingId &&
              setListingStatus({
                ...listingStatus,
                [selectedListingId]: "approved",
              })
            }
            onReject={() =>
              selectedListingId &&
              setListingStatus({
                ...listingStatus,
                [selectedListingId]: "rejected",
              })
            }
            onSelectListing={(id) => setSelectedListingId(id)}
            listingStatus={listingStatus}
          />
        )}
        {page === "support" && (
          <SupportPage
            selectedId={selectedTicketId}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            onBack={() => setSelectedTicketId(null)}
          />
        )}
        {page === "plans" && (
          <PlansPage
            plans={plans}
            setPlans={setPlans}
            openForm={openPlanForm}
            setOpenForm={setOpenPlanForm}
          />
        )}
      </main>
    </div>
  );

  function SideItem({ icon, label, active, onClick, title }) {
    return (
      <button
        onClick={onClick}
        title={title}
        aria-label={title}
        className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
          active
            ? "bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white ring-1 ring-slate-700/40"
            : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
        }`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            active
              ? "bg-slate-800/60 text-white"
              : "bg-slate-900/40 text-cyan-200/70 group-hover:bg-slate-800/60 group-hover:text-white"
          }`}
        >
          {icon}
        </span>
        <span>{label}</span>
      </button>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Pages                                                               */
  /* ------------------------------------------------------------------ */

  function DashboardPage({ onSelectListing, onSelectTicket, listingStatus }) {
    const totalRevenue = useMemo(
      () => revenueData.reduce((a, b) => a + b.revenue, 0),
      []
    );

    return (
      <div className="mx-auto max-w-7xl grid gap-6 text-slate-100">
        {/* KPI */}
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
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
              <div className="text-xs opacity-90 mt-2">{k.sub}</div>
            </div>
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8">
          <Card className={`col-span-2 ${GLASS_CARD}`}>
            <CardHeader>
              <CardTitle>Doanh thu 30 ngày gần nhất</CardTitle>
            </CardHeader>
            {/* Không khóa chiều cao CardContent, chỉ khóa vùng chart */}
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
                  <YAxis
                    width={32}
                    stroke="#10b981"
                    tick={{ fill: "#10b981" }}
                  />
                  <ChartTooltip contentStyle={{ color: "#10b981" }} />
                  <Bar dataKey="posts" radius={[6, 6, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={GLASS_CARD}>
            <CardHeader>
              <CardTitle>Tỉ lệ gói</CardTitle>
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

        {/* Pending Listings (full width) & Support below */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-x-6 gap-y-8">
          {/* Hàng chờ duyệt bài */}
          <Card className={`xl:col-span-3 ${GLASS_CARD}`}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Hàng chờ duyệt bài</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Table className="text-slate-200 text-sm">
                <TableHeader className="bg-slate-900/40 border-b border-slate-800/60 [&_th]:text-slate-300">
                  <TableRow>
                    <TableHead className="w-[120px]">Mã</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Danh mục
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Người bán
                    </TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Tạo lúc
                    </TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>

                {/* giãn dòng body */}
                <TableBody className="[&_tr:last-child]:border-0 [&>tr>td]:py-3">
                  {pendingPosts
                    .filter(
                      (p) => (listingStatus[p.id] || "pending") === "pending"
                    )
                    .map((p) => {
                      const st = listingStatus[p.id] || "pending";
                      const badge =
                        st === "pending" ? (
                          <Badge className="inline-flex items-center whitespace-nowrap px-2.5 py-1 bg-amber-500/80 text-white hover:bg-amber-500">
                            Đang chờ
                          </Badge>
                        ) : st === "approved" ? (
                          <Badge className="inline-flex items-center whitespace-nowrap px-2.5 py-1 bg-emerald-500/80 text-white hover:bg-emerald-500">
                            Đã duyệt
                          </Badge>
                        ) : (
                          <Badge className="inline-flex items-center whitespace-nowrap px-2.5 py-1 bg-rose-500/80 text-white hover:bg-rose-500">
                            Đã từ chối
                          </Badge>
                        );

                      return (
                        <TableRow
                          key={p.id}
                          className="cursor-pointer border-b border-slate-800/60 bg-slate-900/35 transition-colors hover:bg-slate-800/60"
                          onClick={() => onSelectListing(p.id)}
                          title="Xem & duyệt bài"
                        >
                          <TableCell className="font-mono text-xs">
                            {p.id}
                          </TableCell>
                          <TableCell className="font-medium underline text-primary">
                            {p.title}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {p.category}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {p.seller}
                          </TableCell>
                          <TableCell className="text-right">
                            {currency(p.price)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-slate-400">
                            {p.createdAt}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {badge}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Hỗ trợ (Open) */}
          <Card className={`xl:col-span-3 ${GLASS_CARD}`}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Hỗ trợ (Open)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/35 hover:bg-slate-800/60 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{t.subject}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          #{t.id} • {t.user}
                        </p>
                      </div>
                      <Badge variant="secondary" className="uppercase">
                        {t.tag}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-3">
                      <span className="text-slate-400">
                        SLA: {t.sla || "—"}
                      </span>
                      <Button
                        className="cursor-pointer bg-black text-white hover:bg-neutral-800 px-4 py-1.5 text-sm rounded-lg"
                        onClick={() => onSelectTicket(t.id)}
                        title="Mở ticket để xử lý"
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

  function ReviewPage({
    selectedId,
    onBackToDashboard,
    status,
    onApprove,
    onReject,
    onSelectListing,
    listingStatus,
  }) {
    const detail = useMemo(() => {
      return (
        LISTING_DETAILS.find((x) => x.id === selectedId) ?? {
          id: "",
          title: "",
          category: "",
          seller: { name: "" },
          price: 0,
          images: [],
          evidence: [],
        }
      );
    }, [selectedId]);

    const st = status || "pending";
    const disabled = st !== "pending";

    if (!selectedId)
      return (
        <div className="max-w-6xl mx-auto">
          <Card className={GLASS_CARD}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Danh sách bài đăng</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="text-slate-200">
                <TableHeader className="bg-slate-900/40 border-b border-slate-800/60 [&_th]:text-slate-300">
                  <TableRow>
                    <TableHead className="w-[120px]">Mã</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Danh mục
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Người bán
                    </TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Tạo lúc
                    </TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr:last-child]:border-0 [&>tr>td]:py-3">
                  {pendingPosts.map((p) => {
                    const realStatus = listingStatus[p.id] || "pending";
                    const badge =
                      realStatus === "pending" ? (
                        <Badge className="inline-flex items-center whitespace-nowrap px-2.5 py-1 bg-amber-500/80 text-white hover:bg-amber-500">
                          Đang chờ
                        </Badge>
                      ) : realStatus === "approved" ? (
                        <Badge className="inline-flex items-center whitespace-nowrap px-2.5 py-1 bg-emerald-500/80 text-white hover:bg-emerald-500">
                          Đã duyệt
                        </Badge>
                      ) : (
                        <Badge className="inline-flex items-center whitespace-nowrap px-2.5 py-1 bg-rose-500/80 text-white hover:bg-rose-500">
                          Đã từ chối
                        </Badge>
                      );
                    return (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer border-b border-slate-800/60 bg-slate-900/35 transition-colors hover:bg-slate-800/60"
                        onClick={() => onSelectListing(p.id)}
                        title="Mở chi tiết bài đăng"
                      >
                        <TableCell className="font-mono text-xs">
                          {p.id}
                        </TableCell>
                        <TableCell className="font-medium underline text-primary">
                          {p.title}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {p.category}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {p.seller}
                        </TableCell>
                        <TableCell className="text-right">
                          {currency(p.price)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-slate-400">
                          {p.createdAt}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {badge}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      );

    return (
      <div className="mx-auto max-w-6xl space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onBackToDashboard}
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
                st === "approved"
                  ? "bg-emerald-500/80 text-white"
                  : st === "rejected"
                  ? "bg-rose-500/80 text-white"
                  : "bg-amber-500/80 text-white"
              }
            >
              {st === "approved"
                ? "Đã duyệt"
                : st === "rejected"
                ? "Đã từ chối"
                : "Đang chờ"}
            </Badge>

            {!disabled && (
              <>
                <Button
                  className="cursor-pointer rounded-lg bg-emerald-500/90 text-white hover:bg-emerald-500"
                  onClick={onApprove}
                  title="Phê duyệt bài đăng"
                >
                  Duyệt
                </Button>
                <Button
                  onClick={onReject}
                  title="Từ chối bài đăng"
                  className="cursor-pointer rounded-lg bg-rose-500/90 text-white hover:bg-rose-500"
                >
                  Từ chối
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="my-6 border-t border-slate-800/60" />

        <Tabs defaultValue="info">
          <TabsList className="flex items-center justify-start gap-3 border-b border-slate-800/60 bg-slate-900/40 pb-2 text-slate-300">
            <TabsTrigger
              value="info"
              className="cursor-pointer px-4 py-2 text-slate-300 rounded-lg transition-colors data-[state=active]:bg-slate-800/60 data-[state=active]:text-white hover:text-white"
            >
              Bài đăng
            </TabsTrigger>
            <span aria-hidden className="mx-2 h-6 w-px bg-slate-700/50" />
            <TabsTrigger
              value="images"
              className="cursor-pointer px-4 py-2 text-slate-300 rounded-lg transition-colors data-[state=active]:bg-slate-800/60 data-[state=active]:text-white hover:text-white"
            >
              Hình ảnh hàng hóa
            </TabsTrigger>
            <span aria-hidden className="mx-2 h-6 w-px bg-slate-700/50" />
            <TabsTrigger
              value="docs"
              className="cursor-pointer px-4 py-2 text-slate-300 rounded-lg transition-colors data-[state=active]:bg-slate-800/60 data-[state=active]:text-white hover:text-white"
            >
              Giấy tờ / Chứng từ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="p-4 space-y-1">
            <p>
              <strong>Mã:</strong> {detail.id}
            </p>
            <p>
              <strong>Tiêu đề:</strong> {detail.title}
            </p>
            <p>
              <strong>Người bán:</strong> {detail.seller.name}
            </p>
            <p>
              <strong>Giá:</strong> {currency(detail.price)}
            </p>
            <p>
              <strong>Danh mục:</strong> {detail.category}
            </p>
          </TabsContent>

          <TabsContent
            value="images"
            className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2"
          >
            {detail.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Ảnh hàng hóa"
                className="rounded-lg border border-slate-800/60"
              />
            ))}
          </TabsContent>

          <TabsContent value="docs" className="p-4 space-y-2">
            {detail.evidence.map((f, i) => (
              <div key={i} className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" /> {f.name}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  /* ---------------------------- Support Page ---------------------------- */

  function SupportPage({ selectedId, onSelectTicket, onBack }) {
    const [tickets, setTickets] = useState(allTickets);
    const [messagesByTicket, setMessagesByTicket] = useState({});
    const [input, setInput] = useState("");

    const ticket = useMemo(
      () => tickets.find((t) => t.id === selectedId),
      [tickets, selectedId]
    );
    const isClosed = ticket?.status === "closed";

    useEffect(() => {
      if (selectedId && !ticket) onBack();
    }, [selectedId, ticket, onBack]);

    const appendMessage = (text) => {
      if (isClosed || !ticket) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      const seedMsgs = [
        {
          author: "User",
          text: `Xin chào, tôi gặp sự cố khi ${ticket.subject.toLowerCase()}.`,
          ts: Date.now() - 60_000,
        },
        {
          author: "Admin",
          text: "Chào bạn, vui lòng mô tả chi tiết để mình kiểm tra nhé.",
          ts: Date.now() - 30_000,
        },
      ];
      setMessagesByTicket((prev) => {
        const prevMsgs = prev[ticket.id] ?? seedMsgs;
        return {
          ...prev,
          [ticket.id]: [
            ...prevMsgs,
            { author: "Admin", text: trimmed, ts: Date.now() },
          ],
        };
      });
      setInput("");
      setTimeout(() => {
        const el = document.getElementById("chat-scroll");
        if (el) el.scrollTop = el.scrollHeight;
      }, 0);
    };

    const onKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        appendMessage(input);
      }
    };

    const markDone = () => {
      if (!ticket) return;
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: "closed" } : t))
      );
      onBack();
    };

    if (!selectedId) {
      return (
        <div className="mx-auto max-w-6xl space-y-4 text-slate-100">
          <Card className={GLASS_CARD}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Danh sách ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="text-slate-200">
                <TableHeader className="bg-slate-900/40 border-b border-slate-800/60 [&_th]:text-slate-300">
                  <TableRow>
                    <TableHead className="w-[120px]">Mã</TableHead>
                    <TableHead>Chủ đề</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Người dùng
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Tag</TableHead>
                    <TableHead className="hidden md:table-cell">SLA</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr:last-child]:border-0">
                  {tickets.map((t) => (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer border-b border-slate-800/60 bg-slate-900/35 transition-colors hover:bg-slate-800/60"
                      onClick={() => onSelectTicket(t.id)}
                      title="Mở ticket để chat"
                    >
                      <TableCell className="font-mono text-xs">
                        {t.id}
                      </TableCell>
                      <TableCell className="font-medium underline text-primary">
                        {t.subject}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {t.user}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell uppercase">
                        {t.tag}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-slate-400">
                        {t.status === "open" ? t.sla || "—" : "—"}
                      </TableCell>
                      <TableCell>
                        {t.status === "open" ? (
                          <Badge className="border border-amber-500/30 bg-amber-400/20 text-amber-200">
                            Đang mở
                          </Badge>
                        ) : (
                          <Badge className="border border-emerald-500/30 bg-emerald-400/20 text-emerald-200">
                            Đã xử lý
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!ticket) return null;
    const seedMsgs = [
      {
        author: "User",
        text: `Xin chào, tôi gặp sự cố khi ${ticket.subject.toLowerCase()}.`,
        ts: Date.now() - 60_000,
      },
      {
        author: "Admin",
        text: "Chào bạn, vui lòng mô tả chi tiết để mình kiểm tra nhé.",
        ts: Date.now() - 30_000,
      },
    ];
    const msgs = messagesByTicket[ticket.id] ?? seedMsgs;

    return (
      <div className="mx-auto max-w-6xl space-y-4 text-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onBack}
              className="cursor-pointer rounded-full border border-slate-700/50 bg-slate-900/40 p-2 text-slate-100 hover:bg-slate-800/60"
              aria-label="Quay lại danh sách ticket"
              title="Quay lại danh sách ticket"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-white">
              Chat hỗ trợ khách hàng
            </h2>
          </div>

          {!isClosed && (
            <Button
              onClick={markDone}
              className="cursor-pointer rounded-xl bg-emerald-500/90 px-6 py-2.5 text-base text-white hover:bg-emerald-500"
              title="Đánh dấu ticket đã xử lý"
            >
              Kết Thúc
            </Button>
          )}
        </div>

        <Card className={GLASS_CARD}>
          <CardHeader>
            <CardTitle>{ticket.subject}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-300">
              Khách hàng:{" "}
              <span className="font-medium text-slate-100">{ticket.user}</span>{" "}
              •{" "}
              {ticket.status === "open"
                ? `SLA còn lại: ${ticket.sla}`
                : "Đã xử lý"}
            </p>

            <div
              id="chat-scroll"
              className="border border-slate-800/60 rounded-xl bg-slate-900/40 p-3 h-64 overflow-y-auto text-sm"
            >
              {msgs.map((m, i) => (
                <p key={i} className={m.author === "Admin" ? "text-right" : ""}>
                  <strong>
                    {m.author === "Admin" ? "Admin" : ticket.user}:
                  </strong>{" "}
                  {m.text}
                </p>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  isClosed
                    ? "Ticket đã xử lý - không thể gửi thêm"
                    : "Nhập tin nhắn..."
                }
                className={`flex-1 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                  isClosed ? "cursor-not-allowed opacity-60" : ""
                }`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={isClosed}
              />
              <Button
                title="Gửi tin nhắn"
                onClick={() => appendMessage(input)}
                disabled={isClosed}
                className={`cursor-pointer rounded-lg bg-cyan-500/90 px-4 py-2 font-medium text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isClosed ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Gửi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------------------- Plans Page ---------------------------- */

  function PlansPage({ plans, setPlans, openForm, setOpenForm }) {
    const [name, setName] = useState("");
    const [days, setDays] = useState(7);
    const [price, setPrice] = useState(0);
    const [editingId, setEditingId] = useState(null);

    const resetForm = () => {
      setName("");
      setDays(7);
      setPrice(0);
      setEditingId(null);
    };

    const onSave = () => {
      if (!name.trim() || days <= 0 || price < 0) return;
      if (editingId) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === editingId ? { ...p, name: name.trim(), days, price } : p
          )
        );
      } else {
        const id = `pln_${Math.random().toString(36).slice(2, 7)}`;
        setPlans((prev) => [...prev, { id, name: name.trim(), days, price }]);
      }
      resetForm();
      setOpenForm(false);
    };

    const startEdit = (id) => {
      const p = plans.find((x) => x.id === id);
      if (!p) return;
      setEditingId(p.id);
      setName(p.name);
      setDays(p.days);
      setPrice(p.price);
      setOpenForm(true);
    };

    const removePlan = (id) => {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    };

    return (
      <div className="mx-auto max-w-5xl space-y-4 text-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Quản lý gói đăng bài
          </h2>
          <Button
            title="Tạo gói mới"
            onClick={() => {
              resetForm();
              setOpenForm(true);
            }}
            className="cursor-pointer rounded-xl bg-cyan-500/90 text-white hover:bg-cyan-500 gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo gói
          </Button>
        </div>

        {openForm && (
          <Card className={GLASS_CARD}>
            <CardHeader>
              <CardTitle>
                {editingId ? "Chỉnh sửa gói" : "Tạo gói mới"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="col-span-2">
                  <label className="text-sm text-slate-300">Tên gói</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: VIP"
                    className="w-full rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Số ngày</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={days === 0 ? "" : days}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const cleaned = raw.replace(/^0+/, "");
                      setDays(cleaned === "" ? 0 : parseInt(cleaned, 10));
                    }}
                    placeholder="Số ngày"
                    className="w-full rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">
                    Số tiền (VND)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={price > 0 ? price.toLocaleString("de-DE") : ""}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^\d]/g, "");
                      const cleaned = digitsOnly.replace(/^0+/, "");
                      setPrice(cleaned === "" ? 0 : parseInt(cleaned, 10));
                    }}
                    placeholder="Số tiền (VND)"
                    className="w-full rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-right text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={onSave}
                  title="Lưu gói"
                  className="rounded-lg bg-emerald-500/90 px-4 py-2 text-white hover:bg-emerald-500 transition-colors"
                >
                  Lưu
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    resetForm();
                    setOpenForm(false);
                  }}
                  title="Hủy thao tác"
                  className="rounded-lg bg-rose-500/90 px-4 py-2 text-white hover:bg-rose-500 transition-colors"
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className={GLASS_CARD}>
          <CardHeader>
            <CardTitle>Danh sách gói</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="text-slate-200">
              <TableHeader className="bg-slate-900/40 border-b border-slate-800/60 [&_th]:text-slate-300">
                <TableRow>
                  <TableHead className="w-[120px]">Mã</TableHead>
                  <TableHead>Tên gói</TableHead>
                  <TableHead>Số ngày</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-0">
                {plans.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-b border-slate-800/60 bg-slate-900/35 transition-colors hover:bg-slate-800/60"
                  >
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.days}</TableCell>
                    <TableCell className="text-right">
                      {currency(p.price)}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        title="Chỉnh sửa"
                        onClick={() => startEdit(p.id)}
                        className="cursor-pointer rounded-lg gap-2 px-3 py-1.5 text-xs border border-slate-700/50 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60"
                      >
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </Button>
                      <Button
                        title="Xóa gói"
                        onClick={() => removePlan(p.id)}
                        className="cursor-pointer rounded-lg bg-rose-500/80 text-white hover:bg-rose-500 gap-2 px-3 py-1.5 text-xs"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
}
