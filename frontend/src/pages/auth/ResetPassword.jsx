import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { resetPassword } from '../../api/auth'
import AuthLayout from '../../components/AuthLayout'
import Field from '../../components/Field'
import { required } from '../../utils/rules'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()

  const submit = async ({ password }) => {
    try {
      await resetPassword(token, password)
      navigate('/login', { state: { notice: 'Password updated. Log in with your new password.' } })
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
      <h1 className="h3">Reset password</h1>
      <p className="text-muted mb-4">Create a new password for your account.</p>
      {error && (
        <Alert variant="danger">
          {error} <Link to="/forgot-password">Request a new one.</Link>
        </Alert>
      )}
      <Form onSubmit={handleSubmit(submit)} noValidate>
        <Field
          label="New password"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          error={errors.password}
          {...register('password', {
            ...required('Enter a new password.', 128),
            minLength: { value: 8, message: 'Use at least 8 characters.' },
          })}
        />
        <Field
          label="Confirm password"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          error={errors.confirm}
          {...register('confirm', { validate: (v) => v === getValues('password') || 'The passwords don’t match.' })}
        />
        <Form.Check id="show-password" label="Show password" className="mb-3" checked={show} onChange={(e) => setShow(e.target.checked)} />
        <Button type="submit" className="w-100" disabled={isSubmitting}>
          Reset password
        </Button>
      </Form>
    </AuthLayout>
  )
}
