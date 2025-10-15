import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card/card";
import { Button } from "../../components/Button/button";
import { initialAdminAccount } from "../../constants/admin";
import { normalizePhone, formatPhone } from "../../utils/phone";

export default function SettingsPage() {
  const [profile, setProfile] = useState(initialAdminAccount);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);

  const startEdit = () => {
    setForm((prev) => ({ ...prev, phone: normalizePhone(prev.phone), role: "Admin" }));
    setEditing(true);
  };
  const cancelEdit = () => { setForm(profile); setEditing(false); };
  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return;
    if (form.phone.length !== 10) { alert("SĐT phải có đúng 10 chữ số theo định dạng 4-3-3!"); return; }
    setProfile({ ...form, phone: form.phone });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold">Cấu hình hệ thống</h2>
      <Card>
        <CardHeader><CardTitle>Thông tin tài khoản Admin</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {!editing ? (
            <>
              <p><strong>Tên:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>SĐT:</strong> {profile.phone}</p>
              <p><strong>Vai trò:</strong> {profile.role}</p>
              <Button className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 cursor-pointer" title="Chỉnh sửa" onClick={startEdit}>
                Cập nhật thông tin
              </Button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Tên</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên" />
                </div>
                <div>
                  <label className="text-sm">Email</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@voltx.vn" />
                </div>
                <div>
                  <p><span className="text-sm font-medium">SĐT:</span> {formatPhone(form.phone || "")}</p>
                  <input
                    type="text" inputMode="numeric" autoComplete="tel" value={formatPhone(form.phone)}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: normalizePhone(e.target.value) }))}
                    placeholder="0333 031 583"
                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Định dạng: 4-3-3 (10 số). Ví dụ: 0333 031 583</p>
                </div>
                <div>
                  <label className="text-sm">Vai trò</label>
                  <input type="text" value="Admin" readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed" />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button onClick={handleSave} title="Lưu" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Lưu</Button>
                <Button variant="destructive" onClick={cancelEdit} title="Hủy" className="text-white px-4 py-2 rounded-lg">Hủy</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
