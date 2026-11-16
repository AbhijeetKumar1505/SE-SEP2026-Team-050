import { Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import Field from '../../components/Field'
import FormModal from '../../components/FormModal'
import { CASE_TYPES } from '../../constants/student'
import { required } from '../../utils/rules'

// S7: ask IIC to change or end the mentorship. IIC decides.
export default function CaseModal({ show, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()
  const submit = async ({ request, reason }) => {
    await onSave(request, reason.trim())
    onClose()
  }
  return (
    <FormModal
      show={show}
      title="Change or end mentorship"
      submitLabel="Send to IIC"
      variant="danger"
      busy={isSubmitting}
      onClose={onClose}
      onExited={() => reset()}
      onSubmit={handleSubmit(submit)}
    >
      <p className="text-muted">IIC will review your request and decide. Your mentor isn’t notified until then.</p>
      {CASE_TYPES.map((t, i) => (
        <Form.Check
          key={t}
          type="radio"
          id={`case-${i}`}
          label={t}
          value={t}
          {...register('request', { required: 'Choose what you’d like to do.' })}
        />
      ))}
      {errors.request && <div className="text-danger small mt-1">{errors.request.message}</div>}
      <Field
        label="Tell IIC what happened"
        as="textarea"
        rows={3}
        className="mt-3"
        error={errors.reason}
        {...register('reason', {
          ...required('Tell IIC what happened.', 500),
          minLength: { value: 10, message: 'Please give at least 10 characters.' },
        })}
      />
    </FormModal>
  )
}
