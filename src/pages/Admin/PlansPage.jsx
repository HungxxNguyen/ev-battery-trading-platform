import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/Table/table";
import { Button } from "../../components/Button/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { currency } from "../../utils/currency";
import { clampDays, validateDays } from "../../utils/daysValidation";
import { seedPlans } from "../../constants/admin";

export default function PlansPage() {
  const [plans, setPlans] = useState(seedPlans);
  const [openForm, setOpenForm] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState(7);
  const [price, setPrice] = useState(0);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => { setName(""); setDays(7); setPrice(0); setEditingId(null); };
  const startEdit = (id) => {
    const p = plans.find((x) => x.id === id);
    if (!p) return;
    setEditingId(p.id);
    setName(p.name);
    setDays(p.days);
    setPrice(p.price);
    setOpenForm(true);
  };
  const removePlan = (id) => setPlans((prev) => prev.filter((p) => p.id !== id));

  const onSave = () => {
    if (!name.trim()) return;
    const v = clampDays(days, 1, 30);
    const { ok, msg } = validateDays(v, { min: 1, max: 30 });
    if (!ok) { alert(msg); return; }
    const safePrice = Math.max(0, parseInt(price || 0, 10) || 0);
    if (editingId) {
      setPlans((prev) => prev.map((p) => (p.id === editingId ? { ...p, name: name.trim(), days: v, price: safePrice } : p)));
    } else {
      const id = `pln_${Math.random().toString(36).slice(2, 7)}`;
      setPlans((prev) => [...prev, { id, name: name.trim(), days: v, price: safePrice }]);
    }
    resetForm();
    setOpenForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quản lý gói đăng bài</h2>
        <Button title="Tạo gói mới" onClick={() => { resetForm(); setOpenForm(true); }} className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white gap-2 shadow-md">
          <Plus className="h-4 w-4" /> Tạo gói
        </Button>
      </div>

      {openForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Chỉnh sửa gói" : "Tạo gói mới"}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="col-span-2">
                <label className="text-sm">Tên gói <span className="text-red-600">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: VIP" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-sm">Số ngày (≤ 30) <span className="text-red-600">*</span></label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={days === 0 ? "" : days}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const cleaned = raw.replace(/^0+/, "");
                    const n = cleaned === "" ? 0 : parseInt(cleaned, 10);
                    setDays(clampDays(n, 1, 30));
                  }}
                  placeholder="Số ngày"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="text-sm">Số tiền (VND) <span className="text-red-600">*</span></label>
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
              <Button onClick={onSave} title="Lưu gói" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                Lưu
              </Button>
              <Button variant="destructive" onClick={() => { resetForm(); setOpenForm(false); }} title="Hủy thao tác">
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Danh sách gói</CardTitle></CardHeader>
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
                  <TableCell className="text-right">{currency(p.price)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" title="Chỉnh sửa" onClick={() => startEdit(p.id)} className="cursor-pointer gap-2 px-2 py-1 text-xs">
                      <Pencil className="h-4 w-4" /> Sửa
                    </Button>
                    <Button title="Xóa gói" onClick={() => removePlan(p.id)} className="cursor-pointer bg-red-600 text-white hover:bg-red-700 gap-2 px-2 py-1 text-xs">
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
