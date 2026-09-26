function Login({ onLogin }) {
  function handleSubmit(event) {
    event.preventDefault();
    onLogin();
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>IDSC Finance</h1>

        <p>Finance Management System</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter email"
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            required
          />

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;