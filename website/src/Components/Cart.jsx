import React, { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom"
import "./Cart.css";
import {FaArrowLeft} from "react-icons/fa"
import PaystackPop from "@paystack/inline-js";

const Cart = () => {

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
 const navigate = useNavigate();

  // ========================================
  // GET CART FROM MONGODB
  // ========================================

  const getCart = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/cart"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

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
        `http://localhost:5000/cart/${id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Remove from React state
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
      `http://localhost:5000/cart/${id}`,
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
      throw new Error(data.message);
    }

    // Update React state after MongoDB succeeds
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
    console.error("Error updating cart:", error);
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

  // If quantity is 1, remove the product completely
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
// PAY NOW
// ========================================

// ========================================
// PAY NOW
// ========================================


// ========================================
// PAY NOW
// ========================================

const handlePayNow = async (item) => {
  try {

    // ========================================
    // CHECK IF USER IS LOGGED IN
    // ========================================

    const savedUser = localStorage.getItem("user");

    // User is NOT logged in
    if (!savedUser) {

      // Save the cart item they wanted to pay for
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify(item)
      );

      // Send them to login/register page
      navigate("/login");

      return;
    }

    // ========================================
    // GET LOGGED-IN USER
    // ========================================

    const user = JSON.parse(savedUser);

    // Make sure user ID exists
    if (!user.id) {

      alert(
        "Your login session is invalid. Please login again."
      );

      localStorage.removeItem("user");

      // Save payment item again
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify(item)
      );

      navigate("/login");

      return;
    }

    // ========================================
    // CALCULATE TOTAL
    // ========================================

    const quantity =
      Number(item.quantity) || 1;

    const totalAmount =
      Number(item.price) * quantity;

    // ========================================
    // CREATE PAYMENT RECORD
    // ========================================

    const response = await fetch(
      "http://localhost:5000/payment",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          userId: user.id,

          email: user.email,

          cartId: item._id,

          productName: item.name,

          quantity: quantity,

          amount: totalAmount

        })
      }
    );

    const data = await response.json();

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

    const paystack = new PaystackPop();

    paystack.newTransaction({

      key:
        "pk_test_7bf6c0d1ad8f52aa0f20c1558bc850e7aa055092",

      email: user.email,

      // Paystack uses kobo
      amount: totalAmount * 100,

      // ========================================
      // PAYMENT SUCCESS
      // ========================================

      onSuccess: async (transaction) => {

        console.log(
          "Payment successful:",
          transaction
        );

        alert(
          "Payment successful!"
        );

        // Remove paid product from cart
        await deleteProduct(item._id);

        // Remove pending payment
        localStorage.removeItem(
          "pendingPayment"
        );

      },

      // ========================================
      // PAYMENT CANCELLED
      // ========================================

      onCancel: () => {

        console.log(
          "Payment cancelled"
        );

        alert(
          "Payment cancelled."
        );

      }

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

  }
};


// ========================================
// CALCULATE TOTAL CART PRICE
// ========================================

const totalPrice = cart.reduce((total, item) => {
  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 1;

  return total + (price * quantity);
}, 0);





  if (loading) {

    return (
      <div className="yiu">
        <h2>Loading cart...</h2>
      </div>
    );

  }


  return (

    <div className="cart-page">
        <button onClick={() =>navigate("/")} className="rrr">  <FaArrowLeft className="pew"/>   Continue shopping</button>


      <h1>Your Cart</h1>


      {cart.length === 0 ? (

        <h2>
          Your cart is empty
        </h2>

      ) : (

        <>

          {cart.map((item) => (

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
    onClick={() => decreaseQuantity(item._id)}
  >
    -
  </button>

  <span>
    {item.quantity}
  </span>

  <button
    onClick={() => increaseQuantity(item._id)}
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
                  ₦{item.price}
                </h3>


  <button className="proe"
      onClick={() => deleteProduct(item._id)}
    >
        Delete
      </button>
            
              </div>
              

            </div>

          ))}

       </>

      )}

      <div className="blt">
  <h3>
    Price: ₦{totalPrice.toLocaleString()}
  </h3>

  <button
    className="weq"
    onClick={() => {
      if (cart.length === 0) {
        alert("Your cart is empty");
        return;
      }

      // For now, pay for the cart
      handlePayNow(cart);
    }}
  >
    Pay Now
  </button>
</div>

    </div>

  );

};

export default Cart;