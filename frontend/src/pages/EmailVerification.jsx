
import { useState } from 'react'
import './EmailVerification.css'

function EmailVerification({
  email = 'your institute email',
  verificationStatus = 'pending',
  onResend,
  onLogin,
  onContinue
}) {
  const [resendMessage, setResendMessage] = useState('')

  function handleResend() {
    setResendMessage('')

    if (onResend) {
      onResend()
    } else {
      setResendMessage(
        'The resend action will be connected to the backend.'
      )
    }
  }

  return (
    <div className="verification-page">
      <nav className="verification-navbar">
        <div className="verification-brand">
          <div className="verification-logo">M</div>
          <strong>IITM BS Mentoring</strong>
        </div>

        <button
          type="button"
          className="verification-login-btn"
          onClick={onLogin}
        >
          Log In
        </button>
      </nav>

      <main className="verification-content">
        <div className="verification-card">

          {verificationStatus === 'pending' ? (
            <>
              <div className="verification-icon email-icon">
                ✉
              </div>

              <span className="verification-label">
                EMAIL VERIFICATION
              </span>

              <h1>Check your inbox</h1>

              <p className="verification-description">
                We've initiated the email verification process
                for your account. Please check your institute
                email and click the verification link to continue.
              </p>

              <div className="verification-email-box">
                <span>Email address</span>
                <strong>{email}</strong>
              </div>

              <div className="verification-instructions">
                <strong>What should you do next?</strong>
                <ol>
                  <li>Open the verification email.</li>
                  <li>Click the verification link.</li>
                  <li>Continue to complete your student profile.</li>
                </ol>
              </div>

              <p className="verification-resend-text">
                Didn't receive the email?
              </p>

              <button
                type="button"
                className="verification-primary-btn"
                onClick={handleResend}
              >
                Resend verification email
              </button>

              {resendMessage && (
                <div className="verification-info">
                  {resendMessage}
                </div>
              )}
            </>
          ) : verificationStatus === 'expired' ? (
            <>
              <div className="verification-icon expired-icon">
                !
              </div>

              <span className="verification-label">
                LINK EXPIRED
              </span>

              <h1>Verification link expired</h1>

              <p className="verification-description">
                This verification link is no longer valid.
                Please request a new verification email.
              </p>

              <button
                type="button"
                className="verification-primary-btn"
                onClick={handleResend}
              >
                Request a new link
              </button>

              {resendMessage && (
                <div className="verification-info">
                  {resendMessage}
                </div>
              )}
            </>
          ) : verificationStatus === 'invalid' ? (
            <>
              <div className="verification-icon expired-icon">
                !
              </div>

              <span className="verification-label">
                INVALID LINK
              </span>

              <h1>Unable to verify email</h1>

              <p className="verification-description">
                This verification link is invalid or has already
                been used. Please request a new verification email.
              </p>

              <button
                type="button"
                className="verification-primary-btn"
                onClick={handleResend}
              >
                Request a new link
              </button>

              {resendMessage && (
                <div className="verification-info">
                  {resendMessage}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="verification-icon success-icon">
                ✓
              </div>

              <span className="verification-label">
                EMAIL VERIFIED
              </span>

              <h1>Email verified successfully!</h1>
              <button
  type="button"
  className="verification-primary-btn"
  onClick={onContinue}
>
  Continue to profile
</button>

              <p className="verification-description">
                Your email address has been verified.
                You can now continue to complete your student profile.
              </p>
            </>
          )}

          <div className="verification-footer">
            <button
              type="button"
              onClick={onLogin}
            >
              ← Back to Login
            </button>
          </div>

          <div className="verification-security-note">
            🔒 Your account verification helps ensure that
            only eligible students access the platform.
          </div>

        </div>
      </main>
    </div>
  )
}

export default EmailVerification
