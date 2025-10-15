// ===============================
// File: src/pages/Admin/ReviewPage.jsx
// ===============================
import React, { useMemo, useState } from "react";
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
import { ArrowLeft, FileText } from "lucide-react";

const GLASS_CARD2 =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";

const pendingPosts2 = [
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
const EMPTY_DETAIL = {
  id: "",
  title: "",
  category: "",
  seller: { name: "" },
  price: 0,
  images: [],
  evidence: [],
};
const currency2 = (v) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

export default function ReviewPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [listingStatus, setListingStatus] = useState(initialListingStatuses);
  const [tab, setTab] = useState("info");

  const onSelectListing = (id) => {
    setSelectedId(id);
    setTab("info");
  };
  const backToList = () => setSelectedId(null);

  const detail = useMemo(
    () =>
      selectedId
        ? LISTING_DETAILS.find((x) => x.id === selectedId) ?? EMPTY_DETAIL
        : EMPTY_DETAIL,
    [selectedId]
  );

  const st = selectedId ? listingStatus[selectedId] || "pending" : "pending";
  const disabled = selectedId ? st !== "pending" : true;

  if (!selectedId)
    return (
      <div className="max-w-6xl mx-auto">
        <Card className={GLASS_CARD2}>
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
                  <TableHead className="w-[140px]">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-0 [&>tr>td]:py-3">
                {pendingPosts2.map((p) => {
                  const cur = listingStatus[p.id] || "pending";
                  const badge =
                    cur === "pending" ? (
                      <Badge className="inline-flex items-center whitespace-nowrap px-2.5 py-1 bg-amber-500/80 text-white">
                        Đang chờ
                      </Badge>
                    ) : cur === "approved" ? (
                      <Badge className="inline-flex items-center whitespace-nowrap px-2.5 py-1 bg-emerald-500/80 text-white">
                        Đã duyệt
                      </Badge>
                    ) : (
                      <Badge className="inline-flex items-center whitespace-nowrap px-2.5 py-1 bg-rose-500/80 text-white">
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
                        {currency2(p.price)}
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
    <div className="mx-auto max-w-6xl space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-2xl text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={backToList}
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
          {st === "pending" && (
            <>
              <Button
                className="cursor-pointer rounded-lg bg-emerald-500/90 text-white hover:bg-emerald-500"
                onClick={() =>
                  setListingStatus((prev) => ({
                    ...prev,
                    [selectedId]: "approved",
                  }))
                }
              >
                Duyệt
              </Button>
              <Button
                className="cursor-pointer rounded-lg bg-rose-500/90 text-white hover:bg-rose-500"
                onClick={() =>
                  setListingStatus((prev) => ({
                    ...prev,
                    [selectedId]: "rejected",
                  }))
                }
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800/60 bg-slate-900/40 pb-2 text-slate-300">
        <TabBtn
          active={tab === "info"}
          onClick={() => setTab("info")}
          label="Bài đăng"
        />
        <span aria-hidden className="mx-2 h-6 w-px bg-slate-700/50" />
        <TabBtn
          active={tab === "images"}
          onClick={() => setTab("images")}
          label="Hình ảnh hàng hóa"
        />
        <span aria-hidden className="mx-2 h-6 w-px bg-slate-700/50" />
        <TabBtn
          active={tab === "docs"}
          onClick={() => setTab("docs")}
          label="Giấy tờ / Chứng từ"
        />
      </div>

      {tab === "info" && (
        <div className="p-1 space-y-1">
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
            <strong>Giá:</strong> {currency2(detail.price)}
          </p>
          <p>
            <strong>Danh mục:</strong> {detail.category}
          </p>
        </div>
      )}

      {tab === "images" && (
        <div className="p-1 grid grid-cols-2 md:grid-cols-3 gap-2">
          {detail.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Ảnh hàng hóa"
              className="rounded-lg border border-slate-800/60"
            />
          ))}
        </div>
      )}

      {tab === "docs" && (
        <div className="p-1 space-y-2">
          {detail.evidence.map((f, i) => (
            <div key={i} className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" /> {f.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-4 py-2 text-slate-300 rounded-lg transition-colors ${
        active ? "bg-slate-800/60 text-white" : "hover:text-white"
      }`}
      title={label}
    >
      {label}
    </button>
  );
}
