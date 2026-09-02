import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalCartItems: 0
  });

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [formData, setFormData] = useState({

    name: "",
    brand: "",
    price: "",
    sizes: "",
    image: ""

  });

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  // ========================================
  // CHECK ADMIN
  // ========================================

useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    navigate("/login");
    return;
  }

  const currentUser = JSON.parse(storedUser);

  if (currentUser.role !== "admin") {
    navigate("/");
    return;
  }

  getDashboardData(currentUser);

}, []);

  // ========================================
  // GET DASHBOARD DATA
  // ========================================

const getDashboardData = async (currentUser) => {
  try {
    setLoading(true);

    const headers = {
      "user-id": currentUser.id
    };

    const [
      productsResponse,
      usersResponse,
      statsResponse
    ] = await Promise.all([
      fetch(
        // "https://davira-backend-api.vercel.app/admin/products",
                "http://localhost:5000/admin/products",
        { headers }
      ),

      fetch(
        // "https://davira-backend-api.vercel.app/admin/users",
        "http://localhost:5000/admin/users",
        
        { headers }
      ),

      fetch(
        // "https://davira-backend-api.vercel.app/admin/stats",
        "http://localhost:5000/admin/stats",
        "",
        { headers }
      )
    ]);

    const productsData = await productsResponse.json();
    const usersData = await usersResponse.json();
    const statsData = await statsResponse.json();

    if (!productsResponse.ok) {
      throw new Error(
        productsData.message || "Failed to fetch products"
      );
    }

    setProducts(productsData);
    setUsers(usersData);
    setStats(statsData);

  } catch (error) {
    console.error("Dashboard error:", error);
  } finally {
    setLoading(false);
  }
};

  // ========================================
  // FORM CHANGE
  // ========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

  };

  // ========================================
  // ADD PRODUCT
  // ========================================

  const addProduct = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(
// "https://davira-backend-api.vercel.app/admin/products",
"http://localhost:5000/admin/products",

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "user-id": user.id
          },

          body: JSON.stringify(formData)
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      alert(
        "Product added successfully"
      );

      resetForm();

      getDashboardData();

    } catch (error) {

      alert(error.message);

    }

  };

  // ========================================
  // EDIT PRODUCT
  // ========================================

  const startEdit = (product) => {

    setEditingProduct(product);

    setFormData({

      name: product.name,

      brand: product.brand,

      price: product.price,

      sizes: product.sizes,

      image: product.image

    });

    setShowForm(true);

  };

  // ========================================
  // UPDATE PRODUCT
  // ========================================

  const updateProduct = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(

// `https://davira-backend-api.vercel.app/admin/products/${editingProduct._id}`,
`http://localhost:5000/admin/products/${editingProduct._id}`,
"",

        {

          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            "user-id": user.id
          },

          body: JSON.stringify(formData)

        }

      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message
        );

      }

      alert(
        "Product updated successfully"
      );

      resetForm();

      getDashboardData();

    } catch (error) {

      alert(error.message);

    }

  };

  // ========================================
  // DELETE PRODUCT
  // ========================================

  const deleteProduct = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(

        // `https://davira-backend-api.vercel.app/admin/products/${id}`,
        `http://localhost:5000/admin/products/${id}`,
        "",

        {

          method: "DELETE",

          headers: {
            "user-id": user.id
          }

        }

      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message
        );

      }

      setProducts(
        previousProducts =>
          previousProducts.filter(
            product =>
              product._id !== id
          )
      );

      setStats(previous => ({
        ...previous,
        totalProducts:
          previous.totalProducts - 1
      }));

    } catch (error) {

      alert(error.message);

    }

  };

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {

    setFormData({

      name: "",
      brand: "",
      price: "",
      sizes: "",
      image: ""

    });

    setEditingProduct(null);

    setShowForm(false);

  };

  // ========================================
  // LOGOUT
  // ========================================

  const logout = () => {

    localStorage.removeItem("user");

    navigate("/login");

  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (

      <div className="admin-loading">

        <h2>
          Loading Dashboard...
        </h2>

      </div>

    );

  }

  return (

    <div className="admin-dashboard">

      {/* ================================= */}
      {/* SIDEBAR */}
      {/* ================================= */}

      <aside className="admin-sidebar">

        <h1>
          Davira
        </h1>

        <p>
          Admin Panel
        </p>

        <button
          className="active"
        >
          Dashboard
        </button>

        <button
          onClick={() =>
            setShowForm(true)
          }
        >
          Add Product
        </button>

        <button
          onClick={() =>
            navigate("/")
          }
        >
          View Store
        </button>

        <button
          onClick={logout}
          className="logout-btn"
        >
          Logout
        </button>

      </aside>


      {/* ================================= */}
      {/* MAIN */}
      {/* ================================= */}

      <main className="admin-main">

        <div className="admin-header">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Welcome, {user.name}
            </p>

          </div>

        </div>


        {/* ================================= */}
        {/* STATISTICS */}
        {/* ================================= */}

        <div className="stats-container">

          <div className="stat-card">

            <h3>
              Total Products
            </h3>

            <strong>
              {stats.totalProducts}
            </strong>

          </div>


          <div className="stat-card">

            <h3>
              Total Users
            </h3>

            <strong>
              {stats.totalUsers}
            </strong>

          </div>


          <div className="stat-card">

            <h3>
              Cart Items
            </h3>

            <strong>
              {stats.totalCartItems}
            </strong>

          </div>

        </div>


        {/* ================================= */}
        {/* PRODUCT FORM */}
        {/* ================================= */}

        {showForm && (

          <div className="product-form-card">

            <div className="form-header">

              <h2>
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <button
                onClick={resetForm}
              >
                X
              </button>

            </div>

            <form
              onSubmit={
                editingProduct
                  ? updateProduct
                  : addProduct
              }
            >

              <input
                type="text"
                name="name"
                placeholder="Product name"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="text"
                name="brand"
                placeholder="Brand"
                value={formData.brand}
                onChange={handleChange}
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
              />

              <input
                type="text"
                name="sizes"
                placeholder="Sizes e.g. S, M, L"
                value={formData.sizes}
                onChange={handleChange}
              />

              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={formData.image}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="save-product"
              >
                {editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>

            </form>

          </div>

        )}


        {/* ================================= */}
        {/* PRODUCTS */}
        {/* ================================= */}

        <section className="products-section">

          <div className="section-title">

            <h2>
              Products
            </h2>

            <button
              onClick={() =>
                setShowForm(true)
              }
            >
              + Add Product
            </button>

          </div>


          <div className="admin-products">

            {products.length === 0 ? (

              <p>
                No products available.
              </p>

            ) : (

              products.map((product) => (

                <div
                  className="admin-product"
                  key={product._id}
                >

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <div className="product-info">

                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      {product.brand}
                    </p>

                    <p>
                      Size: {product.sizes}
                    </p>

                    <h4>
                      ₦{product.price}
                    </h4>

                  </div>

                  <div className="product-actions">

                    <button
                      onClick={() =>
                        startEdit(product)
                      }
                      className="edit-btn"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteProduct(
                          product._id
                        )
                      }
                      className="delete-btn"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>


        {/* ================================= */}
        {/* USERS */}
        {/* ================================= */}

        <section className="users-section">

          <h2>
            Registered Users
          </h2>

          <div className="users-table">

            <div className="user-row user-header">

              <span>
                Name
              </span>

              <span>
                Email
              </span>

              <span>
                Role
              </span>

            </div>


            {users.map((person) => (

              <div
                className="user-row"
                key={person._id}
              >

                <span>
                  {person.name}
                </span>

                <span>
                  {person.email}
                </span>

                <span>
                  {person.role || "user"}
                </span>

              </div>

            ))}



          </div>

        </section>

      </main>

    </div>

  );
};

export default AdminDashboard;