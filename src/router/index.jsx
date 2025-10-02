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

const AppRouter = () => {
  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/manage-listing" element={<ManageListing />} />
          <Route path="/manage-listing/:id" element={<ManageDetail />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<ProfileTab />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
};
export default AppRouter;
