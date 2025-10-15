// ===============================
// File: src/pages/Admin/PlansPage.jsx
// ===============================
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/Table/table";
import { Button } from "../../components/Button/button";
import { Badge } from "../../components/Badge/badge";
import { Pencil, Trash2, Plus } from "lucide-react";

const GLASS_CARD4 =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";
const currency = (v) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

export default function PlansPage() {
  const [plans, setPlans] = useState([
    { id: "pln_001", name: "Free", days: 7, price: 0 },
    { id: "pln_002", name: "Pro", days: 30, price: 99000 },
  ]);
  const [openForm, setOpenForm] = useState(false);
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
  const removePlan = (id) =>
    setPlans((prev) => prev.filter((p) => p.id !== id));

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
          <Plus className="h-4 w-4" /> Tạo gói
        </Button>
      </div>

      {openForm && (
        <Card className={GLASS_CARD4}>
          <CardHeader>
            <CardTitle>{editingId ? "Chỉnh sửa gói" : "Tạo gói mới"}</CardTitle>
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
                <label className="text-sm text-slate-300">Số tiền (VND)</label>
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

      <Card className={GLASS_CARD4}>
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
                      title="Chỉnh sửa"
                      onClick={() => startEdit(p.id)}
                      className="cursor-pointer rounded-lg gap-2 px-3 py-1.5 text-xs border border-slate-700/50 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60"
                    >
                      <Pencil className="h-4 w-4" /> Sửa
                    </Button>
                    <Button
                      title="Xóa gói"
                      onClick={() => removePlan(p.id)}
                      className="cursor-pointer rounded-lg bg-rose-500/80 text-white hover:bg-rose-500 gap-2 px-3 py-1.5 text-xs"
                    >
                      <Trash2 className="h-4 w-4" /> Xóa
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
