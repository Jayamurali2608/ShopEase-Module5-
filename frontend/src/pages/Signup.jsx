import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance.js";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/signup", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(
        response.data.message || "Account created successfully!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-popup-content">
      {/* LEFT BLUE INFORMATION PANEL */}
      <section className="login-info-panel">
        <h1>Create Account</h1>

        <p>
          Join ShopEase and discover products you'll love.
        </p>

        <div className="login-shopping-illustration">
          🛍️
        </div>

        <h2>Welcome to ShopEase!</h2>

        <p>
          Create your account to access Orders, Wishlist
          and your favourite products.
        </p>
      </section>

      {/* RIGHT SIGNUP FORM */}
      <section className="login-form-panel">
        <form onSubmit={handleSubmit}>
          <h2>Create Your Account</h2>

          <p className="login-subtitle">
            Enter your details to get started.
          </p>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="success-message" role="status">
              {success}
            </p>
          )}

          <label htmlFor="signup-name">Full Name</label>

          <input
            id="signup-name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            maxLength={80}
            required
          />

          <label htmlFor="signup-email">Email Address</label>

          <input
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="signup-password">Password</label>

          <input
            id="signup-password"
            type="password"
            placeholder="Create a password (minimum 6 characters)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="login-signup-text">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default Signup;