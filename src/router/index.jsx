import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";

// ==================== Pages ====================
// Public pages
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import AddListing from "../pages/AddListing/AddListing";
import ManageListing from "../pages/ManageListing/ManageListing";
import ManageDetail from "../pages/ManageDetail/ManageDetail";
import ListingDetail from "../pages/ListingDetail/ListingDetail";
import Category from "../pages/Category/Category";
import Payment from "../pages/Payment/Payment";
import Chat from "../pages/Chat/Chat";
import Favorites from "../pages/Favorites/Favorites";
import Notifications from "../pages/Notifications/Notifications";
import ForgetPassword from "../pages/ForgetPassword/ForgetPassword";
import VerifyOtp from "../pages/VerifyOtp/VerifyOtp";
import About from "../pages/About/About";
import ProfileTab from "../pages/Profile/ProfileTab";
import Transaction from "../pages/Transaction/Transaction";
import Admin from "../pages/Admin/Admin";
import Forbidden from "../pages/Forbidden/Forbidden";

// ==================== Routes ====================
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/add-listing"
            element={
              <ProtectedRoute>
                <AddListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-listing"
            element={
              <ProtectedRoute>
                <ManageListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-listing/:id"
            element={
              <ProtectedRoute>
                <ManageDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileTab />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/forbidden" element={<Forbidden />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
};
export default AppRouter;
