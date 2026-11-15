import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../api/auth'
import AuthLayout from '../../components/AuthLayout'
import Field from '../../components/Field'
import { EMAIL, required } from '../../utils/rules'

export default function ForgotPassword() {
  const [sent, setSent] = useState(null) // { email, link? }
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  return (
    <AuthLayout
      action={
        <Button as={Link} to="/login" variant="outline-primary">
          Log in
        </Button>
      }
    >
      <h1 className="h3">Forgot password?</h1>
      <p className="text-muted mb-4">Enter your institute email address and we’ll send you instructions to reset your password.</p>
      {sent ? (
        <Alert variant="success" className="mb-0">
          If an account exists for {sent.email}, a reset link is on its way.
          {sent.link && (
            <div className="mt-2">
              Prototype shortcut: <Link to={sent.link}>open the reset link</Link>
            </div>
          )}
        </Alert>
      ) : (
        <Form onSubmit={handleSubmit(async ({ email }) => setSent({ email, ...(await requestPasswordReset(email)) }))} noValidate>
          <Field
            label="Institute email"
            type="email"
            placeholder="Enter your institute email"
            error={errors.email}
            {...register('email', { ...required('Enter your email.', 120), pattern: EMAIL })}
          />
          <Button type="submit" className="w-100" disabled={isSubmitting}>
            Send reset link
          </Button>
        </Form>
      )}
      <p className="text-center mt-4 mb-0">
        <Link to="/login" className="fw-semibold text-decoration-none">
          ← Back to log in
        </Link>
      </p>
    </AuthLayout>
  )
}
