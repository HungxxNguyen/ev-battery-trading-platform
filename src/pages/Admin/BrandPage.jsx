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
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ArrowUpDown,
  Copy,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
} from "lucide-react";
import brandService from "../../services/apis/brandApi";

const GLASS_CARD6 =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";

// Category/Type options
const CATEGORY_OPTIONS = [
  { value: "ElectricCar", label: "Ô tô điện" },
  { value: "ElectricMotorbike", label: "Xe máy điện" },
  { value: "RemovableBattery", label: "Pin điện" },
];

const TYPE_BADGE = {
  ElectricCar: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
  ElectricMotorbike: "border-sky-500/30 text-sky-300 bg-sky-500/10",
  RemovableBattery: "border-amber-500/30 text-amber-300 bg-amber-500/10",
};

const typeToLabel = (val) =>
  CATEGORY_OPTIONS.find((x) => x.value === val)?.label || val || "-";

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState(CATEGORY_OPTIONS[0].value);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Table UX states
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name"); // id | name | type
  const [sortDir, setSortDir] = useState("asc"); // asc | desc
  const [density, setDensity] = useState("cozy"); // cozy | compact
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [copiedId, setCopiedId] = useState(null);

  const normalizedBrands = useMemo(
    () =>
      (brands || []).map((b) => ({
        id: b.id ?? b.Id ?? b.brandId ?? b.BrandId ?? b.uuid,
        name: b.name ?? b.Name ?? b.title ?? b.Title,
        type:
          b.type ??
          b.Type ??
          b.category ??
          b.Category ??
          b.brandType ??
          b.BrandType,
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
    setType(CATEGORY_OPTIONS[0].value);
    setEditingId(null);
  };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return alert("Vui lòng nhập tên thương hiệu");
    if (!type) return alert("Vui lòng chọn loại (Type)");

    try {
      setSaving(true);
      if (editingId) {
        await brandService.updateBrand(editingId, trimmed, type);
      } else {
        await brandService.createBrand(trimmed, type);
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
    setType(b.type || CATEGORY_OPTIONS[0].value);
    // cuộn đến form
    document
      ?.getElementById("brand-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // Copy ID UX
  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // bỏ qua
    }
  };

  // --- Filter + Sort + Paginate ---
  // Reset page khi bộ lọc/sort/search đổi
  useEffect(() => {
    setPage(1);
  }, [query, typeFilter, sortBy, sortDir, pageSize]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalizedBrands.filter((b) => {
      const passType = typeFilter === "ALL" ? true : b.type === typeFilter;
      const passQuery =
        !q ||
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.id && String(b.id).toLowerCase().includes(q));
      return passType && passQuery;
    });
  }, [normalizedBrands, query, typeFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const va = (a[sortBy] ?? "").toString().toLowerCase();
      const vb = (b[sortBy] ?? "").toString().toLowerCase();
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const changeSort = (key) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const headSortBtn = (key, label) => (
    <button
      type="button"
      onClick={() => changeSort(key)}
      className="inline-flex items-center gap-1 group"
      aria-label={`Sắp xếp theo ${label}`}
    >
      <span>{label}</span>
      <ArrowUpDown
        className={`h-3.5 w-3.5 transition-opacity ${
          sortBy === key ? "opacity-100" : "opacity-50 group-hover:opacity-80"
        }`}
      />
      {sortBy === key && (
        <span className="sr-only">
          {sortDir === "asc" ? "tăng dần" : "giảm dần"}
        </span>
      )}
    </button>
  );

  const rowPad = density === "compact" ? "py-2" : "py-3";

  return (
    <div className="mx-auto max-w-5xl space-y-4 text-slate-100">
      <Card className={GLASS_CARD6}>
        <CardHeader className="flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
            Thương hiệu
          </h2>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Form */}
          <div id="brand-form" className="flex flex-col md:flex-row gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên thương hiệu..."
              className="flex-1 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="min-w-[200px] rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              title="Loại (Type) của thương hiệu"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

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

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-2 items-stretch lg:items-center justify-between">
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo tên hoặc mã…"
                  className="pl-8 pr-8 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 w-64"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    aria-label="Xóa tìm kiếm"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                title="Lọc theo loại"
              >
                <option value="ALL">Tất cả loại</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-sm text-rose-400">{error}</div>}

          {/* Scroll container + sticky header */}
          <div className="rounded-xl border border-slate-800/60 overflow-hidden">
            <div className="max-h-[460px] overflow-auto">
              <Table className="text-slate-200">
                <colgroup>
                  <col style={{ width: "26%" }} />
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "22%" }} />
                </colgroup>

                <TableHeader className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur border-b border-slate-800/60 [&_th]:text-slate-300">
                  <TableRow>
                    <TableHead className="px-6">
                      {headSortBtn("id", "Mã")}
                    </TableHead>
                    <TableHead className="px-6">
                      {headSortBtn("name", "Tên")}
                    </TableHead>
                    <TableHead className="px-6">
                      {headSortBtn("type", "Loại")}
                    </TableHead>
                    <TableHead className="px-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="[&_tr:last-child]:border-0">
                  {loading ? (
                    // Skeleton rows
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow
                        key={`sk-${i}`}
                        className="border-b border-slate-800/60 odd:bg-slate-900/20 even:bg-slate-900/10"
                      >
                        <TableCell className={`px-6 ${rowPad}`}>
                          <div className="h-3 w-40 bg-slate-700/40 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className={`px-6 ${rowPad}`}>
                          <div className="h-3 w-56 bg-slate-700/40 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className={`px-6 ${rowPad}`}>
                          <div className="h-3 w-24 bg-slate-700/40 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className={`px-6 ${rowPad}`}>
                          <div className="h-7 w-40 bg-slate-700/40 rounded animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : visibleRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        className="px-6 py-10 text-slate-400 text-center"
                        colSpan={4}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-sm">
                            Không có dữ liệu phù hợp.
                          </div>
                          <Button
                            onClick={() => {
                              setQuery("");
                              setTypeFilter("ALL");
                            }}
                            className="rounded-lg border border-slate-700/60 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60 text-xs px-3 py-1.5"
                          >
                            Xóa bộ lọc
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRows.map((b, idx) => (
                      <TableRow
                        key={b.id}
                        className={`border-b border-slate-800/60 transition-colors hover:bg-slate-800/60 ${
                          idx % 2 === 0 ? "bg-slate-900/25" : "bg-slate-900/15"
                        }`}
                      >
                        <TableCell className={`px-6 ${rowPad}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs truncate">
                              {b.id}
                            </span>
                            <button
                              title="Copy mã"
                              aria-label="Copy mã"
                              onClick={() => copyId(b.id)}
                              className="p-1 rounded border border-slate-700/60 hover:bg-slate-800/70"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            {copiedId === b.id && (
                              <span className="text-[10px] text-emerald-300">
                                Đã copy
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className={`px-6 ${rowPad}`}>
                          <span className="font-medium truncate">{b.name}</span>
                        </TableCell>

                        <TableCell className={`px-6 ${rowPad}`}>
                          <span
                            className={`rounded-md border px-2 py-1 text-[11px] ${
                              TYPE_BADGE[b.type] ||
                              "border-slate-600/40 text-slate-300 bg-slate-700/20"
                            }`}
                          >
                            {typeToLabel(b.type)}
                          </span>
                        </TableCell>

                        <TableCell className={`px-6 ${rowPad}`}>
                          <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Footer: pagination & summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-950/40 px-4 py-2 border-t border-slate-800/60">
              <div className="text-xs text-slate-400">
                Đang hiển thị{" "}
                <span className="text-slate-200">
                  {visibleRows.length ? (currentPage - 1) * pageSize + 1 : 0}
                  {"–"}
                  {Math.min(currentPage * pageSize, total)}
                </span>{" "}
                trong tổng <span className="text-slate-200">{total}</span>{" "}
                thương hiệu
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-slate-700/60 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60 px-2 py-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-slate-300">
                  Trang <span className="text-slate-100">{currentPage}</span> /{" "}
                  {totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-700/60 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60 px-2 py-1.5"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
