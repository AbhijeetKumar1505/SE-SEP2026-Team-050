import { Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { activateAccount, getActivation } from '../api/mentor'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import Loading from '../components/Loading'
import { useAuth } from '../context/useAuth'
import useFetch from '../hooks/useFetch'
import { firstName } from '../utils/format'
import { required } from '../utils/rules'

// A4: public page opened from the activation email. Mentors never self-register.
export default function ActivateAccount() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [info] = useFetch(getActivation, token)
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()
  if (!info) return <Loading />

  const submit = async ({ password }) => {
    setUser(await activateAccount(token, password))
    navigate('/mentor/availability') // next: availability and preferred channel
  }

  return (
    <AuthLayout
      action={
        <Button as={Link} to="/login" variant="outline-primary">
          Log in
        </Button>
      }
    >
      {info.valid ? (
        <>
          <h1 className="h3">Welcome, {firstName(info.name)}</h1>
          <p className="text-muted mb-4">
            {info.verifiedBy} (IIC) verified your mentor profile. Create a password to activate your account. Next, you’ll set your
            availability and preferred channel.
          </p>
          <Form onSubmit={handleSubmit(submit)} noValidate>
            <Field
              label="Password"
              type="password"
              autoComplete="new-password"
              error={errors.password}
              {...register('password', {
                ...required('Create a password.', 128),
                minLength: { value: 8, message: 'Use at least 8 characters.' },
              })}
            />
            <Field
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={errors.confirm}
              {...register('confirm', { validate: (v) => v === getValues('password') || 'The passwords don’t match.' })}
            />
            <Button type="submit" className="w-100" disabled={isSubmitting}>
              Activate my account
            </Button>
          </Form>
        </>
      ) : (
        <>
          <h1 className="h3">This link has expired</h1>
          <p className="text-muted mb-0">Ask IIC to resend your activation link.</p>
        </>
      )}
    </AuthLayout>
  )
}
