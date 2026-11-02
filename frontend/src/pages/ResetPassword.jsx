
import { useState } from 'react'
import './ResetPassword.css'

function ResetPassword({ onReset, onBackToLogin }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (onReset) {
      onReset({ password })
    } else {
      setMessage('Password is ready to be updated once the backend is connected.')
    }
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-icon">🔐</div>

        <h1>Reset Password</h1>
        <p className="reset-password-description">
          Create a new password for your account.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <label className="show-password-option">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>

          {error && <p className="reset-error">{error}</p>}
          {message && <p className="reset-success">{message}</p>}

          <button type="submit" className="reset-submit-btn">
            Reset Password
          </button>
        </form>

        <button
          type="button"
          className="reset-back-btn"
          onClick={onBackToLogin}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  )
}

export default ResetPassword
