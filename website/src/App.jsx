import React from "react";
import Home from "./Components/Home";
import Cart from "./Components/Cart";
import Reviews from "./Components/Reviews";
import Login from "./Components/Login";
import AdminDashboard from "./Components/AdminDashboard";
import { Routes, Route } from "react-router-dom";

const App = () => {
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
        element={<Login/>}
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