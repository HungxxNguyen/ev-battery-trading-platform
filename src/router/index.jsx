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
        </Routes>
      </AnimatePresence>
    </Router>
  );
};
export default AppRouter;
