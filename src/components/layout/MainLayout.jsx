import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const MainLayout = ({ children }) => {

  return (
    <div className="layout-container">
      <Header/>
      <main className="main-content">{children}</main>
      <Footer/>
    </div>
  );
};

export default MainLayout;