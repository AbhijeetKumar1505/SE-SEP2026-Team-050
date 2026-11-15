import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PublicPage from '../components/PublicPage'
import { useAuth } from '../context/useAuth'
import { firstName } from '../utils/format'
import { required } from '../utils/rules'

// Sample invite for this page. The mentor pool passes the real name along when IIC opens the link.
const INVITE = { name: 'Imran Qureshi', verifiedBy: 'Deepa Krishnan' }

// A4: public page opened from the activation email. Mentors never self-register.
export default function ActivateAccount() {
  const { token } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const info = { ...(state ?? INVITE), valid: token !== 'expired' } // /activate/expired shows the expired message
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()

  // The password is checked and stored once the Flask API is connected.
  function submit() {
    setUser({ id: token, name: info.name, role: 'mentor' })
    navigate('/mentor/availability') // next: availability and preferred channel
  }

  if (!info.valid) {
    return <PublicPage title="This link has expired" intro="Ask IIC to resend your activation link." />
  }

  return (
    <PublicPage
      title={`Welcome, ${firstName(info.name)}`}
      intro={`${info.verifiedBy} (IIC) verified your mentor profile. Create a password to activate your account. Next, you’ll set your availability and preferred channel.`}
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="login-field">
          <label htmlFor="activate-password">Password</label>
          <input
            id="activate-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            {...register('password', {
              ...required('Create a password.', 128),
              minLength: { value: 8, message: 'Use at least 8 characters.' },
            })}
          />
          {errors.password && <p className="login-field-error">{errors.password.message}</p>}
        </div>
        <div className="login-field">
          <label htmlFor="activate-confirm">Confirm password</label>
          <input
            id="activate-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Enter the password again"
            aria-invalid={!!errors.confirm}
            {...register('confirm', { validate: (v) => v === getValues('password') || 'The passwords don’t match.' })}
          />
          {errors.confirm && <p className="login-field-error">{errors.confirm.message}</p>}
        </div>
        <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
          Activate my account
        </button>
      </form>
      <p className="login-security-note">Only mentors verified by IIC can activate an account.</p>
    </PublicPage>
  )
}
