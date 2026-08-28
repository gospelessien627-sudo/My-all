import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { FaSearch } from "react-icons/fa";
import { FaShoppingCart, FaShoppingBasket } from "react-icons/fa";
import { product } from "./File";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Home = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  // ========================================
  // GET CART FROM SERVER
  // ========================================
  // ========================================
// GET CART FROM SERVER
// ========================================
useEffect(() => {
  const getCart = async () => {
    try {
      const response = await fetch("http://localhost:5000/cart");

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();

      console.log("CART FROM SERVER:", data);

      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  getCart();
}, []);
// ========================================
// ADD PRODUCT TO CART
// ========================================
const handleAddToCart = async (selectedProduct) => {
  try {
    const response = await fetch("http://localhost:5000/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        price: selectedProduct.price,
        sizes: selectedProduct.sizes,
        image: selectedProduct.image,
        quantity: 1,
      }),
    });

    const data = await response.json();

    console.log("ADD TO CART RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to add product");
    }

    // Get updated cart
    const response2 = await fetch("http://localhost:5000/cart");

    if (!response2.ok) {
      throw new Error("Failed to get updated cart");
    }

    const updatedCart = await response2.json();

    console.log("UPDATED CART:", updatedCart);

    setCart(updatedCart);

  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
  }
};

const cartCount = cart.reduce(
  (total, item) => total + Number(item.quantity || 1),
  0
);
  // ========================================

  // SEARCH PRODUCTS
  // ========================================
  const filteredProducts = product.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sizes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bod">

      {/* ========================================
          HEADER
      ======================================== */}
      <header className="head">

        <h2>Davira Products</h2>

        <div className="kil"></div>

        <div className="rpo">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button className="bn">
            <FaSearch className="srr" />
          </button>

          {/* CART */}
          <div className="bt">

            <button
  className="cart"
  onClick={() => navigate("/cart")}
>
  <FaShoppingCart />

  <span className="lop">
    {cartCount}
  </span>
</button>

          </div>

        </div>

      </header>

      {/* ========================================
          HERO SECTION
      ======================================== */}
      <div className="prop">

        <div className="spar">
          <FaShoppingBasket className="dd" />
          <p className="fpy">We sell all kind of products</p>
          
        </div>

        <h1>
          Welcome To <br />
          Davira Products
        </h1>

        <p>
          Discover quality products carefully selected to make your
          everyday life <br />
          better. shop with confidence <br />
          and find something you will love
        </p>

        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <div className="bg">
          <span>100+</span>
          <br />

          <span>100%</span>
          <br />

          <span>24/7</span>
        </div>

      </div>

      {/* ========================================
          PRODUCTS
      ======================================== */}
      <div className="ore">

        <h2>Our Products</h2>

        <div className="rew"></div>

        <div className="brt">

          {filteredProducts.length === 0 ? (

            <h2 className="no-results">
              No products found
            </h2>

          ) : (

            filteredProducts.map((product) => (

              <div
                key={product.id}
                className="clp"
              >

                <img
                  src={product.image}
                  className="imh"
                  alt={product.name}
                />

                <h3>{product.name}</h3>

                <h4>{product.brand}</h4>

                <h5>{product.sizes}</h5>

                <h6>₦{product.price}</h6>

                {/* ADD TO CART */}
                <button
                  className="jj"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>

                {/* REVIEWS */}
                <button
                  className="ji"
                  onClick={() =>
                    navigate(`/reviews/${product.id}`, {
                      state: { product },
                    })
                  }
                >
                  ⭐ Reviews
                </button>

              </div>

            ))

          )}

        </div>

      </div>

      {/* ========================================
          FOOTER
      ======================================== */}
      <div className="foot">

        <div className="flip">

          <h2>Davira</h2>

          <h4>
            Quality . Style . Confidence
          </h4>

        </div>

        <div className="erq">

          <div className="trut">

            <h3>CUSTOMER SERVICE</h3>

            <ul>

              <li>
                <a href="#">Help center</a>
              </li>

              <li>
                <a href="#">Shipping</a>
              </li>

              <li>
                <a href="#">Returns</a>
              </li>

            </ul>

          </div>

          <div className="bfr">

            <h2>CONTACT US</h2>

            <h4>
              <FaMapMarkerAlt className="vv" />
              Nigeria
            </h4>

            <h4>
              <FaPhone className="mm" />
              <a href="tel:+2348024366456">
                  +2348024366456
          </a>
            </h4>

            <h4>
              <FaEnvelope className="mm" />
              <a href="mailto:Davira@gmail.com">
                  Davira@gmail.com
            </a>
            </h4>

          </div>

        <div className="rita">
                       <h2>SHOP</h2>
                       <h4> Men</h4>
                     <h4>Women </h4>
               <h4>New Arrivals</h4>
                    <h4> Jackets</h4>


        </div>


        </div>

        <div className="die"></div>

        <div className="frpo">

          <h3>
            © 2026 Davira Products. All Rights Reserved.
          </h3>

          <div className="type">
            <h4>
              Privacy Policy | Terms
            </h4>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Home;