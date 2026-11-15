
import { useState } from 'react'
import './ForgotPassword.css'

function ForgotPassword({ onBackToLogin, onSubmit }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Please enter your institute email address.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    if (onSubmit) {
      onSubmit({ email: email.trim() })
    } else {
      setMessage(
        'Your request is ready. Password reset emails will work once the backend is connected.'
      )
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-icon">🔐</div>

        <h1>Forgot Password?</h1>
        <p className="forgot-password-description">
          Enter your registered institute email address. We will send you
          instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email">Institute Email</label>
          <input
            id="reset-email"
            type="email"
            placeholder="Enter your institute email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="forgot-error">{error}</p>}
          {message && <p className="forgot-success">{message}</p>}

          <button type="submit" className="forgot-submit-btn">
            Send Reset Link
          </button>
        </form>

        <button
          type="button"
          className="back-to-login-btn"
          onClick={onBackToLogin}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword
