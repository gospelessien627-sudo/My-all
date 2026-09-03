import React, { useState, useEffect } from "react";
import Home from "./Components/Home";
import Cart from "./Components/Cart";
import Reviews from "./Components/Reviews";
import Login from "./Components/Login";
import AdminDashboard from "./Components/AdminDashboard";
import { Routes, Route } from "react-router-dom";
import "./App.css";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);


    // Clean up timer
    return () => clearTimeout(timer);
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">

          <h1>DAVIRA PRODUCTS</h1>

          <div className="spinner"></div>

          <p>Loading...</p>

        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/reviews/:productId"
          element={<Reviews />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Routes>
    </>
  );
};

export default App;