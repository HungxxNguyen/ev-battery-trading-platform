// ===============================
// File: src/pages/Admin/BrandPage.jsx
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
import { Pencil, Trash2, Plus } from "lucide-react";
import brandService from "../../services/apis/brandApi";

const GLASS_CARD6 =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const normalizedBrands = useMemo(
    () =>
      (brands || []).map((b) => ({
        id: b.id ?? b.Id ?? b.brandId ?? b.BrandId ?? b.uuid,
        name: b.name ?? b.Name ?? b.title ?? b.Title,
      })),
    [brands]
  );

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await brandService.getBrands();
      const list = Array.isArray(res)
        ? res
        : res?.data?.data ?? res?.result ?? [];
      if (!Array.isArray(list)) throw new Error("Dữ liệu không hợp lệ");
      setBrands(list);
    } catch (e) {
      console.error(e);
      setError(e?.error || e?.message || "Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const reset = () => {
    setName("");
    setEditingId(null);
  };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      setSaving(true);
      if (editingId) {
        await brandService.updateBrand(editingId, trimmed);
      } else {
        await brandService.createBrand(trimmed);
      }
      await fetchBrands();
      reset();
    } catch (e) {
      console.error(e);
      alert(e?.error || e?.message || "Không thể lưu thương hiệu");
    } finally {
      setSaving(false);
    }
  };

  const edit = (id) => {
    const b = normalizedBrands.find((x) => x.id === id);
    if (!b) return;
    setEditingId(b.id);
    setName(b.name || "");
  };

  const remove = async (id) => {
    if (!id) return;
    if (!confirm("Xóa thương hiệu này?")) return;
    try {
      setDeletingId(id);
      await brandService.deleteBrand(id);
      await fetchBrands();
    } catch (e) {
      console.error(e);
      alert(e?.error || e?.message || "Không thể xóa thương hiệu");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 text-slate-100">
      <Card className={GLASS_CARD6}>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Thương hiệu</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên thương hiệu..."
              className="flex-1 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            <Button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-cyan-500/90 text-white hover:bg-cyan-500 gap-2"
            >
              {editingId ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}{" "}
              {editingId ? "Cập nhật" : "Thêm"}
            </Button>
            {editingId && (
              <Button
                onClick={reset}
                className="rounded-lg bg-slate-700/80 text-white hover:bg-slate-700"
              >
                Hủy
              </Button>
            )}
          </div>

          {error && <div className="text-sm text-rose-400">{error}</div>}

          {/* Tăng khoảng cách & căn cột 25/50/25 bằng colgroup */}
          <Table className="text-slate-200">
            <colgroup>
              <col style={{ width: "25%" }} />
              <col style={{ width: "50%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>

            <TableHeader className="bg-slate-900/40 border-b border-slate-800/60 [&_th]:text-slate-300">
              <TableRow>
                <TableHead className="px-6">Mã</TableHead>
                <TableHead className="px-6">Tên</TableHead>
                <TableHead className="px-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="[&_tr:last-child]:border-0">
              {loading ? (
                <TableRow>
                  <TableCell className="px-6 py-4" colSpan={3}>
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : normalizedBrands.length === 0 ? (
                <TableRow>
                  <TableCell className="px-6 py-4 text-slate-400" colSpan={3}>
                    Chưa có thương hiệu nào
                  </TableCell>
                </TableRow>
              ) : (
                normalizedBrands.map((b) => (
                  <TableRow
                    key={b.id}
                    className="border-b border-slate-800/60 bg-slate-900/35 transition-colors hover:bg-slate-800/60"
                  >
                    <TableCell className="px-6 font-mono text-xs truncate">
                      {b.id}
                    </TableCell>
                    <TableCell className="px-6 font-medium truncate">
                      {b.name}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => edit(b.id)}
                          className="rounded-lg gap-2 px-3 py-1.5 text-xs border border-slate-700/50 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60"
                        >
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </Button>
                        <Button
                          onClick={() => remove(b.id)}
                          disabled={deletingId === b.id}
                          className="rounded-lg bg-rose-500/80 text-white hover:bg-rose-500 gap-2 px-3 py-1.5 text-xs disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
