// src/routes/AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Payment from "../pages/Payment/Payment";
import Chat from "../pages/Chat/Chat";
import Favorites from "../pages/Favorites/Favorites";
import Notifications from "../pages/Notifications/Notifications";
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
import ReviewPage from "../pages/Admin/ReviewPage.jsx";
import SupportPage from "../pages/Admin/SupportPage.jsx";
import PlansPage from "../pages/Admin/PlansPage.jsx";
import BrandPage from "../pages/Admin/BrandPage.jsx";
import UsersModeration from "../pages/Admin/UsersModeration.jsx";

// Guards
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search/:keyword" element={<Search />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/about" element={<About />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />

          {/* User-authenticated (không yêu cầu role cụ thể) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/add-listing" element={<AddListing />} />
            <Route path="/update-listing/:id" element={<UpdateListing />} />
            <Route path="/manage-listing" element={<ManageListing />} />
            <Route path="/manage-listing/:id" element={<ManageDetail />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<ProfileTab />} />
            <Route path="/transactions" element={<Transaction />} />
          </Route>

          {/* Admin-only */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="brands" element={<BrandPage />} />
              <Route path="users" element={<UsersModeration />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default AppRouter;
