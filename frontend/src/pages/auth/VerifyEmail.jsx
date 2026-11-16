import { useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { resendVerification, verifyEmail } from '../../api/auth'
import AuthLayout from '../../components/AuthLayout'
import Loading from '../../components/Loading'
import { useAuth } from '../../context/useAuth'
import useFetch from '../../hooks/useFetch'

const loginLink = (
  <Button as={Link} to="/login" variant="outline-primary">
    Log in
  </Button>
)

function Icon({ name, tone }) {
  return <i className={`bi ${name} display-4 text-${tone}`} />
}

// "Check your inbox": shown right after sign-up, with a resend button.
export function VerifyPending() {
  const { state } = useLocation()
  const [link, setLink] = useState(state?.link)
  const [message, setMessage] = useState('')
  if (!state?.email) return <Navigate to="/signup" replace />

  const resend = async () => {
    const result = await resendVerification(state.email)
    setLink(result.link)
    setMessage('We sent the verification email again.')
  }

  return (
    <AuthLayout action={loginLink}>
      <div className="text-center">
        <Icon name="bi-envelope" tone="primary" />
        <h1 className="h3 mt-3">Check your inbox</h1>
        <p className="text-muted">We sent a verification link to your institute email. Click it to continue.</p>
        <div className="bg-body-tertiary border rounded p-3 mb-3">
          <div className="small text-muted">Email address</div>
          <strong>{state.email}</strong>
        </div>
        {message && <Alert variant="info">{message}</Alert>}
        <p className="small text-muted mb-2">Didn’t receive the email?</p>
        <Button className="w-100" onClick={resend}>
          Resend verification email
        </Button>
        {link && (
          <p className="small text-muted mt-3 mb-0">
            Prototype shortcut: <Link to={link}>open the verification link</Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}

// Opened from the email: verified, expired or invalid.
export function VerifyResult() {
  const { token } = useParams()
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [result] = useFetch(verifyEmail, token)
  if (!result) return <Loading />

  const resend = async () => {
    const { link } = await resendVerification(result.email)
    navigate('/verify-email', { state: { email: result.email, link } })
  }

  return (
    <AuthLayout action={loginLink}>
      <div className="text-center">
        {result.status === 'verified' && (
          <>
            <Icon name="bi-check-circle" tone="success" />
            <h1 className="h3 mt-3">Email verified</h1>
            <p className="text-muted">Your email address has been verified. Continue to complete your student profile.</p>
            <Button
              className="w-100"
              onClick={() => {
                setUser(result.user)
                navigate('/student/profile')
              }}
            >
              Continue to profile
            </Button>
          </>
        )}
        {result.status === 'expired' && (
          <>
            <Icon name="bi-exclamation-circle" tone="warning" />
            <h1 className="h3 mt-3">Verification link expired</h1>
            <p className="text-muted">This link is no longer valid. Request a new verification email.</p>
            <Button className="w-100" onClick={resend}>
              Request a new link
            </Button>
          </>
        )}
        {result.status === 'invalid' && (
          <>
            <Icon name="bi-exclamation-circle" tone="warning" />
            <h1 className="h3 mt-3">Unable to verify email</h1>
            <p className="text-muted">This link is invalid or has already been used.</p>
            <Button as={Link} to="/login" className="w-100">
              Back to log in
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
