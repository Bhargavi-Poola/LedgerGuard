import './App.css'

function App() {
  return (
    <div className="app-container">
      <div className="login-card">
        <h1>LedgerGuard</h1>
        <p className="subtitle">Secure Multi-Tenant Billing Platform</p>

        <h2>Welcome Back</h2>
        <p className="description">Login to access your dashboard</p>

        <form>
          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" />

          <label>Password</label>
          <input type="password" placeholder="Enter your password" />

          <button type="button">Login</button>
        </form>

        <p className="register">
          Don't have an account? <a href="#">Register</a>
        </p>
      </div>
    </div>
  )
}

export default App