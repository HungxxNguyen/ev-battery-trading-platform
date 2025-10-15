// src/pages/Admin/AdminLayout.jsx
import React, { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Headphones,
  FileText,
  Settings,
  Building2,
  Users as UsersIcon,
  LogOut,
} from "lucide-react";
import { cn } from "../../utils/cn.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";

/**
 * AdminLayout
 * - Header cố định (top bar)
 * - Sidebar cố định (nav các trang con)
 * - Main nội dung render qua <Outlet />
 *
 * Các route con bạn đã thêm trong router:
 *  /admin                -> DashboardPage
 *  /admin/review         -> ReviewPage
 *  /admin/support        -> SupportPage
 *  /admin/plans          -> PlansPage
 *  /admin/settings       -> SettingsPage
 *  /admin/brands         -> BrandPage
 *  /admin/users          -> UsersModeration
 */

export default function AdminLayout() {
  const navigate = useNavigate();

  const nav = [
    {
      to: "/admin",
      label: "Dashboard",
      title: "Trang tổng quan",
      icon: <LayoutDashboard className="h-4 w-4" />,
      end: true, // quan trọng để /admin match đúng index
    },
    {
      to: "/admin/review",
      label: "Duyệt bài",
      title: "Quản lý bài đăng",
      icon: <ClipboardCheck className="h-4 w-4" />,
    },
    {
      to: "/admin/support",
      label: "Hỗ trợ",
      title: "Liên hệ & hỗ trợ",
      icon: <Headphones className="h-4 w-4" />,
    },
    {
      to: "/admin/plans",
      label: "Gói đăng bài",
      title: "Xem & chỉnh sửa các gói",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      to: "/admin/brands",
      label: "Hãng xe",
      title: "Quản lý hãng xe",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      to: "/admin/users",
      label: "Quản lý User",
      title: "Quản lý người dùng",
      icon: <UsersIcon className="h-4 w-4" />,
    },
    {
      to: "/admin/settings",
      label: "Tài Khoản",
      title: "Thông tin tài khoản",
      icon: <Settings className="h-4 w-4" />,
    },
  ];
  const { logout } = useContext(AuthContext);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 text-white shadow flex items-center px-4 z-40">
        {/* Logo (ẩn nếu lỗi) */}
        <img
          src="/logo.svg"
          alt="VoltX Exchange"
          className="h-8 w-auto mr-2"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold">VoltX Exchange Admin</span>
          <span className="text-xs text-white/70">
            Second-hand EV & Battery
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r fixed top-16 bottom-0 left-0 flex flex-col z-30">
        <nav className="px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.title}
              aria-label={item.title}
              className={({ isActive }) =>
                cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition cursor-pointer",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t">
          <button
            onClick={onLogout}
            title="Thoát khỏi hệ thống"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm hover:bg-gray-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 mt-16 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
