// src/data/users.mock.jsx
// Seed dữ liệu user cho trang Quản lý User
// - Có sẵn 1 user bị cấm, 1 user bị hạn chế, 2 user đang hoạt động
// - Đảm bảo username tồn tại và là duy nhất

import { ensureUniqueUsernames, deriveUsername } from "../utils/text.jsx";

/**
 * Kiểu dữ liệu:
 * {
 *   id: string,
 *   name: string,
 *   email: string,
 *   phone?: string,
 *   username?: string,
 *   warns: number,
 *   status: "active" | "restricted" | "banned",
 *   restrictUntil?: string, // ISO
 *   bannedAt?: string,      // ISO
 *   reason?: string
 * }
 */
const RAW_USERS = [
  {
    id: "usr_001",
    name: "Ngô Kiên",
    email: "kien.ngo@example.com",
    phone: "0909000111",
    username: "kien.ngo",
    warns: 3,
    status: "banned",
    bannedAt: "2025-10-08T11:33:46+07:00",
    reason: "Gian lận giao dịch",
  },
  {
    id: "usr_002",
    name: "Trần Thị B",
    email: "b.tran@example.com",
    phone: "0912000222",
    username: "tran.thi.b",
    warns: 1,
    status: "restricted",
    restrictUntil: "2025-10-15T10:57:15+07:00",
    reason: "Spam tin",
  },
  {
    id: "usr_003",
    name: "Lâm C",
    email: "c.lam@example.com",
    phone: "0912000333",
    username: "lam.c",
    warns: 2,
    status: "active",
  },
  {
    id: "usr_005",
    name: "Nguyễn Văn A",
    email: "a.nguyen@example.com",
    phone: "0912333444",
    username: "nguyen.van.a",
    warns: 0,
    status: "active",
  },
];

/** Chuẩn hoá & đảm bảo username duy nhất */
export function seedUsers() {
  const prepared = RAW_USERS.map((u) => ({
    ...u,
    username: (u.username || deriveUsername(u.name)).trim(),
  }));
  return ensureUniqueUsernames(prepared);
}
