
import { useState } from 'react'
import './Signup.css'

function Signup({ onLogin, onBack ,onSubmit}) {
  const [rollNumber, setRollNumber] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!rollNumber.trim() || !email.trim()) {
      setError('Please enter both your roll number and institute email.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    // Actual IIC roster verification will be connected through Flask.
    if (onSubmit) {
  onSubmit({
    rollNumber: rollNumber.trim(),
    email: email.trim()
  })
} else {
  setMessage(
    'Your details are ready for verification. Backend verification is not connected yet.'
  )
}
  }

  return (
    <div className="signup-page">
      <nav className="signup-navbar">
        <div className="signup-brand">
          <div className="signup-logo">M</div>
          <strong>IITM BS Mentoring</strong>
        </div>

        <button
          className="signup-login-btn"
          onClick={onLogin}
          type="button"
        >
          Log In
        </button>
      </nav>

      <main className="signup-content">
        <div className="signup-card">
          <div className="signup-heading">
            <span className="signup-label">STUDENT REGISTRATION</span>
            <h1>Create your account</h1>
            <p>
              Enter your IITM BS registration details to get started
              with the mentoring platform.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="signup-field">
              <label htmlFor="rollNumber">Roll number</label>
              <input
                id="rollNumber"
                type="text"
                placeholder="Enter your IITM BS roll number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signupEmail">Institute email</label>
              <input
                id="signupEmail"
                type="email"
                placeholder="Enter your institute email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="signup-error">
                {error}
              </div>
            )}

            {message && (
              <div className="signup-message">
                {message}
              </div>
            )}

            <button type="submit" className="signup-submit-btn">
              Verify my details
            </button>
          </form>

          <div className="signup-footer">
            Already have an account?{' '}
            <button type="button" onClick={onLogin}>
              Log in
            </button>
          </div>

          <div className="signup-security-note">
            <span>🔒</span>
            Registration is available only to students registered
            with the IITM BS Mentoring Initiative.
          </div>

          {onBack && (
            <button
              type="button"
              className="signup-back-btn"
              onClick={onBack}
            >
              ← Back to welcome page
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export default Signup
