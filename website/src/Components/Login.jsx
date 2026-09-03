import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Prevent multiple clicks
    if (loading) return;

    setLoading(true);

    try {
      // ========================================
      // REGISTER
      // ========================================

      if (isRegister) {
        if (!name || !email || !password) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://davira-backend.onrender.com/register",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name,
              email,
              password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Registration failed"
          );
        }

        setSuccess(
          "Registration successful! You can now login."
        );

        // Clear form
        setName("");
        setEmail("");
        setPassword("");

        // Switch to login
        setIsRegister(false);
      }

      // ========================================
      // LOGIN
      // ========================================

      else {
        if (!email || !password) {
          setError(
            "Please enter your email and password"
          );

          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://davira-backend.onrender.com/login",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Login failed"
          );
        }

        // ========================================
        // SAVE USER
        // ========================================

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // ========================================
        // REDIRECT BASED ON ROLE
        // ========================================

        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }

    } catch (error) {

      console.error(error);

      setError(
        error.message || "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };

  // ========================================
  // SWITCH LOGIN / REGISTER
  // ========================================

  const switchMode = () => {
    setIsRegister(!isRegister);

    setError("");
    setSuccess("");

    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>
          {isRegister
            ? "Create Account"
            : "Welcome Back"}
        </h1>

        <p className="auth-subtitle">
          {isRegister
            ? "Create your Davira account"
            : "Login to your Davira account"}
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* REGISTER NAME */}

          {isRegister && (
            <div className="input-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>
          )}

          {/* EMAIL */}

          <div className="input-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          {/* ========================================
              LOGIN / REGISTER BUTTON
          ======================================== */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="auth-spinner"></span>

                Please wait...
              </>
            ) : (
              isRegister
                ? "Register"
                : "Login"
            )}

          </button>

        </form>

        {/* SWITCH LOGIN / REGISTER */}

        <div className="switch-auth">

          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={switchMode}
            disabled={loading}
          >
            {isRegister
              ? " Login"
              : " Register"}
          </button>

        </div>

        {/* BACK HOME */}

        <button
          className="back-home"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Continue Shopping
        </button>

      </div>

    </div>
  );
};

export default Login;