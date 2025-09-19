import React, { useState } from "react";
import { motion } from "framer-motion";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";
const ManageListing = () => {
  return (
    <MainLayout>
      <motion.div>
        <h2 className="text-gray-400">Bạn chưa có tin đăng nào. </h2>
      </motion.div>
    </MainLayout>
  );
};
export default ManageListing;
