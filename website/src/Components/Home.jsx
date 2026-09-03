import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import { FaSearch } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { product } from "./File";
import img23 from "../assets/img23.jpg";

import {
  FaTshirt,
  FaHome,
  FaTag,
  FaUser,
  FaThLarge,
  FaShoePrints,
  FaHatCowboy,
  FaShoppingBag,
  FaGlasses,
  FaCircle,
  FaClock,
  FaSocks,
  FaMotorcycle,
  FaLock,
  FaHeadset,
  FaUndo,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaShieldAlt,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal
} from "react-icons/fa";


// ========================================
// LIVE BACKEND URL
// ========================================

const API_URL = "https://davira-backend.onrender.com";


const Home = () => {

  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [reviewLoading, setReviewLoading] = useState(null);
  const [cartLoading, setCartLoading] = useState(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");


  // ========================================
  // NEWSLETTER SUBSCRIBE
  // ========================================

  const handleSubscribe = async () => {

  if (!email.trim()) {
    setMessage("Please enter your email");
    return;
  }

  if (subscribeLoading) return;

  setSubscribeLoading(true);
  setMessage("");

  try {

    const response = await fetch(
      `${API_URL}/newsletter`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: email
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    setMessage(data.message);
    setEmail("");

  } catch (error) {

    console.error(
      "Newsletter error:",
      error
    );

    setMessage(
      "Something went wrong. Please try again."
    );

  } finally {

    setSubscribeLoading(false);

  }
};


  // ========================================
  // TOGGLE MOBILE MENU
  // ========================================

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };


  // ========================================
  // GET CART FROM SERVER
  // ========================================

useEffect(() => {

  const getCart = async () => {

    // No logged-in user = don't call /cart
    if (!storedUser?.id) {
      setCart([]);
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/cart`,
        {
          headers: {
            "user-id": storedUser.id
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch cart"
        );
      }

      console.log(
        "CART FROM SERVER:",
        data
      );

      setCart(data);

    } catch (error) {

      console.error(
        "Error fetching cart:",
        error
      );

      setCart([]);

    }
  };

  getCart();

}, []);



// ========================================
// REVIEW NAVIGATION
// ========================================

const handleReviewNavigation = (selectedProduct) => {

  // Prevent multiple clicks
  if (reviewLoading === selectedProduct.id) return;

  setReviewLoading(selectedProduct.id);

  setTimeout(() => {

    navigate(
      `/reviews/${selectedProduct.id}`,
      {
        state: {
          product: selectedProduct
        }
      }
    );

  }, 1000);

};
  // ========================================
  // ADD PRODUCT TO CART
  // ========================================

// ========================================
// ADD PRODUCT TO CART
// ========================================

const handleAddToCart = async (selectedProduct) => {

  // Prevent clicking the same button multiple times
  if (cartLoading === selectedProduct.id) return;

  setCartLoading(selectedProduct.id);

  try {

    if (!storedUser?.id) {

      alert(
        "Please login before adding products to cart"
      );

      navigate("/login");

      return;
    }


    const response = await fetch(
      `${API_URL}/cart`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "user-id": storedUser.id
        },

        body: JSON.stringify({
          userId: storedUser.id,
          productId: selectedProduct.id,
          name: selectedProduct.name,
          brand: selectedProduct.brand,
          price: selectedProduct.price,
          sizes: selectedProduct.sizes,
          image: selectedProduct.image,
          quantity: 1
        })
      }
    );


    const data = await response.json();


    console.log(
      "ADD TO CART RESPONSE:",
      data
    );


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Failed to add product"
      );

    }


    // ========================================
    // GET UPDATED CART
    // ========================================

    const response2 = await fetch(
      `${API_URL}/cart`,
      {
        headers: {
          "user-id": storedUser.id
        }
      }
    );


    if (!response2.ok) {

      throw new Error(
        "Failed to get updated cart"
      );

    }


    const updatedCart =
      await response2.json();


    console.log(
      "UPDATED CART:",
      updatedCart
    );


    setCart(updatedCart);


  } catch (error) {

    console.error(
      "ADD TO CART ERROR:",
      error
    );

    alert(error.message);

  } finally {

    // Stop spinner
    setCartLoading(null);

  }

};


  // ========================================
  // CART COUNT
  // ========================================

  const cartCount = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );


  // ========================================
  // SEARCH PRODUCTS
  // ========================================

  const filteredProducts =
    product.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        item.brand
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        item.sizes
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );


  // ========================================
  // CATEGORY PRODUCTS
  // ========================================

  const categoryProducts =
    filteredProducts.filter(
      (item) => {

        if (selectedCategory === "all") {
          return true;
        }

        return (
          item.name
            .trim()
            .toLowerCase() ===
          selectedCategory
            .trim()
            .toLowerCase()
        );

      }
    );


  // ========================================
  // CATEGORY CLICK
  // ========================================

  const handleCategoryClick =
    (category) => {

      setSelectedCategory(category);

    };

    const handleLoginNavigation = () => {
  if (loginLoading) return;

  setLoginLoading(true);

  setTimeout(() => {
    navigate("/login");
  }, 1000);
};


  return (

    <div className="bod">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="head">

        <button
          className="menu-btn"
          onClick={toggleMenu}
        >
          ☰
        </button>


        {menuOpen && (

          <div className="mobile-menu">

            <button
              className="close-btn"
              onClick={toggleMenu}
            >
              ✕
            </button>


            <h2>
              Davira Products
            </h2>


            <div className="cvn"></div>


            <span>
              Welcome to Davira Products 👋
            </span>

            <br />


            <p>
              Explore our collections,
              discover quality products,
              and shop with confidence.
            </p>


            <div className="get"></div>


            <div className="menu-links">

              <div className="os">

                <div>
                  <FaHome />
                </div>

                <a href="/">
                  Home
                </a>

              </div>


              <div className="os">

                <div>
                  <FaThLarge />
                </div>

                <a href="#">
                  All Products
                </a>

              </div>


              <div className="os">

                <div>
                  <FaTag />
                </div>

                <a href="/#">
                  Categories
                </a>

              </div>


              <div className="os">

                <div>
                  <FaShoppingCart />
                </div>

                <a href="#">
                  My Cart
                </a>

              </div>


              <div className="os">

                <div>
                  <FaShoppingBag />
                </div>

                <a href="#">
                  My Orders
                </a>

              </div>


              <div className="os">

                <div>
                  <FaHeadset />
                </div>

                <a href="#">
                  Contact Us
                </a>

              </div>


              <div className="os">

                <div>
                  <FaUser />
                </div>

                <a href="#">
                  Login
                </a>

              </div>

            </div>


            <div className="llw"></div>


            <div>

              <div className="wbv">

                <div className="tyur">
                  <FaShieldAlt />
                </div>

                <div>

                  <h3>
                    Shop with confidence
                  </h3>

                  <p>
                    Quality products delivered
                    to you
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}


        <h2>
          Davira Products
        </h2>


        <div className="kil"></div>


        <div className="rpo">

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />


          <button className="bn">
            <FaSearch className="srr" />
          </button>


          <button
            className="mobile-search-btn"
            onClick={() =>
              setSearchOpen(true)
            }
          >
            <FaSearch />
          </button>


          {/* MOBILE SEARCH */}

          {searchOpen && (

            <div className="mobile-search-overlay">

              <div className="mobile-search-box">

                <div className="mobile-search-header">

                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    autoFocus
                  />


                  <button
                    className="mobile-search-close"
                    onClick={() =>
                      setSearchOpen(false)
                    }
                  >
                    ✕
                  </button>

                </div>


                <div className="mobile-search-results">

                  {searchTerm.trim() === "" ? (

                    <>

                      <h3>
                        Popular Searches
                      </h3>


                      <div className="popular-searches">

                        <button
                          onClick={() =>
                            setSearchTerm(
                              "Jackets"
                            )
                          }
                        >
                          Jackets
                        </button>


                        <button
                          onClick={() =>
                            setSearchTerm(
                              "Shoes"
                            )
                          }
                        >
                          Shoes
                        </button>


                        <button
                          onClick={() =>
                            setSearchTerm(
                              "Bags"
                            )
                          }
                        >
                          Bags
                        </button>


                        <button
                          onClick={() =>
                            setSearchTerm(
                              "Glasses"
                            )
                          }
                        >
                          Glasses
                        </button>


                        <button
                          onClick={() =>
                            setSearchTerm(
                              "Wristwatch"
                            )
                          }
                        >
                          Watches
                        </button>

                      </div>

                    </>

                  ) : (

                    <>

                      <h3>
                        Search Results
                      </h3>


                      {categoryProducts.length === 0 ? (

                        <p className="no-search-results">
                          No products found for "
                          {searchTerm}"
                        </p>

                      ) : (

                        categoryProducts
                          .slice(0, 5)
                          .map((item) => (

                            <div
                              className="mobile-search-result"
                              key={item.id}
                              onClick={() =>
                                setSearchOpen(
                                  false
                                )
                              }
                            >

                              <img
                                src={item.image}
                                alt={item.name}
                              />


                              <div>

                                <h4>
                                  {item.name}
                                </h4>

                                <p>
                                  {item.brand}
                                </p>

                                <strong>
                                  ₦{item.price}
                                </strong>

                              </div>

                            </div>

                          ))

                      )}

                    </>

                  )}

                </div>

              </div>

            </div>

          )}


          {/* CART */}

          <div className="bt">

            <button
              className="cart"
              onClick={() =>
                navigate("/cart")
              }
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

      <div className="froe">

        <div className="prop">

          <h3>
            New Collection
          </h3>

          <h1>
            Welcome To <br />
            Davira Products
          </h1>

          <p>
            Discover quality products carefully
            selected <br />
            to make your everyday life
            better. shop <br />
            with confidence
            and find something <br />
            you will love.
          </p>


          <button
    className="login-btn"
    onClick={handleLoginNavigation}
    disabled={loginLoading}
>
  {loginLoading ? (
    <>
      <span className="login-spinner"></span>
      Loading...
    </>
    ) : (
    "Login"
      )}
      </button>
        </div>


        <div className="ces">

          <img
            src={img23}
            alt="Davira Products"
          />

        </div>

      </div>


      {/* ========================================
          CATEGORIES
      ======================================== */}

      <div className="betty">

        <div
          onClick={() =>
            setSelectedCategory("all")
          }
        >
          <FaThLarge className="iop" />
        </div>


        <div
          onClick={() =>
            handleCategoryClick(
              "Jackets"
            )
          }
        >
          <FaTshirt className="iop" />
        </div>


        <div
          onClick={() =>
            handleCategoryClick(
              "Shoes"
            )
          }
        >
          <FaShoePrints className="iop" />
        </div>


        <div
          onClick={() =>
            handleCategoryClick(
              "Caps"
            )
          }
        >
          <FaHatCowboy className="iop" />
        </div>


        <div
          onClick={() =>
            handleCategoryClick(
              "Bags"
            )
          }
        >
          <FaShoppingBag className="iop" />
        </div>


        <div
          onClick={() =>
            handleCategoryClick(
              "Glasses"
            )
          }
        >
          <FaGlasses className="iop" />
        </div>


        <div
          onClick={() =>
            handleCategoryClick(
              "Bangles"
            )
          }
        >
          <FaCircle className="iop" />
        </div>


        <div
          onClick={() =>
            handleCategoryClick(
              "Wristwatch"
            )
          }
        >
          <FaClock className="iop" />
        </div>


        <div
          onClick={() =>
            handleCategoryClick(
              "Socks"
            )
          }
        >
          <FaSocks className="iop" />
        </div>

      </div>


      {/* ========================================
          PRODUCTS
      ======================================== */}

      <div className="ore">

        <div className="div">

          <span>
            New Arrivals
          </span>

          <span>
            Our Products
          </span>

        </div>


        <div className="brt">

          {categoryProducts.length === 0 ? (

            <h2 className="no-results">
              No products found in this category
            </h2>

          ) : (

            categoryProducts.map(
              (product) => (

                <div
                  key={product.id}
                  className="clp"
                >

                  <img
                    src={product.image}
                    className="imh"
                    alt={product.name}
                  />


                  <h3>
                    {product.name}
                  </h3>


                  <h4>
                    {product.brand}
                  </h4>


                  <h5>
                    {product.sizes}
                  </h5>


                  <h6>
                    ₦{product.price}
                  </h6>


                  {/* ADD TO CART */}

                  <button
  className="jj"
  onClick={() =>
    handleAddToCart(product)
  }
  disabled={cartLoading === product.id}
>
  {cartLoading === product.id ? (
    <>
      <span className="cart-spinner"></span>
      Adding...
    </>
  ) : (
    "Add to Cart"
  )}
</button>


                  {/* REVIEWS */}

                  <button
      className="ji"
    onClick={() =>
    handleReviewNavigation(product)
      }
      disabled={reviewLoading === product.id}
      >
      {reviewLoading === product.id ? (
      <>
        <span className="review-spinner"></span>
          Loading...
        </>
      ) : (
          "⭐ Reviews"
      )}
      </button>

                </div>

              )
            )

          )}

        </div>

      </div>


      {/* ========================================
          PROMOTION
      ======================================== */}

      <div className="bas">

        <div className="qty">

          <h4>
            TIMELESS <br />
            STYLE
          </h4>

          <p>
            Premium Watches for Every Look
          </p>

        </div>


        <div className="xyz">

          <h5>
            Up To
          </h5>

          <h2>
            30% Off
          </h2>

          <h6>
            On Selected Items
          </h6>

        </div>


        <div className="zt">

          <h3>
            FRAME YOUR <br />
            STYLE
          </h3>

          <p>
            Stylish Eyewear for Every Look
          </p>

        </div>

      </div>


      {/* ========================================
          SERVICES
      ======================================== */}

      <div className="free">

        <div className="service">

          <div className="wdf">

            <div>
              <FaMotorcycle className="ppp" />
            </div>

            <div>

              <h3>
                Fast Delivery
              </h3>

              <p>
                Quick and reliable delivery
                to your doorstep.
              </p>

            </div>

          </div>

        </div>


        <div className="service">

          <div className="wdf">

            <div>
              <FaLock className="ppp" />
            </div>

            <div>

              <h3>
                Secure Payment
              </h3>

              <p>
                Your payment information
                is safe and secure.
              </p>

            </div>

          </div>

        </div>


        <div className="service">

          <div className="wdf">

            <div>
              <FaHeadset className="ppp" />
            </div>

            <div>

              <h3>
                Customer Support
              </h3>

              <p>
                We are always here to help
                you.
              </p>

            </div>

          </div>

        </div>


        <div className="service">

          <div className="wdf">

            <div>
              <FaUndo className="ppp" />
            </div>

            <div>

              <h3>
                Easy Returns
              </h3>

              <p>
                Simple and hassle-free
                returns.
              </p>

            </div>

          </div>

        </div>

      </div>


      <div className="dv"></div>


      {/* ========================================
          FOOTER
      ======================================== */}

      <div className="foot">

        <div className="rawer">

          <div className="flip">

            <h3>

              <span>
                DAVIRA
              </span>

              <br />

              CLOTHING

            </h3>


            <p>
              Premium clothing brand for men <br />
              and women, Quality, Comfort and
              style - always.
            </p>


            <div className="ot">

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
              >
                <FaFacebook className="ww" />
              </a>


              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram className="ww" />
              </a>


              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
              >
                <FaTwitter className="ww" />
              </a>


              <a
                href="https://www.tiktok.com/"
                target="_blank"
                rel="noreferrer"
              >
                <FaTiktok className="ww" />
              </a>

            </div>

          </div>


          <div className="trut">

            <h3>
              CUSTOMER SERVICE
            </h3>

            <ul>

              <li>
                <a href="#">
                  Track Order
                </a>
              </li>

              <li>
                <a href="#">
                  Shipping & Delivery
                </a>
              </li>

              <li>
                <a href="#">
                  Returns & Exchanges
                </a>
              </li>

              <li>
                <a href="#">
                  Contact Us
                </a>
              </li>

              <li>
                <a href="#">
                  FAQs
                </a>
              </li>

            </ul>

          </div>


          <div className="bfr">

            <h2>
              COMPANY
            </h2>

            <ul>

              <li>
                <a href="#">
                  About us
                </a>
              </li>

              <li>
                <a href="#">
                  Our Stores
                </a>
              </li>

              <li>
                <a href="#">
                  Careers
                </a>
              </li>

              <li>
                <a href="#">
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="#">
                  Terms & Conditions
                </a>
              </li>

            </ul>

          </div>


          <div className="rita">

            <h2>
              SHOP
            </h2>

            <ul>

              <li>
                <a href="#">
                  All Products
                </a>
              </li>

              <li>
                <a href="#">
                  Sale
                </a>
              </li>

              <li>
                <a href="#">
                  Jackets
                </a>
              </li>

              <li>
                <a href="#">
                  Wristwatches
                </a>
              </li>

              <li>
                <a href="#">
                  New Arrivals
                </a>
              </li>

            </ul>

          </div>


          {/* ========================================
              NEWSLETTER
          ======================================== */}

          <div className="cre">

            <h2>
              NEWSLETTER
            </h2>


            <p>
              Subscribe to get updates on new <br />
              arrivals and exclusive offers.
            </p>


            <div>

              <input
                type="email"
                placeholder="Type your email here"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />


              <button
      onClick={handleSubscribe}
      disabled={subscribeLoading}
      className="subscribe-btn"
      >
      {subscribeLoading ? (
        <>
      <span className="subscribe-spinner"></span>
      Subscribing...
      </>
    ) : (
      "Subscribe"
    )}
  </button>

            </div>


            {message && (

              <p className="newsletter-message">
                {message}
              </p>

            )}

          </div>

        </div>


        <div className="die"></div>


        <div className="frpo">

          <div className="deu">

            <h3>
              © 2026 Davira Products.
              All Rights Reserved.
            </h3>

          </div>


          <div className="type">

            <span>
              <FaCcMastercard className="rc" />
            </span>

            <span>
              <FaCcVisa className="cd" />
            </span>

            <span>
              <FaCcPaypal className="dc" />
            </span>

          </div>

        </div>

      </div>


      {/* ========================================
          MOBILE BOTTOM NAVIGATION
      ======================================== */}

      <div className="rss">

        <div>

          <a href="/">
            <FaHome />
          </a>

        </div>


        <div>

          <a href="/cart">
            <FaShoppingBag />
          </a>

        </div>


        <div>

          <a href="/login">
            <FaUser />
          </a>

        </div>

      </div>

    </div>

  );

};


export default Home;