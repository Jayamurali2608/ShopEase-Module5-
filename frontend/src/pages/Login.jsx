import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/axiosInstance.js";
import { setCredentials } from "../redux/store.js";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      dispatch(
        setCredentials({
          token: response.data.token,
          user: response.data.user,
        })
      );

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-popup-content">
      <section className="login-info-panel">
        <h1>Login</h1>

        <p>
          Get access to your Orders, Wishlist and Recommendations.
        </p>

        <div className="login-shopping-illustration">🛍️</div>

        <h2>Welcome to ShopEase!</h2>

        <p>Your favourite products are waiting for you.</p>
      </section>

      <section className="login-form-panel">
        <form onSubmit={handleSubmit}>
          <h2>Welcome Back!</h2>

          <p className="login-subtitle">
            Enter your details to continue.
          </p>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <label htmlFor="login-email">Email Address</label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="login-signup-text">
            Don't have an account?{" "}
            <Link to="/signup">Create Account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default Login;