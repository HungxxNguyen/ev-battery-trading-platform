// src/pages/Home/Home.jsx
import React from "react";
import MainLayout from "../../components/layout/MainLayout";

const Home = () => {
  return (
    <MainLayout>
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to the Home Page</h1>
      <p>This is a simple Home page component.</p>
    </div>
    </MainLayout>
  );
};

export default Home;
