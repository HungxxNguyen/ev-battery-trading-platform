import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/Table/table";
import { Button } from "../../components/Button/button";
import {
  LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { kpis, KPI_COLORS, COLORS, revenueData, categoryData, planMix } from "../../constants/chart";
import { pendingPosts } from "../../constants/listings";
import { openTickets } from "../../constants/tickets";
import { Badge } from "../../components/Badge/badge";
import { currency, formatKpiValue } from "../../utils/currency";

export default function DashboardPage() {
  const totalRevenue = useMemo(() => revenueData.reduce((a, b) => a + b.revenue, 0), []);

  return (
    <div className="mx-auto max-w-7xl grid gap-6">
      {/* KPI */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={i} className={`${KPI_COLORS[i % KPI_COLORS.length]} text-white rounded-xl shadow-lg p-5`}>
            <div className="text-sm opacity-90">{k.label}</div>
            <div className="text-3xl font-extrabold mt-2">{formatKpiValue(k)}</div>
            <div className="text-xs opacity-90 mt-2">{k.sub}</div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader><CardTitle>Doanh thu 30 ngày gần nhất</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}m`} width={40} />
                <ChartTooltip formatter={(v) => `${v} triệu ₫`} labelFormatter={(l) => `Ngày ${l}`} />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-3">Tổng: {Math.round(totalRevenue)} triệu ₫</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bài đăng theo danh mục</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>Tỉ lệ gói</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={planMix} innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {planMix.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
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
                  <TableHead className="hidden md:table-cell">Danh mục</TableHead>
                  <TableHead className="hidden lg:table-cell">Người bán</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="hidden sm:table-cell">Tạo lúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPosts.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/40 cursor-pointer">
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium underline text-primary">{p.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.category}</TableCell>
                    <TableCell className="hidden lg:table-cell">{p.seller}</TableCell>
                    <TableCell className="text-right">{currency(p.price)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{p.createdAt}</TableCell>
                    <TableCell><Badge className="bg-slate-100 text-slate-700">Đang chờ</Badge></TableCell>
                  </TableRow>
                ))}
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
                <div key={t.id} className="p-3 rounded-xl border hover:bg-muted/40 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{t.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">#{t.id} • {t.user}</p>
                    </div>
                    <Badge variant="secondary" className="uppercase">{t.tag}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-muted-foreground">SLA: {t.sla || "—"}</span>
                    <Button className="cursor-pointer bg-black text-white hover:bg-neutral-800 px-3 py-1 text-xs rounded-lg">Xử lý</Button>
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
