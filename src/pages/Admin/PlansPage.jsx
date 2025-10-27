// ===============================
// File: src/pages/Admin/PlansPage.jsx
// ===============================
import React, { useEffect, useMemo, useState } from "react";
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
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import packageService from "../../services/apis/packageApi";

const GLASS_CARD4 =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";
const currency = (v) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // form state
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [days, setDays] = useState(30);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [packageType, setPackageType] = useState("ElectricCar");
  const [status, setStatus] = useState("Active");

  const typeOptions = useMemo(
    () => [
      { value: "ElectricCar", label: "Ô tô điện" },
      { value: "ElectricMotorbike", label: "Xe máy điện" },
      { value: "RemovableBattery", label: "Pin điện" },
      { value: "Free", label: "Miễn phí" },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [{ value: "Active", label: "Hoạt động" }],
    []
  );

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDays(30);
    setPrice(0);
    setDescription("");
    setPackageType("ElectricCar");
    setStatus("Active");
  };

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await packageService.getAllPackages();
      if (res.success && res.data?.data) {
        const list = res.data.data.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          days: pkg.durationInDays,
          price: pkg.price,
          description: pkg.description,
          packageType: pkg.packageType,
          status: pkg.status,
        }));
        setPlans(list);
      } else {
        console.error("Tải gói thất bại:", res.error || res.data);
      }
    } catch (e) {
      console.error("Lỗi tải danh sách gói:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const onSave = async () => {
    if (!name.trim() || days <= 0 || price < 0) return;
    const form = new FormData();
    if (editingId) form.append("Id", editingId);
    form.append("Name", name.trim());
    form.append("Price", String(price));
    form.append("DurationInDays", String(days));
    form.append("Description", description ?? "");
    form.append("PackageType", packageType);
    form.append("Status", status);

    setSubmitting(true);
    try {
      const res = editingId
        ? await packageService.updatePackage(form)
        : await packageService.createPackage(form);
      if (!res.success) {
        console.error("Lưu gói thất bại:", res.error || res.data);
        return;
      }
      await loadPlans();
      resetForm();
      setOpenForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (id) => {
    const p = plans.find((x) => x.id === id);
    if (!p) return;
    setEditingId(p.id);
    setName(p.name || "");
    setDays(p.days || 0);
    setPrice(p.price || 0);
    setDescription(p.description || "");
    setPackageType(p.packageType || "ElectricCar");
    setStatus(p.status || "Active");
    setOpenForm(true);
  };

  const removePlan = async (id) => {
    if (!id) return;
    if (!confirm("Xóa gói này?")) return;
    try {
      setDeletingId(id);
      const res = await packageService.deletePackage(id);
      if (!res.success) {
        console.error("Xóa gói thất bại:", res.error || res.data);
        alert(res?.error || "Không thể xóa gói");
        return;
      }
      await loadPlans();
    } catch (e) {
      console.error(e);
      alert(e?.error || e?.message || "Không thể xóa gói");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Quản lý gói đăng bài
        </h2>
        <div className="flex gap-2">
          <Button
            title="Làm mới"
            onClick={loadPlans}
            className="cursor-pointer rounded-xl border border-slate-700/50 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
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
      </div>

      {openForm && (
        <Card className={GLASS_CARD4}>
          <CardHeader>
            <CardTitle>{editingId ? "Chỉnh sửa gói" : "Tạo gói mới"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <div className="col-span-2">
                <label className="text-sm text-slate-300">Tên gói</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Gói 30 ngày"
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
              <div className="col-span-3">
                <label className="text-sm text-slate-300">Mô tả</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn cho gói"
                  className="w-full rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Loại gói</label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-300">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={onSave}
                title="Lưu gói"
                className="rounded-lg bg-emerald-500/90 px-4 py-2 text-white hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Đang lưu..." : "Lưu"}
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
                <TableHead>Loại</TableHead>
                <TableHead>Trạng thái</TableHead>
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
                  <TableCell>
                    <Badge className="bg-slate-700/70 text-slate-100">
                      {p.packageType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        p.status === "Active"
                          ? "bg-emerald-600/80"
                          : "bg-amber-600/80"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
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
                      disabled={deletingId === p.id}
                      className="cursor-pointer rounded-lg bg-rose-500/80 text-white hover:bg-rose-500 gap-2 px-3 py-1.5 text-xs"
                    >
                      <Trash2 className="h-4 w-4" />{" "}
                      {deletingId === p.id ? "Đang xóa..." : "Xóa"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && (
            <div className="mt-3 text-sm text-slate-400">
              Đang tải dữ liệu...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
