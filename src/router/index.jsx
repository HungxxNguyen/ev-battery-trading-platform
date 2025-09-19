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
        </Routes>
      </AnimatePresence>
    </Router>
  );
};
export default AppRouter;
