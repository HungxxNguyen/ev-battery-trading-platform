import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/Card/card.jsx";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/Table/table.jsx";
import { Button } from "../../components/Button/button.jsx";
import { Badge } from "../../components/Badge/badge.jsx";
import {
  AlertTriangle, Shield, UserX, Scissors, Check, Search, X, Info, Clock4,
} from "lucide-react";

import { clampDays } from "../../utils/daysValidation.jsx";
import { deriveUsername, ensureUniqueUsernames } from "../../utils/text.jsx";
import { seedUsers } from "../../constants/users";

/* --------------------------------- helpers -------------------------------- */
const LS_KEY = "voltx_user_mgmt_v1";

const STATUS = {
  ACTIVE: "active",
  RESTRICTED: "restricted",
  BANNED: "banned",
};

const FILTERS = [
  { key: "all", label: "Tất cả", color: "bg-sky-600 text-white hover:bg-sky-700" },
  { key: STATUS.ACTIVE, label: "Đang hoạt động", color: "bg-emerald-600 text-white hover:bg-emerald-700" },
  { key: STATUS.RESTRICTED, label: "Bị hạn chế", color: "bg-amber-600 text-white hover:bg-amber-700" },
  { key: STATUS.BANNED, label: "Bị cấm", color: "bg-red-600 text-white hover:bg-red-700" },
];

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${hh}:${mm}:${ss} ${dd}/${mo}/${yyyy}`;
  } catch {
    return iso || "";
  }
};

const badgeOfStatus = (u) => {
  if (u.status === STATUS.BANNED) {
    return <Badge color="red" className="font-medium">Bị cấm từ {formatTime(u.bannedAt)}</Badge>;
  }
  if (u.status === STATUS.RESTRICTED) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-100 text-amber-700 px-2 py-1 text-xs">
        Bị hạn chế đến&nbsp;
        <strong>{formatTime(u.restrictUntil)}</strong>
      </span>
    );
  }
  return <Badge color="green" className="font-medium">Đang hoạt động</Badge>;
};

/* ------------------------------- small modals ------------------------------ */
function Overlay({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/30 z-40"
      onClick={onClose}
      role="button"
      aria-label="Đóng"
      title="Đóng"
      style={{ cursor: "pointer" }}
    />
  );
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed z-50 inset-0 flex items-start justify-center p-4">
        <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-lg"}`}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-sky-600" />
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <button
              onClick={onClose}
              title="Đóng"
              aria-label="Đóng"
              className="p-2 rounded hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------ seed/persistence -------------------------- */
function loadUsers() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Bổ sung username & uniqueness nếu dữ liệu cũ thiếu chuẩn
      return ensureUniqueUsernames(
        parsed.map((u) => ({
          ...u,
          username: (u.username || deriveUsername(u.name || "user")).trim(),
        }))
      );
    }
  } catch (e) {
    console.warn("Failed to parse users from LS:", e);
  }
  return seedUsers();
}

/* ---------------------------------- page ---------------------------------- */
export default function UsersModeration() {
  const [users, setUsers] = React.useState(loadUsers);
  const [filter, setFilter] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState(new Set());

  // Modals
  const [detailUser, setDetailUser] = React.useState(null);
  const [actionModal, setActionModal] = React.useState(null); // { type: 'warn'|'restrict'|'ban', ids:Set }
  const [reason, setReason] = React.useState("");
  const [days, setDays] = React.useState(7);

  // Persist LS
  React.useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn("Failed to save users:", e);
    }
  }, [users]);

  // Auto-expire restriction each minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setUsers((prev) =>
        prev.map((u) => {
          if (u.status === STATUS.RESTRICTED && u.restrictUntil && new Date(u.restrictUntil).getTime() <= now) {
            return {
              ...u,
              status: STATUS.ACTIVE,
              restrictUntil: undefined,
              history: [
                ...(u.history || []),
                { ts: new Date().toISOString(), action: "auto_unrestrict", detail: "Hết hạn hạn chế" },
              ],
            };
          }
          return u;
        })
      );
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  /* ----------------------------- derived listing ----------------------------- */
  const filtered = React.useMemo(() => {
    const norm = (s) => (s || "").toLowerCase().trim();
    let arr = [...users];

    // search by username or email only
    if (q.trim()) {
      const nq = norm(q);
      arr = arr.filter((u) => norm(u.username).includes(nq) || norm(u.email).includes(nq));
    }

    if (filter !== "all") arr = arr.filter((u) => u.status === filter);

    return arr;
  }, [users, q, filter]);

  const resultCount = filtered.length;
  const selectedCount = filtered.filter((u) => selectedIds.has(u.id)).length;

  /* --------------------------------- select -------------------------------- */
  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      filtered.forEach((u) => n.add(u.id));
      return n;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  /* ------------------------------ open modals ------------------------------- */
  const openWarn = () => {
    const ids = new Set(filtered.filter((u) => selectedIds.has(u.id)).map((u) => u.id));
    if (ids.size === 0) return alert("Vui lòng chọn ít nhất một user.");
    setActionModal({ type: "warn", ids });
    setReason("");
  };

  const openRestrict = () => {
    const ids = new Set(filtered.filter((u) => selectedIds.has(u.id)).map((u) => u.id));
    if (ids.size === 0) return alert("Vui lòng chọn ít nhất một user.");
    setActionModal({ type: "restrict", ids });
    setReason("");
    setDays(7);
  };

  const openBan = () => {
    const ids = new Set(filtered.filter((u) => selectedIds.has(u.id)).map((u) => u.id));
    if (ids.size === 0) return alert("Vui lòng chọn ít nhất một user.");
    setActionModal({ type: "ban", ids });
    setReason("");
  };

  /* -------------------------------- actions -------------------------------- */
  const doWarn = () => {
    const ids = actionModal?.ids || new Set();
    let skippedBanned = 0;

    setUsers((prev) =>
      prev.map((u) => {
        if (!ids.has(u.id)) return u;
        if (u.status === STATUS.BANNED) {
          skippedBanned += 1;
          return u;
        }
        return {
          ...u,
          warns: (u.warns || 0) + 1,
          history: [...(u.history || []), { ts: new Date().toISOString(), action: "warn", detail: reason || "Cảnh cáo" }],
        };
      })
    );

    if (skippedBanned) {
      alert(`Đã bỏ qua ${skippedBanned} user đang bị cấm. Chỉ áp dụng cho user không bị cấm.`);
    }
    setActionModal(null);
  };

  const doRestrict = () => {
    const ids = actionModal?.ids || new Set();
    const d = clampDays(days, 1, 30);

    let skipRestricted = 0;
    let skipBanned = 0;
    let applied = 0;

    setUsers((prev) =>
      prev.map((u) => {
        if (!ids.has(u.id)) return u;
        if (u.status === STATUS.BANNED) {
          skipBanned += 1;
          return u;
        }
        if (u.status !== STATUS.ACTIVE) {
          skipRestricted += 1;
          return u;
        }
        applied += 1;
        const until = new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();
        return {
          ...u,
          status: STATUS.RESTRICTED,
          restrictUntil: until,
          history: [
            ...(u.history || []),
            { ts: new Date().toISOString(), action: "restrict", detail: `${d} ngày${reason ? ` - ${reason}` : ""}` },
          ],
        };
      })
    );

    if (applied === 0) {
      alert(
        `Không thể hạn chế ${skipRestricted} user không ở trạng thái hoạt động và ${skipBanned} user đang bị cấm. Chỉ áp dụng cho user đang hoạt động.`
      );
    } else {
      let msg = `Đã hạn chế ${applied} user trong ${d} ngày.`;
      if (skipRestricted || skipBanned) {
        msg += ` Bỏ qua ${skipRestricted} user không ở trạng thái hoạt động và ${skipBanned} user đang bị cấm.`;
      }
      alert(msg);
    }

    setActionModal(null);
  };

  const doBan = () => {
    const ids = actionModal?.ids || new Set();

    let skippedBanned = 0;
    let applied = 0;

    setUsers((prev) =>
      prev.map((u) => {
        if (!ids.has(u.id)) return u;
        if (u.status === STATUS.BANNED) {
          skippedBanned += 1;
          return u;
        }
        applied += 1;
        return {
          ...u,
          status: STATUS.BANNED,
          bannedAt: new Date().toISOString(),
          restrictUntil: undefined,
          history: [...(u.history || []), { ts: new Date().toISOString(), action: "ban", detail: reason || "Vi phạm" }],
        };
      })
    );

    if (applied === 0) {
      alert(`Không thể cấm ${skippedBanned} user đã bị cấm.`);
    } else {
      alert(`Đã cấm ${applied} user.${skippedBanned ? ` Bỏ qua ${skippedBanned} user đã bị cấm.` : ""}`);
    }
    setActionModal(null);
  };

  const unbanSelected = () => {
    const ids = new Set(filtered.filter((u) => selectedIds.has(u.id)).map((u) => u.id));
    if (ids.size === 0) return alert("Vui lòng chọn ít nhất một user.");
    let applied = 0;
    let skipped = 0;

    setUsers((prev) =>
      prev.map((u) => {
        if (!ids.has(u.id)) return u;
        if (u.status !== STATUS.BANNED) {
          skipped += 1;
          return u;
        }
        applied += 1;
        return {
          ...u,
          status: STATUS.ACTIVE,
          bannedAt: undefined,
          history: [...(u.history || []), { ts: new Date().toISOString(), action: "unban", detail: "Bỏ cấm" }],
        };
      })
    );

    if (applied === 0) {
      alert(`Không thể bỏ cấm ${skipped} user không ở trạng thái bị cấm.`);
    } else {
      alert(`Đã bỏ cấm ${applied} user.${skipped ? ` Bỏ qua ${skipped} user không ở trạng thái bị cấm.` : ""}`);
    }
  };

  const unrestrictSelected = () => {
    const ids = new Set(filtered.filter((u) => selectedIds.has(u.id)).map((u) => u.id));
    if (ids.size === 0) return alert("Vui lòng chọn ít nhất một user.");
    let applied = 0;
    let skipActive = 0;
    let skipBanned = 0;

    setUsers((prev) =>
      prev.map((u) => {
        if (!ids.has(u.id)) return u;
        if (u.status === STATUS.BANNED) {
          skipBanned += 1;
          return u;
        }
        if (u.status !== STATUS.RESTRICTED) {
          skipActive += 1;
          return u;
        }
        applied += 1;
        return {
          ...u,
          status: STATUS.ACTIVE,
          restrictUntil: undefined,
          history: [...(u.history || []), { ts: new Date().toISOString(), action: "unrestrict", detail: "Gỡ hạn chế" }],
        };
      })
    );

    if (applied === 0) {
      alert(
        `Không thể gỡ hạn chế ${skipActive} user không bị hạn chế và ${skipBanned} user đang bị cấm. Chỉ áp dụng cho user đang bị hạn chế.`
      );
    } else {
      let msg = `Đã gỡ hạn chế ${applied} user.`;
      if (skipActive || skipBanned) {
        msg += ` Bỏ qua ${skipActive} user không bị hạn chế và ${skipBanned} user đang bị cấm.`;
      }
      alert(msg);
    }
  };

  /* ---------------------------------- UI ----------------------------------- */
  const headerButtons = (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={openWarn}
        title="Gửi cảnh cáo đến các user được chọn"
        className="bg-amber-600 text-white hover:bg-amber-700"
      >
        <AlertTriangle className="h-4 w-4" />
        Cảnh cáo
      </Button>

      <Button
        onClick={openRestrict}
        title="Hạn chế user đang hoạt động (1–30 ngày)"
        className="bg-sky-600 text-white hover:bg-sky-700"
      >
        <Shield className="h-4 w-4" />
        Hạn chế
      </Button>

      <Button
        onClick={openBan}
        title="Cấm vĩnh viễn (bỏ qua user đã bị cấm)"
        className="bg-red-600 text-white hover:bg-red-700"
      >
        <UserX className="h-4 w-4" />
        Cấm
      </Button>

      <Button
        onClick={unbanSelected}
        title="Bỏ cấm: chỉ áp dụng cho user đang bị cấm"
        className="bg-emerald-600 text-white hover:bg-emerald-700"
      >
        <Check className="h-4 w-4" />
        Bỏ cấm
      </Button>

      <Button
        onClick={unrestrictSelected}
        title="Gỡ hạn chế: chỉ áp dụng cho user đang bị hạn chế"
        className="bg-emerald-500 text-white hover:bg-emerald-600"
      >
        <Scissors className="h-4 w-4" />
        Gỡ hạn chế
      </Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Filter + Search */}
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Danh sách user</CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                title={`Lọc: ${f.label}`}
                className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${filter === f.key ? f.color : "border text-gray-700 bg-white hover:bg-gray-50"}`}
              >
                {f.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo username, email…"
                  className="pl-8 pr-3 py-2 rounded-lg border focus:outline-none focus:ring w-72"
                />
              </div>
              <span className="text-sm text-gray-500">
                <strong>KẾT QUẢ:</strong> {resultCount}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {headerButtons}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">Đã chọn: {selectedCount}</span>
              <button
                onClick={selectAllVisible}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                title="Chọn tất cả kết quả đang hiển thị"
              >
                Chọn tất cả
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                title="Bỏ chọn toàn bộ"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>USERNAME</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead className="w-24 text-center">CẢNH CÁO</TableHead>
                <TableHead className="w-56">TRẠNG THÁI</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((u) => {
                const selected = selectedIds.has(u.id);
                return (
                  <TableRow
                    key={u.id}
                    className={`${selected ? "bg-blue-50" : ""}`}
                    title={selected ? "Đang được chọn" : "Chọn dòng này"}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(u.id)}
                        className="cursor-pointer"
                        title={selected ? "Bỏ chọn" : "Chọn dòng"}
                      />
                    </TableCell>

                    <TableCell>
                      <button
                        className="font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                        onClick={() => setDetailUser(u)}
                        title="Xem thông tin user"
                      >
                        @{u.username}
                      </button>
                    </TableCell>

                    <TableCell>{u.email}</TableCell>

                    <TableCell className="text-center">{u.warns || 0}</TableCell>

                    <TableCell>{badgeOfStatus(u)}</TableCell>
                  </TableRow>
                );
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal chi tiết user */}
      {detailUser && (
        <Modal wide title="Thông tin User" onClose={() => setDetailUser(null)}>
          <div className="space-y-2">
            <p className="text-lg font-semibold">{detailUser.name}</p>
            <p><strong>ID:</strong> {detailUser.id}</p>
            <p><strong>Email:</strong> {detailUser.email}</p>
            {detailUser.phone && <p><strong>SĐT:</strong> {detailUser.phone}</p>}
            <p><strong>Username:</strong> @{detailUser.username}</p>
            <p><strong>Cảnh cáo:</strong> {detailUser.warns || 0}</p>
            <p><strong>Trạng thái:</strong> {badgeOfStatus(detailUser)}</p>

            <div className="mt-3">
              <p className="font-medium mb-2">Lịch sử xử lý</p>
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                  <div>Thời gian</div>
                  <div>Hành động</div>
                  <div>Chi tiết</div>
                </div>
                <div className="divide-y">
                  {(detailUser.history || []).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">— Không có —</div>
                  )}
                  {(detailUser.history || []).map((h, idx) => (
                    <div key={idx} className="grid grid-cols-3 px-3 py-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock4 className="h-3.5 w-3.5 text-gray-500" />
                        {formatTime(h.ts)}
                      </div>
                      <div>{h.action}</div>
                      <div>{h.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button onClick={() => setDetailUser(null)} title="Đóng" className="bg-gray-800 text-white hover:bg-gray-900">
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal hành động: warn / restrict / ban */}
      {actionModal?.type && (
        <Modal
          title={
            actionModal.type === "warn"
              ? "Gửi cảnh cáo"
              : actionModal.type === "restrict"
              ? "Hạn chế người dùng"
              : "Cấm người dùng"
          }
          onClose={() => setActionModal(null)}
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Áp dụng cho <strong>{actionModal.ids.size}</strong> user đã chọn.
            </p>

            {actionModal.type !== "warn" && (
              <div className="rounded bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 text-sm">
                Lưu ý: user <strong>bị cấm</strong> sẽ bị <strong>bỏ qua</strong>. Hạn chế chỉ áp dụng cho user{" "}
                <strong>đang hoạt động</strong>.
              </div>
            )}

            {actionModal.type === "restrict" && (
              <div>
                <label className="text-sm">Số ngày (1–30)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(clampDays(e.target.value, 1, 30))}
                  className="mt-1 w-28 border rounded-lg px-3 py-2"
                />
              </div>
            )}

            <div>
              <label className="text-sm">Lý do (tùy chọn)</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Nhập lý do…"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setActionModal(null)} title="Hủy" className="bg-red-600 text-white hover:bg-red-700">
                Hủy
              </Button>

              {actionModal.type === "warn" && (
                <Button onClick={doWarn} title="Xác nhận cảnh cáo" className="bg-amber-600 text-white hover:bg-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Cảnh cáo
                </Button>
              )}

              {actionModal.type === "restrict" && (
                <Button onClick={doRestrict} title="Xác nhận hạn chế" className="bg-sky-600 text-white hover:bg-sky-700">
                  <Shield className="h-4 w-4" />
                  Hạn chế
                </Button>
              )}

              {actionModal.type === "ban" && (
                <Button onClick={doBan} title="Xác nhận cấm" className="bg-red-600 text-white hover:bg-red-700">
                  <UserX className="h-4 w-4" />
                  Cấm
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
