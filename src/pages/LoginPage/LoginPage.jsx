import { useState } from "react";
import axios from "axios";
import "./LoginPage.css";

function LoginPage({ onLogin, apiBase }) {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin@123");
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    const enteredEmail = email.trim();
    const enteredPassword = password.trim();

    if (!enteredEmail || !enteredPassword) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setIsLoggingIn(true);
      setError("");

      const response = await axios.post(`${apiBase}/users/login`, {
        email: enteredEmail,
        password: enteredPassword,
      });

      const user = response.data;

      const loggedUser = {
        id: user._id || user.id,
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        permissions: user.permissions || {},
        assignedCourses: user.assignedCourses || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      onLogin(loggedUser);
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Login failed. Please check backend server.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

 return (
  <div className="login-page">
    <div className="login-wrapper">
      <div className="login-left-panel">
        <div className="brand-badge">CD</div>
        <h1>Course Dashboard</h1>
        <p>
          Manage courses, users, subjects, chapters, topics, and AI lectures
          from one secure dashboard.
        </p>

        <div className="login-features">
          <div>✓ Role-based access</div>
          <div>✓ Admin, Sub Admin, Teacher, Student</div>
          <div>✓ Secure course management</div>
        </div>
      </div>

      <div className="login-card">
        <div className="login-card-header">
          <p className="login-small-title">Welcome back</p>
          <h2>Login to Dashboard</h2>
          <span>Enter your credentials to continue</span>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            disabled={isLoggingIn}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              disabled={isLoggingIn}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button
              type="button"
              className="password-eye-btn"
              disabled={isLoggingIn}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12C1.8 9.73 3.24 7.82 5.06 6.44" />
                  <path d="M9.9 4.24A10.8 10.8 0 0 1 12 4C17 4 21.27 7.11 23 12A11.2 11.2 0 0 1 19.74 16.26" />
                  <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                  <path d="M1 1L23 23" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-submit-btn" type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="demo-logins">
          <h3>Demo Login Details</h3>

          <div className="demo-login-grid">
            <button
              type="button"
              disabled={isLoggingIn}
              onClick={() => {
                setEmail("admin@gmail.com");
                setPassword("admin@123");
                setError("");
              }}
            >
              Admin
            </button>

            <button
              type="button"
              disabled={isLoggingIn}
              onClick={() => {
                setEmail("teacher@gmail.com");
                setPassword("teacher@123");
                setError("");
              }}
            >
              Teacher
            </button>

            <button
              type="button"
              disabled={isLoggingIn}
              onClick={() => {
                setEmail("student@gmail.com");
                setPassword("student@123");
                setError("");
              }}
            >
              Student
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default LoginPage;