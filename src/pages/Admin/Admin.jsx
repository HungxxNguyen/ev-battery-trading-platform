import { useMemo, useState, useEffect } from "react";
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
  Settings,
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

/* ------------------------------------------------------------------ */
/* Mock data & helpers                                                */
/* ------------------------------------------------------------------ */

const kpis = [
  { label: "Tổng User", value: 12480, sub: "+3.1% vs 7d" },
  { label: "Bài chờ duyệt", value: 128, sub: "24 quá hạn" },
  { label: "User bị báo xấu", value: 37, sub: "+5 hôm nay" },
  { label: "Doanh thu hôm nay", value: 92.4, sub: "+18% vs hôm qua" }, // triệu ₫
];

const KPI_COLORS = [
  "bg-blue-600",
  "bg-amber-500",
  "bg-green-600",
  "bg-rose-600",
];
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

const initialAdminAccount = {
  name: "Admin VoltX",
  email: "admin@voltx.vn",
  phone: "0912 345 678",
  role: "Admin",
};

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
  const [page, setPage] = useState("dashboard"); // "dashboard" | "review" | "support" | "settings" | "plans"
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [listingStatus, setListingStatus] = useState(initialListingStatuses);

  // Plans state
  const [plans, setPlans] = useState([
    { id: "pln_001", name: "Free", days: 7, price: 0 },
    { id: "pln_002", name: "Pro", days: 30, price: 99000 },
  ]);
  const [openPlanForm, setOpenPlanForm] = useState(false);

  // Admin profile state
  const [adminProfile, setAdminProfile] = useState(initialAdminAccount);

  const goToReviewWith = (id) => {
    setSelectedListingId(id);
    setPage("review");
  };
  const goToSupportWith = (id) => {
    setSelectedTicketId(id);
    setPage("support");
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r fixed top-16 bottom-0 left-0 flex flex-col z-30">
        <nav className="px-3 py-4 space-y-1 overflow-y-auto">
          <SideItem
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Dashboard"
            title="Trang tổng quan"
          />
          <SideItem
            active={page === "review"}
            onClick={() => setPage("review")}
            icon={<ClipboardCheck className="h-4 w-4" />}
            label="Duyệt bài"
            title="Quản lý bài đăng"
          />
          <SideItem
            active={page === "support"}
            onClick={() => setPage("support")}
            icon={<Headphones className="h-4 w-4" />}
            label="Hỗ trợ"
            title="Liên hệ & hỗ trợ"
          />
          <SideItem
            active={page === "plans"}
            onClick={() => {
              setPage("plans");
              setOpenPlanForm(false);
            }}
            icon={<FileText className="h-4 w-4" />}
            label="Gói đăng bài"
            title="Xem & chỉnh sửa các gói"
          />
          <SideItem
            active={page === "settings"}
            onClick={() => setPage("settings")}
            icon={<Settings className="h-4 w-4" />}
            label="Cấu hình"
            title="Cấu hình hệ thống"
          />
        </nav>
        <div className="mt-auto p-4 border-t">
          <Button
            variant="outline"
            className="w-full gap-2 cursor-pointer"
            title="Thoát khỏi hệ thống"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Header (đÃ bỏ nút Tạo gói) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 text-white shadow flex items-center px-4 z-40">
        <img src={logo3} alt="VoltX Exchange" className="h-8 w-auto mr-2" />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold">VoltX Exchange Admin</span>
          <span className="text-xs text-white/70">
            Second-hand EV & Battery
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 ml-64 mt-16 overflow-y-auto p-4 bg-background text-foreground">
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
        {page === "settings" && (
          <SettingsPage
            profile={adminProfile}
            onSave={(p) => setAdminProfile(p)}
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
}

function SideItem({ icon, label, active, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
        active
          ? "bg-muted font-medium"
          : "hover:bg-muted/60 text-muted-foreground"
      }`}
    >
      {icon}
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
    <div className="mx-auto max-w-7xl grid gap-6">
      {/* KPI */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={i}
            className={`${
              KPI_COLORS[i % KPI_COLORS.length]
            } text-white rounded-xl shadow-lg p-5`}
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
      <section className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Doanh thu 30 ngày gần nhất</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}m`} width={40} />
                <ChartTooltip
                  formatter={(v) => `${v} triệu ₫`}
                  labelFormatter={(l) => `Ngày ${l}`}
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
            <p className="text-xs text-muted-foreground mt-3">
              Tổng: {Math.round(totalRevenue)} triệu ₫
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bài đăng theo danh mục</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis width={32} />
                <ChartTooltip />
                <Bar dataKey="posts" radius={[6, 6, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
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
                <Legend />
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Pending Listings & Tickets */}
      <section className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Hàng chờ duyệt bài</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
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
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPosts
                  .filter(
                    (p) => (listingStatus[p.id] || "pending") === "pending"
                  )
                  .map((p) => {
                    const st = listingStatus[p.id] || "pending";
                    const badge =
                      st === "pending" ? (
                        <Badge className="bg-slate-100 text-slate-700 hover:!bg-slate-100">
                          Đang chờ
                        </Badge>
                      ) : st === "approved" ? (
                        <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                          Đã duyệt
                        </Badge>
                      ) : (
                        <Badge className="bg-red-600 text-white hover:bg-red-700">
                          Đã từ chối
                        </Badge>
                      );
                    return (
                      <TableRow
                        key={p.id}
                        className="hover:bg-muted/40 cursor-pointer"
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
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {p.createdAt}
                        </TableCell>
                        <TableCell>{badge}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Hỗ trợ (Open)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border hover:bg-muted/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{t.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        #{t.id} • {t.user}
                      </p>
                    </div>
                    <Badge variant="secondary" className="uppercase">
                      {t.tag}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-muted-foreground">
                      SLA: {t.sla || "—"}
                    </span>
                    <Button
                      className="cursor-pointer bg-black text-white hover:bg-neutral-800 px-3 py-1 text-xs rounded-lg"
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
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Danh sách bài đăng</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
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
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPosts.map((p) => {
                  const realStatus = listingStatus[p.id] || "pending";
                  const badge =
                    realStatus === "pending" ? (
                      <Badge className="bg-slate-100 text-slate-700 hover:!bg-slate-100">
                        Đang chờ
                      </Badge>
                    ) : realStatus === "approved" ? (
                      <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                        Đã duyệt
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600 text-white hover:bg-red-700">
                        Đã từ chối
                      </Badge>
                    );
                  return (
                    <TableRow
                      key={p.id}
                      className="hover:bg-muted/40 cursor-pointer"
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
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {p.createdAt}
                      </TableCell>
                      <TableCell>{badge}</TableCell>
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
    <div className="max-w-6xl mx-auto space-y-4 border rounded-xl p-6 shadow-sm bg-white">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={onBackToDashboard}
            className="p-2 cursor-pointer"
            aria-label="Quay lại danh sách duyệt bài"
            title="Quay lại danh sách duyệt bài"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Chi tiết duyệt bài</h2>
        </div>

        <div className="space-x-2">
          <Badge
            className={
              st === "approved"
                ? "bg-emerald-100 text-emerald-700"
                : st === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-700 hover:!bg-slate-100"
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
                className="cursor-pointer bg-green-600 hover:bg-green-700 text-white shadow-md"
                onClick={onApprove}
                title="Phê duyệt bài đăng"
              >
                Duyệt
              </Button>
              <Button
                onClick={onReject}
                title="Từ chối bài đăng"
                className="cursor-pointer bg-red-600 text-white hover:bg-red-700 shadow-md"
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="border-t my-4" />

      <Tabs defaultValue="info">
        <TabsList className="flex items-center justify-start gap-0 bg-transparent border-b pb-2">
          <TabsTrigger value="info" className="cursor-pointer px-4 py-2">
            Bài đăng
          </TabsTrigger>
          <span
            aria-hidden
            className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700"
          />
          <TabsTrigger value="images" className="cursor-pointer px-4 py-2">
            Hình ảnh hàng hóa
          </TabsTrigger>
          <span
            aria-hidden
            className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700"
          />
          <TabsTrigger value="docs" className="cursor-pointer px-4 py-2">
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
              className="rounded-lg border"
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
      <div className="max-w-6xl mx-auto space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Danh sách ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
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
              <TableBody>
                {tickets.map((t) => (
                  <TableRow
                    key={t.id}
                    className="hover:bg-muted/40 cursor-pointer"
                    onClick={() => onSelectTicket(t.id)}
                    title="Mở ticket để chat"
                  >
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="font-medium underline text-primary">
                      {t.subject}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {t.user}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell uppercase">
                      {t.tag}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {t.status === "open" ? t.sla || "—" : "—"}
                    </TableCell>
                    <TableCell>
                      {t.status === "open" ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:!bg-amber-100">
                          Đang mở
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:!bg-emerald-100">
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
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 cursor-pointer"
            aria-label="Quay lại danh sách ticket"
            title="Quay lại danh sách ticket"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Chat hỗ trợ khách hàng</h2>
        </div>

        {!isClosed && (
          <Button
            onClick={markDone}
            className="cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2.5 text-base shadow-md"
            title="Đánh dấu ticket đã xử lý"
          >
            Kết Thúc
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ticket.subject}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Khách hàng:{" "}
            <span className="font-medium text-foreground">{ticket.user}</span> •{" "}
            {ticket.status === "open"
              ? `SLA còn lại: ${ticket.sla}`
              : "Đã xử lý"}
          </p>

          <div
            id="chat-scroll"
            className="border rounded-lg p-3 h-64 overflow-y-auto bg-muted/30 text-sm"
          >
            {msgs.map((m, i) => (
              <p key={i} className={m.author === "Admin" ? "text-right" : ""}>
                <strong>{m.author === "Admin" ? "Admin" : ticket.user}:</strong>{" "}
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
              className={`flex-1 border rounded-lg px-3 py-2 text-sm ${
                isClosed ? "bg-muted cursor-not-allowed opacity-60" : ""
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
              className={`cursor-pointer px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${
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

/* ---------------------------- Settings Page ---------------------------- */

function SettingsPage({ profile, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);

  const startEdit = () => {
    setForm((prev) => ({
      ...prev,
      phone: normalizePhone(prev.phone),
      role: "Admin",
    }));
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(profile);
    setEditing(false);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return;
    if (form.phone.length !== 10) {
      alert("SĐT phải có đúng 10 chữ số theo định dạng 4-3-3!");
      return;
    }
    onSave({ ...form, phone: form.phone });
    setEditing(false);
  };

  const normalizePhone = (s = "") => s.replace(/\D/g, "").slice(0, 10);

  const formatPhone = (s = "") => {
    const d = normalizePhone(s);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold">Cấu hình hệ thống</h2>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!editing ? (
            <>
              <p>
                <strong>Tên:</strong> {profile.name}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>SĐT:</strong> {profile.phone}
              </p>
              <p>
                <strong>Vai trò:</strong> {profile.role}
              </p>
              <Button
                className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 cursor-pointer transition-all duration-200"
                title="Chỉnh sửa thông tin"
                onClick={startEdit}
              >
                Cập nhật thông tin
              </Button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Tên</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nhập tên"
                  />
                </div>
                <div>
                  <label className="text-sm">Email</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="you@voltx.vn"
                  />
                </div>
                <div>
                  <p>
                    <span className="text-sm font-medium">SĐT:</span>{" "}
                    {formatPhone(form.phone || "")}
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={formatPhone(form.phone)}
                    onChange={(e) => {
                      const digits = normalizePhone(e.target.value);
                      setForm((prev) => ({ ...prev, phone: digits }));
                    }}
                    placeholder="0333 031 583"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Định dạng: 4-3-3 (10 số). Ví dụ: 0333 031 583
                  </p>
                </div>
                <div>
                  <label className="text-sm">Vai trò</label>
                  <input
                    type="text"
                    value="Admin"
                    readOnly
                    className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={handleSave}
                  title="Lưu thay đổi"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer transition-all duration-200"
                >
                  Lưu
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  title="Hủy và quay lại"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer transition-all duration-200"
                >
                  Hủy
                </Button>
              </div>
            </>
          )}
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
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quản lý gói đăng bài</h2>
        <Button
          title="Tạo gói mới"
          onClick={() => {
            resetForm();
            setOpenForm(true);
          }}
          className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white gap-2 shadow-md"
        >
          <Plus className="h-4 w-4" />
          Tạo gói
        </Button>
      </div>

      {openForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Chỉnh sửa gói" : "Tạo gói mới"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="col-span-2">
                <label className="text-sm">Tên gói</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: VIP"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm">Số ngày</label>
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
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="text-sm">Số tiền (VND)</label>
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
                  className="w-full border rounded-lg px-3 py-2 text-right focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={onSave}
                title="Lưu gói"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danh sách gói</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Mã</TableHead>
                <TableHead>Tên gói</TableHead>
                <TableHead>Số ngày</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((p) => (
                <TableRow key={p.id}>
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
                      className="cursor-pointer gap-2 px-2 py-1 text-xs"
                    >
                      <Pencil className="h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      title="Xóa gói"
                      onClick={() => removePlan(p.id)}
                      className="cursor-pointer bg-red-600 text-white hover:bg-red-700 gap-2 px-2 py-1 text-xs"
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

/* ------------------------------------------------------------------ */
/* Lightweight runtime checks ("tests")                                */
/* ------------------------------------------------------------------ */
if (typeof window !== "undefined") {
  console.assert(
    Array.isArray(kpis) && kpis.length === 4,
    "KPIs should have 4 items"
  );
  console.assert(
    pendingPosts.every((p) => p.id && p.title),
    "Pending posts must have id & title"
  );
  console.assert(
    allTickets.every((t) => t.id && t.subject),
    "Tickets must have id & subject"
  );
  console.assert(
    currency(1000).endsWith("₫"),
    "Currency formatter should output VND symbol"
  );
  console.assert(
    initialListingStatuses["lst_001"] === "pending",
    "lst_001 should be pending"
  );
  console.assert(
    initialListingStatuses["lst_002"] === "rejected",
    "lst_002 should be rejected"
  );
  console.assert(
    initialListingStatuses["lst_003"] === "approved",
    "lst_003 should be approved"
  );
  console.assert(
    revenueData.length === 30,
    "Revenue data should have 30 points"
  );
  console.assert(
    typeof SupportPage === "function",
    "SupportPage should be defined"
  );
  console.assert(
    allTickets.some((t) => t.status === "closed"),
    "There should be at least one closed ticket"
  );
  console.assert(
    openTickets.every((ot) => allTickets.some((t) => t.id === ot.id)),
    "openTickets subset"
  );
  console.assert(
    openTickets.every((ot) => ot.status === "open"),
    "openTickets all open"
  );
}
