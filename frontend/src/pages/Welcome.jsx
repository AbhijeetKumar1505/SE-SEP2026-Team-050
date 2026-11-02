
import './Welcome.css'

function Welcome({ onLogin, onSignup }) {
  return (
    <div className="welcome-page">
      <nav className="welcome-navbar">
        <div className="welcome-brand">
          <div className="welcome-logo">M</div>
          <strong>IITM BS Mentoring</strong>
        </div>

        <button className="welcome-login-btn" onClick={onLogin}>
          Log In
        </button>
      </nav>

      <main className="welcome-content">
        <div className="welcome-text">
          <span className="welcome-label">
            IITM BS MENTORING PLATFORM
          </span>

          <h1>
            Guidance that helps you
            <span> move forward.</span>
          </h1>

          <p>
            Connect with recent graduates and alumni who can help you
            navigate career decisions, explore opportunities and take
            your next steps with confidence.
          </p>

          <div className="welcome-actions">
            <button className="welcome-primary-btn" onClick={onSignup}>
              Get Started
            </button>

            <button className="welcome-secondary-btn" onClick={onLogin}>
              I already have an account
            </button>
          </div>

          <div className="welcome-note">
            For registered IITM BS students and approved mentors
          </div>
        </div>

        <div className="welcome-visual">
          <div className="welcome-visual-card">
            <div className="welcome-visual-icon">✦</div>
            <h3>Your next step starts with a conversation.</h3>
            <p>
              Learn from someone who has already walked a path
              you're exploring.
            </p>
            <div className="welcome-visual-footer">
              <span>Learn</span>
              <span>Connect</span>
              <span>Grow</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Welcome
