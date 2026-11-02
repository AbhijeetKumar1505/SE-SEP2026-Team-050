
import { useState } from 'react'
import './Login.css'

function Login({ onLogin, onForgotPassword, onSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (onLogin) {
      onLogin({ email, password })
    }
  }

  return (
    <div className="login-page">
      <nav className="login-navbar">
        <div className="login-brand">
          <div className="login-logo">M</div>
          <strong>IITM BS Mentoring</strong>
        </div>

        <button className="login-signup-link" onClick={onSignup}>
          Create an account
        </button>
      </nav>

      <main className="login-container">
        <div className="login-card">
          <div className="login-heading">
            <h1>Welcome back</h1>
            <p>Log in to continue your mentoring journey.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Institute email</label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your institute email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-field">
              <div className="login-password-label">
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="login-forgot-btn"
                  onClick={onForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="login-show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit-btn">
              Log In
            </button>
          </form>

          <div className="login-bottom-text">
            Don't have an account?{' '}
            <button onClick={onSignup}>Sign up</button>
          </div>

          <p className="login-security-note">
            Access is available to registered and authorised platform users.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Login
