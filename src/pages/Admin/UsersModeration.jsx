// ===============================
// File: src/pages/Admin/UsersModeration.jsx
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
import { Badge } from "../../components/Badge/badge";

const GLASS_CARD5 =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl text-slate-100";

const seedUsers = [
  {
    id: "usr_001",
    name: "Nguyễn Văn A",
    email: "a@example.com",
    reports: 2,
    status: "normal",
  },
  {
    id: "usr_002",
    name: "Trần Thị B",
    email: "b@example.com",
    reports: 5,
    status: "warned",
  },
  {
    id: "usr_003",
    name: "Phạm C",
    email: "c@example.com",
    reports: 9,
    status: "banned",
  },
];

export default function UsersModeration() {
  const [users, setUsers] = useState(seedUsers);

  const setStatus = (id, status) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  const warn = (id) => setStatus(id, "warned");
  const ban = (id) => setStatus(id, "banned");
  const unban = (id) => setStatus(id, "normal");

  return (
    <div className="mx-auto max-w-6xl">
      <Card className={GLASS_CARD5}>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Moderation người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="text-slate-200">
            <TableHeader className="bg-slate-900/40 border-b border-slate-800/60 [&_th]:text-slate-300">
              <TableRow>
                <TableHead className="w-[120px]">Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Reports</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:last-child]:border-0">
              {users.map((u) => (
                <TableRow
                  key={u.id}
                  className="border-b border-slate-800/60 bg-slate-900/35 transition-colors hover:bg-slate-800/60"
                >
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="text-center">{u.reports}</TableCell>
                  <TableCell>
                    {u.status === "normal" && (
                      <Badge className="bg-emerald-500/80 text-white">
                        Bình thường
                      </Badge>
                    )}
                    {u.status === "warned" && (
                      <Badge className="bg-amber-500/80 text-white">
                        Cảnh cáo
                      </Badge>
                    )}
                    {u.status === "banned" && (
                      <Badge className="bg-rose-500/80 text-white">Cấm</Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => warn(u.id)}
                      className="rounded-lg bg-amber-500/80 text-white hover:bg-amber-500"
                    >
                      Warn
                    </Button>
                    <Button
                      onClick={() => ban(u.id)}
                      className="rounded-lg bg-rose-500/80 text-white hover:bg-rose-500"
                    >
                      Ban
                    </Button>
                    <Button
                      onClick={() => unban(u.id)}
                      className="rounded-lg bg-slate-700/80 text-white hover:bg-slate-700"
                    >
                      Unban
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
