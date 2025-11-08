import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const MainLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="layout-container">
      <Header />
      <main className="main-content">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
