// ===============================
// File: src/pages/Admin/BrandPage.jsx
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
import { Pencil, Trash2, Plus } from "lucide-react";

const GLASS_CARD6 =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";

const seedBrands = [
  { id: "br_001", name: "VinFast" },
  { id: "br_002", name: "Pega" },
  { id: "br_003", name: "DatBike" },
];

export default function BrandPage() {
  const [brands, setBrands] = useState(seedBrands);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const reset = () => {
    setName("");
    setEditingId(null);
  };
  const save = () => {
    if (!name.trim()) return;
    if (editingId)
      setBrands((prev) =>
        prev.map((b) => (b.id === editingId ? { ...b, name: name.trim() } : b))
      );
    else
      setBrands((prev) => [
        ...prev,
        {
          id: `br_${Math.random().toString(36).slice(2, 7)}`,
          name: name.trim(),
        },
      ]);
    reset();
  };
  const edit = (id) => {
    const b = brands.find((x) => x.id === id);
    if (!b) return;
    setEditingId(b.id);
    setName(b.name);
  };
  const remove = (id) => setBrands((prev) => prev.filter((b) => b.id !== id));

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

          <Table className="text-slate-200">
            <TableHeader className="bg-slate-900/40 border-b border-slate-800/60 [&_th]:text-slate-300">
              <TableRow>
                <TableHead className="w-[120px]">Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:last-child]:border-0">
              {brands.map((b) => (
                <TableRow
                  key={b.id}
                  className="border-b border-slate-800/60 bg-slate-900/35 transition-colors hover:bg-slate-800/60"
                >
                  <TableCell className="font-mono text-xs">{b.id}</TableCell>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => edit(b.id)}
                      className="rounded-lg gap-2 px-3 py-1.5 text-xs border border-slate-700/50 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60"
                    >
                      <Pencil className="h-4 w-4" /> Sửa
                    </Button>
                    <Button
                      onClick={() => remove(b.id)}
                      className="rounded-lg bg-rose-500/80 text-white hover:bg-rose-500 gap-2 px-3 py-1.5 text-xs"
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
