import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    // Demo login credentials
    const demoUsername = "admin";
    const demoPassword = "admin123";

    if (username === demoUsername && password === demoPassword) {
      if (rememberMe) {
        localStorage.setItem("idscRememberMe", "true");
      }

      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left Side */}
        <div className="login-brand">
          <div className="brand-logo">
            IDSC
          </div>

          <h1>IDSC Finance System</h1>

          <p>
            Manage student accounts, tuition fees, payments,
            invoices, and financial records in one place.
          </p>

          <div className="brand-features">
            <div className="feature-item">
              <span>✓</span>
              <p>Student Account Management</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>Payment Tracking</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>Financial Reports</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-form-container">

          <div className="login-header">
            <h2>Welcome Back!</h2>
            <p>Sign in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit}>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">
                Username
              </label>

              <div className="input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="login-options">

              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  alert("Please contact the system administrator to reset your password.")
                }
              >
                Forgot Password?
              </button>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
            >
              Sign In
            </button>

          </form>

          {/* Demo Account */}
          <div className="demo-account">
            <p>Demo Account</p>

            <div>
              <strong>Username:</strong> admin
            </div>

            <div>
              <strong>Password:</strong> admin123
            </div>
          </div>

          <div className="login-footer">
            <p>
              © 2026 IDSC Finance System
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;

