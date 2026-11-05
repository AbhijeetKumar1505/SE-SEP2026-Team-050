import { Button, Card, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { activateAccount, getActivation } from '../api/mentor'
import BrandPanel from '../components/BrandPanel'
import Field from '../components/Field'
import Loading from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import useFetch from '../hooks/useFetch'
import { firstName } from '../utils/format'

// A4: public page opened from the activation email. Mentors never self-register.
export default function ActivateAccount() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [info] = useFetch(getActivation, token)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm()
  if (!info) return <Loading />

  const submit = async ({ password }) => {
    setUser(await activateAccount(token, password))
    navigate('/mentor/availability') // next: availability and preferred channel
  }

  return (
    <Row className="g-0 min-vh-100">
      <Col md={6} className="bg-primary text-white d-flex align-items-center justify-content-center p-5">
        <BrandPanel />
      </Col>
      <Col md={6} className="d-flex align-items-center justify-content-center p-4">
        <Card body style={{ maxWidth: 420 }} className="w-100">
          {info.valid ? (
            <>
              <h2 className="h4">Welcome, {firstName(info.name)}</h2>
              <p className="text-muted">
                {info.verifiedBy} (IIC) verified your mentor profile. Create a password to activate your account. Next, you’ll set your availability and preferred channel.
              </p>
              <form onSubmit={handleSubmit(submit)} noValidate>
                <Field
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.password}
                  {...register('password', { required: 'Create a password.', minLength: { value: 8, message: 'Use at least 8 characters.' } })}
                />
                <Field
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.confirm}
                  {...register('confirm', { validate: (v) => v === getValues('password') || 'The passwords don’t match.' })}
                />
                <Button type="submit" className="w-100" disabled={isSubmitting}>Activate my account</Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="h4">This link has expired</h2>
              <p className="text-muted mb-0">Ask IIC to resend your activation link.</p>
            </>
          )}
        </Card>
      </Col>
    </Row>
  )
}
