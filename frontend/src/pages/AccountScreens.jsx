import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DEMO_USERS, useAuth } from '../context/useAuth'
import EmailVerification from './EmailVerification'
import ForgotPassword from './ForgotPassword'
import Login from './Login'
import ResetPassword from './ResetPassword'
import Signup from './Signup'
import StudentProfile from './StudentProfile'
import Welcome from './Welcome'
import './AccountScreens.css'

// Khushi's account pages take callbacks; these wrappers turn them into routes.
// Actions that need the API show the same notices as her original App.jsx.

export function WelcomeScreen() {
  const navigate = useNavigate()
  return <Welcome onLogin={() => navigate('/login')} onSignup={() => navigate('/signup')} />
}

export function LoginScreen() {
  const navigate = useNavigate()
  return (
    <Login
      onLogin={() => alert('Backend authentication is not connected yet.')}
      onSignup={() => navigate('/signup')}
      onForgotPassword={() => navigate('/forgot-password')}
    />
  )
}

export function ForgotPasswordScreen() {
  const navigate = useNavigate()
  return (
    <ForgotPassword
      onBackToLogin={() => navigate('/login')}
      onSubmit={({ email }) => alert(`Password reset instructions will be sent to ${email} once the backend is connected.`)}
    />
  )
}

export function ResetPasswordScreen() {
  const navigate = useNavigate()
  return <ResetPassword onBackToLogin={() => navigate('/login')} onReset={() => alert('Password reset will be connected through Flask.')} />
}

export function SignupScreen() {
  const navigate = useNavigate()
  return (
    <Signup
      onLogin={() => navigate('/login')}
      onBack={() => navigate('/welcome')}
      onSubmit={({ email }) => navigate('/verify-email', { state: { email } })}
    />
  )
}

export function EmailVerificationScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { setUser } = useAuth()
  const [status, setStatus] = useState('pending') // 'verified' once the emailed link is opened
  return (
    <>
      <EmailVerification
        email={state?.email ?? ''}
        verificationStatus={status}
        onLogin={() => navigate('/login')}
        onResend={() => alert('Email sending will be connected through Flask.')}
        onContinue={() => {
          setUser(DEMO_USERS.student) // mock only: in M3 the verification link signs the student in
          navigate('/student/onboarding')
        }}
      />
      {status === 'pending' && (
        <div className="prototype-action verify-prototype">
          <small>PROTOTYPE</small>
          <button type="button" onClick={() => setStatus('verified')}>
            Open the verification link
          </button>
        </div>
      )}
    </>
  )
}

export function StudentOnboardingScreen() {
  const navigate = useNavigate()
  return <StudentProfile mode="onboarding" onComplete={() => navigate('/student/problem/new')} /> // S1 → S2
}
