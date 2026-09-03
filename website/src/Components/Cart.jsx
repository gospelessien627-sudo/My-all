import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { FaArrowLeft } from "react-icons/fa";
import PaystackPop from "@paystack/inline-js";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAYMENT LOADING STATE
  const [paymentLoading, setPaymentLoading] = useState(false);

  const navigate = useNavigate();

  // ========================================
  // GET CART FROM MONGODB
  // ========================================

  const getCart = async () => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(savedUser);

      if (!user.id) {
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://davira-backend.onrender.com/cart",
        {
          headers: {
            "user-id": user.id,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch cart"
        );
      }

      console.log("CART PAGE:", data);

      setCart(data);
    } catch (error) {
      console.error(
        "Error fetching cart:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  // ========================================
  // DELETE PRODUCT FROM CART
  // ========================================

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(
        `https://davira-backend.onrender.com/cart/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete product"
        );
      }

      setCart((previousCart) =>
        previousCart.filter(
          (item) => item._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting cart product:",
        error
      );
    }
  };

  // ========================================
  // UPDATE CART QUANTITY
  // ========================================

  const updateCart = async (id, quantity) => {
    try {
      const response = await fetch(
        `https://davira-backend.onrender.com/cart/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            quantity: quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update cart"
        );
      }

      setCart((previousCart) =>
        previousCart.map((item) =>
          item._id === id
            ? {
                ...item,
                quantity: quantity,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Error updating cart:",
        error
      );
    }
  };

  // ========================================
  // INCREASE QUANTITY
  // ========================================

  const increaseQuantity = (id) => {
    const item = cart.find(
      (item) => item._id === id
    );

    if (!item) return;

    updateCart(
      id,
      item.quantity + 1
    );
  };

  // ========================================
  // DECREASE QUANTITY
  // ========================================

  const decreaseQuantity = async (id) => {
    const item = cart.find(
      (item) => item._id === id
    );

    if (!item) return;

    if (item.quantity === 1) {
      await deleteProduct(id);
      return;
    }

    updateCart(
      id,
      item.quantity - 1
    );
  };

  // ========================================
  // PAY FOR ENTIRE CART
  // ========================================

  const handlePayNow = async () => {

    // Prevent multiple clicks
    if (paymentLoading) {
      return;
    }

    try {

      // ========================================
      // START PAYMENT LOADING
      // ========================================

      setPaymentLoading(true);

      const savedUser =
        localStorage.getItem("user");

      // ========================================
      // CHECK LOGIN
      // ========================================

      if (!savedUser) {

        localStorage.setItem(
          "pendingPayment",
          JSON.stringify(cart)
        );

        setPaymentLoading(false);

        navigate("/login");

        return;
      }

      const user =
        JSON.parse(savedUser);

      if (!user.id) {

        alert(
          "Your login session is invalid. Please login again."
        );

        localStorage.removeItem(
          "user"
        );

        localStorage.setItem(
          "pendingPayment",
          JSON.stringify(cart)
        );

        setPaymentLoading(false);

        navigate("/login");

        return;
      }

      // ========================================
      // CHECK CART
      // ========================================

      if (
        !cart ||
        cart.length === 0
      ) {

        alert(
          "Your cart is empty."
        );

        setPaymentLoading(false);

        return;
      }

      // ========================================
      // GET CART IDS
      // ========================================

      const cartIds =
        cart.map(
          (item) =>
            item._id
        );

      // ========================================
      // CALCULATE TOTAL
      // ========================================

      const totalAmount =
        cart.reduce(
          (total, item) => {

            const price =
              Number(item.price) || 0;

            const quantity =
              Number(item.quantity) || 1;

            return (
              total +
              price * quantity
            );

          },
          0
        );

      if (
        totalAmount <= 0
      ) {

        alert(
          "Invalid cart amount."
        );

        setPaymentLoading(false);

        return;
      }

      console.log(
        "Cart IDs:",
        cartIds
      );

      console.log(
        "Total amount:",
        totalAmount
      );

      // ========================================
      // CREATE PAYMENT RECORD
      // ========================================

      const response =
        await fetch(
          "https://davira-backend.onrender.com/payment",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              userId:
                user.id,

              email:
                user.email,

              cartIds:
                cartIds,

              amount:
                totalAmount,

            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to create payment"
        );

      }

      console.log(
        "Payment record created:",
        data
      );

      // ========================================
      // OPEN PAYSTACK
      // ========================================

      const paystack =
        new PaystackPop();

      paystack.newTransaction({

        key:
          "pk_test_7bf6c0d1ad8f52aa0f20c1558bc850e7aa055092",

        email:
          user.email,

        amount:
          totalAmount * 100,

        // ========================================
        // PAYMENT SUCCESS
        // ========================================

        onSuccess:
          async (transaction) => {

            console.log(
              "Payment successful:",
              transaction
            );

            try {

              // ========================================
              // VERIFY PAYMENT
              // ========================================

              const verifyResponse =
                await fetch(
                  "https://davira-backend.onrender.com/payment/verify",
                  {
                    method:
                      "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body: JSON.stringify({

                      reference:
                        transaction.reference,

                      paymentId:
                        data.payment.id,

                    }),

                  }
                );

              const verifyData =
                await verifyResponse.json();

              if (
                !verifyResponse.ok
              ) {

                throw new Error(
                  verifyData.message ||
                    "Payment verification failed"
                );

              }

              console.log(
                "Payment verified:",
                verifyData
              );

              // ========================================
              // PAYMENT COMPLETED
              // ========================================

              alert(
                "Payment successful! Thank you for your purchase."
              );

              // ========================================
              // CLEAR CART
              // ========================================

              setCart([]);

              localStorage.removeItem(
                "pendingPayment"
              );

            } catch (error) {

              console.error(
                "Verification error:",
                error
              );

              alert(
                error.message ||
                  "Payment verification failed"
              );

            } finally {

              // STOP BUTTON LOADING
              setPaymentLoading(false);

            }

          },

        // ========================================
        // PAYMENT CANCELLED
        // ========================================

        onCancel:
          () => {

            console.log(
              "Payment cancelled"
            );

            alert(
              "Payment cancelled."
            );

            // STOP BUTTON LOADING
            setPaymentLoading(false);

          },

      });

    } catch (error) {

      console.error(
        "Payment error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong with payment"
      );

      // STOP BUTTON LOADING
      setPaymentLoading(false);

    }

  };

  // ========================================
  // CALCULATE TOTAL CART PRICE
  // ========================================

  const totalPrice =
    cart.reduce(
      (total, item) => {

        const price =
          Number(item.price) || 0;

        const quantity =
          Number(item.quantity) || 1;

        return (
          total +
          price * quantity
        );

      },
      0
    );

  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (
      <div className="yiu">

        <h2>
          Loading cart...
        </h2>

      </div>
    );

  }

  // ========================================
  // CART PAGE
  // ========================================

  return (

    <div className="cart-page">

      <button
        onClick={() =>
          navigate("/")
        }
        className="rrr"
      >

        <FaArrowLeft
          className="pew"
        />

        Continue shopping

      </button>


      <h1>
        Your Cart
      </h1>


      {cart.length === 0 ? (

        <div className="cloq">

          <h2>
            Your cart is empty
          </h2>

        </div>

      ) : (

        <>

          {cart.map(
            (item) => (

              <div
                className="cart-item"
                key={item._id}
              >

                <img
                  src={item.image}
                  alt={item.name}
                />


                <div className="quantity-controls">

                  <button
                    onClick={() =>
                      decreaseQuantity(
                        item._id
                      )
                    }
                  >
                    -
                  </button>


                  <span>
                    {item.quantity}
                  </span>


                  <button
                    onClick={() =>
                      increaseQuantity(
                        item._id
                      )
                    }
                  >
                    +
                  </button>

                </div>


                <div className="cart-details">

                  <h2>
                    {item.name}
                  </h2>


                  <h3>
                    {item.brand}
                  </h3>


                  <p>
                    Size: {item.sizes}
                  </p>


                  <h3>
                    ₦
                    {Number(
                      item.price
                    ).toLocaleString()}
                  </h3>


                  <button
                    className="proe"
                    onClick={() =>
                      deleteProduct(
                        item._id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            )
          )}

        </>

      )}


      <div className="blt">

        <h3>

          Price: ₦
          {totalPrice.toLocaleString()}

        </h3>


        {/* ========================================
             PAY NOW BUTTON
        ======================================== */}

        <button
          className="weq"
          onClick={handlePayNow}
          disabled={
            paymentLoading ||
            cart.length === 0
          }
        >

          {paymentLoading ? (

            <>

              <span className="pay-spinner"></span>

              Processing...

            </>

          ) : (

            "Pay Now"

          )}

        </button>

      </div>

    </div>

  );

};

export default Cart;