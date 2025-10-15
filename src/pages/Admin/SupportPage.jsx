// ===============================
// File: src/pages/Admin/SupportPage.jsx
// ===============================
import React, { useMemo, useState, useEffect } from "react";
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
import { ArrowLeft } from "lucide-react";

const GLASS_CARD3 =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";
const allTickets = [
  {
    id: "tkt_101",
    subject: "Không thanh toán được gói Pro",
    user: "Hoàng V.",
    tag: "billing",
    sla: "1h còn lại",
    status: "open",
  },
  {
    id: "tkt_102",
    subject: "Bài bị từ chối nhưng thiếu lý do",
    user: "Thu T.",
    tag: "moderation",
    sla: "3h còn lại",
    status: "open",
  },
  {
    id: "tkt_090",
    subject: "Không nhận được email kích hoạt",
    user: "Minh K.",
    tag: "account",
    status: "closed",
  },
  {
    id: "tkt_045",
    subject: "Lỗi upload hình ảnh",
    user: "Lan P.",
    tag: "bug",
    status: "closed",
  },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState(allTickets);
  const [selectedId, setSelectedId] = useState(null);
  const [messagesByTicket, setMessagesByTicket] = useState({});
  const [input, setInput] = useState("");

  const ticket = useMemo(
    () => tickets.find((t) => t.id === selectedId),
    [tickets, selectedId]
  );
  const isClosed = ticket?.status === "closed";

  useEffect(() => {
    if (selectedId && !ticket) setSelectedId(null);
  }, [selectedId, ticket]);

  const appendMessage = (text) => {
    if (isClosed || !ticket) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const seedMsgs = [
      {
        author: "User",
        text: `Xin chào, tôi gặp sự cố khi ${ticket.subject.toLowerCase()}.`,
        ts: Date.now() - 60_000,
      },
      {
        author: "Admin",
        text: "Chào bạn, vui lòng mô tả chi tiết để mình kiểm tra nhé.",
        ts: Date.now() - 30_000,
      },
    ];
    setMessagesByTicket((prev) => {
      const prevMsgs = prev[ticket.id] ?? seedMsgs;
      return {
        ...prev,
        [ticket.id]: [
          ...prevMsgs,
          { author: "Admin", text: trimmed, ts: Date.now() },
        ],
      };
    });
    setInput("");
    setTimeout(() => {
      const el = document.getElementById("chat-scroll");
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      appendMessage(input);
    }
  };

  const markDone = () => {
    if (!ticket) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, status: "closed" } : t))
    );
    setSelectedId(null);
  };

  if (!selectedId) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 text-slate-100">
        <Card className={GLASS_CARD3}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Danh sách ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="text-slate-200">
              <TableHeader className="bg-slate-900/40 border-b border-slate-800/60 [&_th]:text-slate-300">
                <TableRow>
                  <TableHead className="w-[120px]">Mã</TableHead>
                  <TableHead>Chủ đề</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Người dùng
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Tag</TableHead>
                  <TableHead className="hidden md:table-cell">SLA</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-0">
                {tickets.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer border-b border-slate-800/60 bg-slate-900/35 transition-colors hover:bg-slate-800/60"
                    onClick={() => setSelectedId(t.id)}
                    title="Mở ticket để chat"
                  >
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="font-medium underline text-primary">
                      {t.subject}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {t.user}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell uppercase">
                      {t.tag}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-slate-400">
                      {t.status === "open" ? t.sla || "—" : "—"}
                    </TableCell>
                    <TableCell>
                      {t.status === "open" ? (
                        <Badge className="border border-amber-500/30 bg-amber-400/20 text-amber-200">
                          Đang mở
                        </Badge>
                      ) : (
                        <Badge className="border border-emerald-500/30 bg-emerald-400/20 text-emerald-200">
                          Đã xử lý
                        </Badge>
                      )}
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

  const seedMsgs = [
    {
      author: "User",
      text: `Xin chào, tôi gặp sự cố khi ${ticket.subject.toLowerCase()}.`,
      ts: Date.now() - 60_000,
    },
    {
      author: "Admin",
      text: "Chào bạn, vui lòng mô tả chi tiết để mình kiểm tra nhé.",
      ts: Date.now() - 30_000,
    },
  ];
  const msgs = messagesByTicket[ticket.id] ?? seedMsgs;

  return (
    <div className="mx-auto max-w-6xl space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setSelectedId(null)}
            className="cursor-pointer rounded-full border border-slate-700/50 bg-slate-900/40 p-2 text-slate-100 hover:bg-slate-800/60"
            aria-label="Quay lại danh sách ticket"
            title="Quay lại danh sách ticket"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-white">
            Chat hỗ trợ khách hàng
          </h2>
        </div>
        {!isClosed && (
          <Button
            onClick={markDone}
            className="cursor-pointer rounded-xl bg-emerald-500/90 px-6 py-2.5 text-base text-white hover:bg-emerald-500"
            title="Đánh dấu ticket đã xử lý"
          >
            Kết Thúc
          </Button>
        )}
      </div>

      <Card className={GLASS_CARD3}>
        <CardHeader>
          <CardTitle>{ticket.subject}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-300">
            Khách hàng:{" "}
            <span className="font-medium text-slate-100">{ticket.user}</span> •{" "}
            {ticket.status === "open"
              ? `SLA còn lại: ${ticket.sla}`
              : "Đã xử lý"}
          </p>
          <div
            id="chat-scroll"
            className="border border-slate-800/60 rounded-xl bg-slate-900/40 p-3 h-64 overflow-y-auto text-sm"
          >
            {msgs.map((m, i) => (
              <p key={i} className={m.author === "Admin" ? "text-right" : ""}>
                <strong>{m.author === "Admin" ? "Admin" : ticket.user}:</strong>{" "}
                {m.text}
              </p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={
                isClosed
                  ? "Ticket đã xử lý - không thể gửi thêm"
                  : "Nhập tin nhắn..."
              }
              className={`flex-1 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                isClosed ? "cursor-not-allowed opacity-60" : ""
              }`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={isClosed}
            />
            <Button
              title="Gửi tin nhắn"
              onClick={() => appendMessage(input)}
              disabled={isClosed}
              className={`cursor-pointer rounded-lg bg-cyan-500/90 px-4 py-2 font-medium text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                isClosed ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Gửi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
