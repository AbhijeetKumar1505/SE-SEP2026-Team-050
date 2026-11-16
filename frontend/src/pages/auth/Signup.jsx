import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../../api/auth'
import AuthLayout from '../../components/AuthLayout'
import Field from '../../components/Field'
import { EMAIL, required } from '../../utils/rules'

const ROLL = { value: /^\d{2}f\d{7}$/i, message: 'Enter a valid roll number, like 23f1002345.' }

export default function Signup() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()

  const submit = async (values) => {
    setError('')
    try {
      const { email, link } = await signup(values)
      navigate('/verify-email', { state: { email, link } })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <AuthLayout
      action={
        <Button as={Link} to="/login" variant="outline-primary">
          Log in
        </Button>
      }
    >
      <div className="text-primary fw-bold small text-uppercase">Student registration</div>
      <h1 className="h3 mt-2">Create your account</h1>
      <p className="text-muted mb-4">Enter your IITM BS registration details to get started with the mentoring platform.</p>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit(submit)} noValidate>
        <Field
          label="Roll number"
          placeholder="Enter your IITM BS roll number"
          error={errors.rollNumber}
          {...register('rollNumber', { ...required('Enter your roll number.', 20), pattern: ROLL })}
        />
        <Field
          label="Institute email"
          type="email"
          placeholder="Enter your institute email"
          error={errors.email}
          {...register('email', { ...required('Enter your institute email.', 120), pattern: EMAIL })}
        />
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
          Verify my details
        </Button>
      </Form>
      <p className="text-center text-muted mt-4 mb-0">
        Already have an account?{' '}
        <Link to="/login" className="fw-semibold text-decoration-none">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
