// src/pages/Admin/BrandPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/Card/card.jsx";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/Table/table.jsx";
import { Button } from "../../components/Button/button.jsx";
import { Badge } from "../../components/Badge/badge.jsx";
import { Pencil, Power, Trash2, Save, X, Search } from "lucide-react";

import { SEGMENTS, COUNTRIES, seedBrands } from "../../constants/brands.jsx";
import { slugify } from "../../utils/text.jsx";

/* --------------------------------- storage -------------------------------- */
const LS_KEY = "voltx_brands_v1";

/* --------------------------------- helpers -------------------------------- */
function loadBrands() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedBrands();
}
function persist(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {}
}
function generateId(name) {
  const base = `brd_${slugify(name)}`;
  return base;
}

/* ---------------------------------- page ---------------------------------- */
export default function BrandPage() {
  const [list, setList] = useState(loadBrands);
  const [filterSeg, setFilterSeg] = useState("all");
  const [q, setQ] = useState("");

  // form
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0] || "Việt Nam");
  const [segment, setSegment] = useState(SEGMENTS[0]);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    persist(list);
  }, [list]);

  const brands = useMemo(() => {
    let arr = [...list];
    if (filterSeg !== "all") arr = arr.filter((b) => b.segment === filterSeg);
    if (q.trim()) {
      const nq = q.toLowerCase().trim();
      arr = arr.filter(
        (b) =>
          (b.name || "").toLowerCase().includes(nq) ||
          (b.country || "").toLowerCase().includes(nq) ||
          (b.slug || "").toLowerCase().includes(nq)
      );
    }
    return arr;
  }, [list, filterSeg, q]);

  const count = brands.length;

  /* -------------------------------- actions -------------------------------- */
  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCountry(COUNTRIES[0] || "Việt Nam");
    setSegment(SEGMENTS[0]);
    setLogo("");
  };

  const startEdit = (id) => {
    const b = list.find((x) => x.id === id);
    if (!b) return;
    setEditingId(b.id);
    setName(b.name);
    setCountry(b.country || (COUNTRIES[0] || "Việt Nam"));
    setSegment(b.segment);
    setLogo(b.logo || "");
  };

  const remove = (id) => {
    if (!confirm("Xóa hãng này?")) return;
    setList((prev) => prev.filter((b) => b.id !== id));
    if (editingId === id) resetForm();
  };

  const toggle = (id) => {
    setList((prev) => prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  };

  const onSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Vui lòng nhập tên hãng.");
      return;
    }
    if (!country.trim()) {
      alert("Vui lòng chọn quốc gia.");
      return;
    }
    if (!SEGMENTS.includes(segment)) {
      alert("Phân khúc không hợp lệ (chỉ Xe điện hoặc Pin).");
      return;
    }

    if (editingId) {
      setList((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? {
                ...b,
                name: trimmed,
                country,
                segment,
                logo: logo.trim(),
                slug: slugify(trimmed),
              }
            : b
        )
      );
    } else {
      let id = generateId(trimmed);
      // đảm bảo id unique
      if (list.some((b) => b.id === id)) {
        let i = 2;
        while (list.some((b) => b.id === `${id}_${i}`)) i++;
        id = `${id}_${i}`;
      }
      setList((prev) => [
        ...prev,
        {
          id,
          name: trimmed,
          country,
          segment,
          logo: logo.trim(),
          slug: slugify(trimmed),
          enabled: true,
        },
      ]);
    }
    resetForm();
  };

  /* ---------------------------------- UI ----------------------------------- */
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Form thêm/sửa */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl">Thêm hãng mới</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-1">
              <label className="text-sm">
                Tên hãng <span className="text-red-600">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: YADEA, Honda EV, …"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm">
                Quốc gia <span className="text-red-600">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm">
                Phân khúc <span className="text-red-600">*</span>
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {SEGMENTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm">Logo URL (tùy chọn)</label>
              <input
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://…/logo.png"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onSave}
                title={editingId ? "Lưu thay đổi" : "Thêm hãng"}
                className="cursor-pointer bg-green-600 text-white hover:bg-green-700 rounded-md px-4 py-2 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingId ? "Lưu" : "Thêm"}
              </Button>
              {editingId ? (
                <Button
                  onClick={resetForm}
                  title="Hủy chỉnh sửa"
                  className="cursor-pointer bg-red-600 text-white hover:bg-red-700 rounded-md px-4 py-2 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar lọc + tìm kiếm */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterSeg("all")}
          title="Hiển thị tất cả"
          className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${
            filterSeg === "all" ? "bg-sky-600 text-white" : "border bg-white hover:bg-gray-50"
          }`}
        >
          Tất cả
        </button>
        {SEGMENTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterSeg(s)}
            title={`Lọc theo: ${s}`}
            className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${
              filterSeg === s ? "bg-sky-600 text-white" : "border bg-white hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên, quốc gia, slug…"
              className="pl-8 pr-3 py-2 rounded-lg border focus:outline-none focus:ring w-72"
            />
          </div>
          <span className="text-sm text-gray-600">
            <strong>KẾT QUẢ:</strong> {count}
          </span>
        </div>
      </div>

      {/* Danh sách */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-end justify-between w-full">
            <CardTitle className="text-2xl">Danh sách hãng</CardTitle>
            <div className="text-sm"><strong>Tổng số hãng:</strong> {list.length}</div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-xl overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-gray-50">
                  <TableHead className="w-[140px] font-semibold text-gray-700">MÃ</TableHead>
                  <TableHead className="font-semibold text-gray-700">HÃNG</TableHead>
                  <TableHead className="font-semibold text-gray-700">QUỐC GIA</TableHead>
                  <TableHead className="font-semibold text-gray-700">PHÂN KHÚC</TableHead>
                  <TableHead className="font-semibold text-gray-700">THAO TÁC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((b) => (
                  <TableRow key={b.id} className="border-b">
                    <TableCell className="font-mono text-xs align-top">{b.id}</TableCell>

                    <TableCell className="align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-md border flex items-center justify-center overflow-hidden bg-gray-50">
                          {b.logo ? (
                            <img src={b.logo} alt="logo" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{b.name}</div>
                          <div className="text-xs text-gray-500">/{b.slug || slugify(b.name)}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top">{b.country || "—"}</TableCell>
                    <TableCell className="align-top">{b.segment}</TableCell>

                    <TableCell className="align-top">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => startEdit(b.id)}
                          title="Chỉnh sửa"
                          className="cursor-pointer gap-2 px-3 py-1.5 text-sm"
                        >
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </Button>

                        <Button
                          onClick={() => toggle(b.id)}
                          title={b.enabled ? "Tắt hiển thị hãng này" : "Bật hiển thị hãng này"}
                          className={`cursor-pointer gap-2 px-3 py-1.5 text-sm ${
                            b.enabled ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-gray-300 text-white hover:bg-gray-400"
                          }`}
                        >
                          <Power className="h-4 w-4" />
                          {b.enabled ? "Tắt" : "Bật"}
                        </Button>

                        <Button
                          onClick={() => remove(b.id)}
                          title="Xóa hãng"
                          className="cursor-pointer bg-red-600 text-white hover:bg-red-700 gap-2 px-3 py-1.5 text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {brands.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
