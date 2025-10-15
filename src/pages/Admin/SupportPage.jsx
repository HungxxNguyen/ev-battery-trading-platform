import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/Table/table";
import { Badge } from "../../components/Badge/badge";
import { Button } from "../../components/Button/button";
import { ArrowLeft } from "lucide-react";
import { allTickets } from "../../constants/tickets";

export default function SupportPage() {
  const [tickets, setTickets] = useState(allTickets);
  const [messagesByTicket, setMessagesByTicket] = useState({});
  const [input, setInput] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const ticket = useMemo(() => tickets.find((t) => t.id === selectedId), [tickets, selectedId]);
  const isClosed = ticket?.status === "closed";

  useEffect(() => {
    if (selectedId && !ticket) setSelectedId(null);
  }, [selectedId, ticket]);

  const appendMessage = (text) => {
    if (isClosed || !ticket) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const seedMsgs = [
      { author: "User", text: `Xin chào, tôi gặp sự cố khi ${ticket.subject.toLowerCase()}.`, ts: Date.now() - 60_000 },
      { author: "Admin", text: "Chào bạn, vui lòng mô tả chi tiết để mình kiểm tra nhé.", ts: Date.now() - 30_000 },
    ];
    setMessagesByTicket((prev) => {
      const prevMsgs = prev[ticket.id] ?? seedMsgs;
      return { ...prev, [ticket.id]: [...prevMsgs, { author: "Admin", text: trimmed, ts: Date.now() }] };
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
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, status: "closed" } : t)));
    setSelectedId(null);
  };

  if (!selectedId) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Danh sách ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Mã</TableHead>
                  <TableHead>Chủ đề</TableHead>
                  <TableHead className="hidden md:table-cell">Người dùng</TableHead>
                  <TableHead className="hidden lg:table-cell">Tag</TableHead>
                  <TableHead className="hidden md:table-cell">SLA</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setSelectedId(t.id)}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="font-medium underline text-primary">{t.subject}</TableCell>
                    <TableCell className="hidden md:table-cell">{t.user}</TableCell>
                    <TableCell className="hidden lg:table-cell uppercase">{t.tag}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{t.status === "open" ? t.sla || "—" : "—"}</TableCell>
                    <TableCell>
                      {t.status === "open" ? <Badge className="bg-amber-100 text-amber-700">Đang mở</Badge> : <Badge className="bg-green-500 text-white">Đã xử lý</Badge>}
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
    { author: "User", text: `Xin chào, tôi gặp sự cố khi ${ticket.subject.toLowerCase()}.`, ts: Date.now() - 60_000 },
    { author: "Admin", text: "Chào bạn, vui lòng mô tả chi tiết để mình kiểm tra nhé.", ts: Date.now() - 30_000 },
  ];
  const msgs = messagesByTicket[ticket.id] ?? seedMsgs;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setSelectedId(null)} className="p-2 cursor-pointer" aria-label="Quay lại" title="Quay lại">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Chat hỗ trợ khách hàng</h2>
        </div>
        {ticket?.status !== "closed" && (
          <Button onClick={markDone} className="cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2.5 text-base shadow-md" title="Đánh dấu ticket đã xử lý">
            Kết Thúc
          </Button>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>{ticket.subject}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Khách hàng: <span className="font-medium text-foreground">{ticket.user}</span> • {ticket.status === "open" ? `SLA còn lại: ${ticket.sla}` : "Đã xử lý"}
          </p>

          <div id="chat-scroll" className="border rounded-lg p-3 h-64 overflow-y-auto bg-muted/30 text-sm">
            {msgs.map((m, i) => (
              <p key={i} className={m.author === "Admin" ? "text-right" : ""}>
                <strong>{m.author === "Admin" ? "Admin" : ticket.user}:</strong> {m.text}
              </p>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={ticket.status === "closed" ? "Ticket đã xử lý - không thể gửi thêm" : "Nhập tin nhắn..."}
              className={`flex-1 border rounded-lg px-3 py-2 text-sm ${ticket.status === "closed" ? "bg-muted cursor-not-allowed opacity-60" : ""}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={ticket.status === "closed"}
            />
            <Button title="Gửi tin nhắn" onClick={() => appendMessage(input)} disabled={ticket.status === "closed"}
              className="cursor-pointer px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Gửi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
