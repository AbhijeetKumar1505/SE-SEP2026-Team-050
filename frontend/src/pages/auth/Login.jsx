import { useState } from 'react'
import { Alert, Button, Form, InputGroup } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import AuthLayout from '../../components/AuthLayout'
import Field from '../../components/Field'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../constants/demo'
import { useAuth } from '../../context/useAuth'
import { EMAIL, required } from '../../utils/rules'

export default function Login() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const signIn = async (email, password) => {
    setError('')
    try {
      const user = await login(email, password)
      setUser(user)
      navigate(`/${user.role}`)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <AuthLayout
      action={
        <Button as={Link} to="/signup" variant="outline-primary">
          Create an account
        </Button>
      }
    >
      <h1 className="h3">Welcome back</h1>
      <p className="text-muted mb-4">Log in to continue your mentoring journey.</p>
      {state?.notice && <Alert variant="success">{state.notice}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit(({ email, password }) => signIn(email, password))} noValidate>
        <Field
          label="Institute email"
          type="email"
          placeholder="Enter your institute email"
          error={errors.email}
          {...register('email', { ...required('Enter your email.', 120), pattern: EMAIL })}
        />
        <div className="d-flex justify-content-between">
          <Form.Label htmlFor="login-password">Password</Form.Label>
          <Link to="/forgot-password" className="small fw-semibold text-decoration-none">
            Forgot password?
          </Link>
        </div>
        <InputGroup className="mb-3" hasValidation>
          <Form.Control
            id="login-password"
            type={show ? 'text' : 'password'}
            placeholder="Enter your password"
            isInvalid={!!errors.password}
            {...register('password', { required: 'Enter your password.' })}
          />
          <Button variant="outline-secondary" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
            <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} />
          </Button>
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </InputGroup>
        <Button type="submit" className="w-100" disabled={isSubmitting}>
          Log in
        </Button>
      </Form>
      <p className="text-center text-muted mt-4 mb-0">
        Don’t have an account?{' '}
        <Link to="/signup" className="fw-semibold text-decoration-none">
          Sign up
        </Link>
      </p>
      <div className="border-top mt-4 pt-3 small text-muted text-center">
        Prototype shortcuts, log in as:{' '}
        {DEMO_ACCOUNTS.map((a) => (
          <Button key={a.role} variant="link" size="sm" className="p-1" onClick={() => signIn(a.email, DEMO_PASSWORD)}>
            {a.label}
          </Button>
        ))}
      </div>
    </AuthLayout>
  )
}
