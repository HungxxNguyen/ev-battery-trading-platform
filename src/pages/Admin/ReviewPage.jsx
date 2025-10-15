import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/Card/card.jsx";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/Table/table.jsx";
import { Button } from "../../components/Button/button.jsx";
import { Badge } from "../../components/Badge/badge.jsx";
import { ArrowLeft, FileText } from "lucide-react";

import { pendingPosts, LISTING_DETAILS, initialListingStatuses } from "../../constants/listings.jsx";
import { currency } from "../../utils/currency.jsx";

/** Empty detail fallback to keep hooks order stable */
const EMPTY_DETAIL = {
  id: "",
  title: "",
  category: "",
  seller: { name: "" },
  price: 0,
  images: [],
  evidence: [],
};

export default function ReviewPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [listingStatus, setListingStatus] = useState(initialListingStatuses);
  const [tab, setTab] = useState("info"); // "info" | "images" | "docs"

  const onSelectListing = (id) => {
    setSelectedId(id);
    setTab("info");
  };
  const backToList = () => setSelectedId(null);

  // ❗ Always call hooks at top level (no condition)
  const detail = useMemo(() => {
    if (!selectedId) return EMPTY_DETAIL;
    return LISTING_DETAILS.find((x) => x.id === selectedId) ?? EMPTY_DETAIL;
  }, [selectedId]);

  const st = selectedId ? listingStatus[selectedId] || "pending" : "pending";
  const disabled = selectedId ? st !== "pending" : true;

  const approve = () => {
    if (!selectedId) return;
    setListingStatus((prev) => ({ ...prev, [selectedId]: "approved" }));
  };
  const reject = () => {
    if (!selectedId) return;
    setListingStatus((prev) => ({ ...prev, [selectedId]: "rejected" }));
  };

  /* ------------------------------ List view ------------------------------ */
  if (!selectedId) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Danh sách bài đăng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b">
                    <TableHead className="w-[120px] font-semibold text-gray-700">MÃ</TableHead>
                    <TableHead className="font-semibold text-gray-700">TIÊU ĐỀ</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden md:table-cell">DANH MỤC</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">NGƯỜI BÁN</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">GIÁ</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">TẠO LÚC</TableHead>
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">TRẠNG THÁI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPosts.map((p) => {
                    const cur = listingStatus[p.id] || "pending";
                    const badge =
                      cur === "pending" ? (
                        <Badge className="whitespace-nowrap">Đang chờ</Badge>
                      ) : cur === "approved" ? (
                        <Badge color="green" className="whitespace-nowrap">Đã duyệt</Badge>
                      ) : (
                        <Badge color="red" className="whitespace-nowrap">Đã từ chối</Badge>
                      );
                    return (
                      <TableRow
                        key={p.id}
                        className="border-b hover:bg-muted/40 cursor-pointer"
                        onClick={() => onSelectListing(p.id)}
                        title="Mở chi tiết bài đăng"
                      >
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell className="font-medium text-primary underline">{p.title}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.category}</TableCell>
                        <TableCell className="hidden lg:table-cell">{p.seller}</TableCell>
                        <TableCell className="text-right">{currency(p.price)}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{p.createdAt}</TableCell>
                        <TableCell className="whitespace-nowrap">{badge}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ----------------------------- Detail view ----------------------------- */
  return (
    <div className="max-w-6xl mx-auto space-y-4 border rounded-xl p-6 shadow-sm bg-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={backToList}
            className="p-2 cursor-pointer"
            aria-label="Quay lại danh sách duyệt bài"
            title="Quay lại danh sách duyệt bài"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Chi tiết duyệt bài</h2>
        </div>

        <div className="space-x-2">
          <Badge className="whitespace-nowrap" color={st === "approved" ? "green" : st === "rejected" ? "red" : "gray"}>
            {st === "approved" ? "Đã duyệt" : st === "rejected" ? "Đã từ chối" : "Đang chờ"}
          </Badge>

          {!disabled && (
            <>
              <Button
                className="cursor-pointer bg-green-600 hover:bg-green-700 text-white shadow-md"
                onClick={approve}
                title="Phê duyệt bài đăng"
              >
                Duyệt
              </Button>
              <Button
                onClick={reject}
                title="Từ chối bài đăng"
                className="cursor-pointer bg-red-600 text-white hover:bg-red-700 shadow-md"
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-2">
        <div className="flex gap-1">
          <TabBtn active={tab === "info"} onClick={() => setTab("info")} label="Bài đăng" />
          <TabDivider />
          <TabBtn active={tab === "images"} onClick={() => setTab("images")} label="Hình ảnh hàng hóa" />
          <TabDivider />
          <TabBtn active={tab === "docs"} onClick={() => setTab("docs")} label="Giấy tờ / Chứng từ" />
        </div>
      </div>

      {/* Tab panels – only show active */}
      {tab === "info" && (
        <div className="p-1 space-y-1">
          <p><strong>Mã:</strong> {detail.id}</p>
          <p><strong>Tiêu đề:</strong> {detail.title}</p>
          <p><strong>Người bán:</strong> {detail.seller.name}</p>
          <p><strong>Giá:</strong> {currency(detail.price)}</p>
          <p><strong>Danh mục:</strong> {detail.category}</p>
        </div>
      )}

      {tab === "images" && (
        <div className="p-1 grid grid-cols-2 md:grid-cols-3 gap-2">
          {detail.images.map((img, i) => (
            <img key={i} src={img} alt="Ảnh hàng hóa" className="rounded-lg border" />
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

/* ------------------------------- sub parts ------------------------------- */

function TabBtn({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm cursor-pointer rounded-t-md ${
        active
          ? "border border-b-white bg-white font-medium"
          : "text-slate-600 hover:bg-slate-50 border border-transparent"
      }`}
      title={label}
    >
      {label}
    </button>
  );
}
function TabDivider() {
  return <span aria-hidden className="mx-1 h-6 w-px bg-gray-200" />;
}
