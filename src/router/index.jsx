// src/routes/AppRouter.jsx
import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import userService from "../services/apis/userApi";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";

// Pages...
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import AddListing from "../pages/AddListing/AddListing";
import ManageListing from "../pages/ManageListing/ManageListing";
import ManageDetail from "../pages/ManageDetail/ManageDetail";
import UpdateListing from "../pages/UpdateListing/UpdateListing";
import ListingDetail from "../pages/ListingDetail/ListingDetail";
import Category from "../pages/Category/Category";
import Search from "../pages/Search/Search";
import Listings from "../pages/Listings/Listings";
import Chat from "../pages/Chat/Chat";
import Favorites from "../pages/Favorites/Favorites";
import ForgetPassword from "../pages/ForgetPassword/ForgetPassword";
import VerifyOtp from "../pages/VerifyOtp/VerifyOtp";
import About from "../pages/About/About";
import ProfileTab from "../pages/Profile/ProfileTab";
import Transaction from "../pages/Transaction/Transaction";
import Forbidden from "../pages/Forbidden/Forbidden";
import PaymentFailed from "../pages/PaymentStatus/PaymentFailed.jsx";
import PaymentSuccess from "../pages/PaymentStatus/PaymentSuccess.jsx";

// Admin pages
import AdminLayout from "../pages/Admin/AdminLayout.jsx";
import DashboardPage from "../pages/Admin/DashboardPage.jsx";
import PlansPage from "../pages/Admin/PlansPage.jsx";
import BrandPage from "../pages/Admin/BrandPage.jsx";

// Staff pages
import StaffLayout from "../pages/Staff/StaffLayout.jsx";
import StaffReview from "../pages/Staff/StaffReview.jsx";
import StaffReports from "../pages/Staff/StaffReports.jsx";

// Guards
import ProtectedRoute from "./ProtectedRoute";

// Global guard: runs on all routes (public + protected).
// If authenticated and server says status = Inactive, force logout.
const GlobalAuthGuard = () => {
  const { isAuthenticated, logout, loading } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!isAuthenticated || loading) return;
      try {
        const resp = await userService.getCurrentUser();
        const status = resp?.success ? resp?.data?.data?.status : null;
        if (
          !cancelled &&
          typeof status === "string" &&
          status.toLowerCase() === "inactive"
        ) {
          logout();
        }
      } catch (_) {
        // no-op for guard failures
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loading, location.pathname, logout]);

  return null;
};

// Component xử lý vào trang đúng theo role
const RoleBasedHome = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const role = localStorage.getItem("role");

  if (isAuthenticated && role === "Admin") {
    // Admin vào lại trang web -> nhảy thẳng vào admin dashboard
    return <Navigate to="/admin" replace />;
  }

  if (isAuthenticated && role === "Staff") {
    // Staff vào lại -> nhảy thẳng vào trang staff (ví dụ review)
    return <Navigate to="/staff/review" replace />;
  }

  // User thường hoặc chưa đăng nhập -> vẫn vào Home như cũ
  return <Home />;
};

const AppRouter = () => {
  return (
    <Router>
      <GlobalAuthGuard />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public */}
          {/* ⬇️ đổi Home thành RoleBasedHome */}
          <Route path="/" element={<RoleBasedHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search/:keyword" element={<Search />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/about" element={<About />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />

          {/* Staff-only*/}
          <Route element={<ProtectedRoute allowedRoles={["Staff"]} />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route path="review" element={<StaffReview />} />
              <Route path="reports" element={<StaffReports />} />
            </Route>
          </Route>

          {/* User-authenticated (không yêu cầu role cụ thể) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/add-listing" element={<AddListing />} />
            <Route path="/update-listing/:id" element={<UpdateListing />} />
            <Route path="/manage-listing" element={<ManageListing />} />
            <Route path="/manage-listing/:id" element={<ManageDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<ProfileTab />} />
            <Route path="/transactions" element={<Transaction />} />
          </Route>

          {/* Admin-only */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="brands" element={<BrandPage />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default AppRouter;
