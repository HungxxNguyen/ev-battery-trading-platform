// ===============================
// File: src/pages/Admin/AdminLayout.jsx
// ===============================
import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/Button/button";
import logo3 from "../../assets/logo3.png";
import {
  LayoutDashboard,
  ClipboardCheck,
  Headphones,
  FileText,
  Users,
  Building2,
  LogOut,
  Flag,
} from "lucide-react";
import DashboardPage from "./DashboardPage";
import PlansPage from "./PlansPage";
import BrandPage from "./BrandPage";
import { AuthContext } from "../../contexts/AuthContext";

const GLASS_PANEL =
  "bg-slate-900/40 border border-slate-800/60 backdrop-blur-2xl";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  // Xác định trang hiện tại theo URL: /admin/:tab
  const currentPage = (() => {
    const seg = location.pathname.split("/")[2] || "";
    return seg === "" ? "dashboard" : seg;
  })();

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 ${GLASS_PANEL}`}>
        <div className="flex h-full flex-col px-6 py-8">
          <div className="mb-8 flex items-center gap-3">
            <img src={logo3} alt="VoltX" className="h-10 w-auto" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/80">
                VoltX Control
              </p>
              <h1 className="text-lg font-semibold text-white leading-tight">
                Admin Panel
              </h1>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
            <SideItem
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              active={currentPage === "dashboard"}
              onClick={() => navigate("/admin")}
            />

            <SideItem
              icon={<FileText className="h-4 w-4" />}
              label="Plans"
              active={currentPage === "plans"}
              onClick={() => navigate("/admin/plans")}
            />
            <SideItem
              icon={<Building2 className="h-4 w-4" />}
              label="Brands"
              active={currentPage === "brands"}
              onClick={() => navigate("/admin/brands")}
            />
          </nav>

          <div className="mt-8 border-t border-slate-800/60 pt-6">
            <Button
              onClick={handleLogout}
              className="w-full justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500/80 to-red-500/80 text-white hover:from-rose-500 hover:to-red-400 cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-72 min-h-screen overflow-y-auto px-10 pb-12 pt-24">
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "plans" && <PlansPage />}
        {currentPage === "brands" && <BrandPage />}
      </main>
    </div>
  );
}

function SideItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
        active
          ? "bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white ring-1 ring-slate-700/40"
          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          active
            ? "bg-slate-800/60 text-white"
            : "bg-slate-900/40 text-cyan-200/70 group-hover:bg-slate-800/60 group-hover:text-white"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
