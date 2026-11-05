import { useForm } from 'react-hook-form'
import Field from './Field'
import FormModal from './FormModal'

// Shared "give a reason" dialog: decline assignment, end mentorship, close problem...
// Extra props (title, submitLabel, variant) go to FormModal; children are the explanation.
export default function ReasonModal({ show, onClose, onConfirm, children, ...modalProps }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const submit = async ({ reason }) => {
    await onConfirm(reason.trim())
    onClose()
  }
  return (
    <FormModal show={show} onClose={onClose} onExited={() => reset()} busy={isSubmitting} variant="danger" onSubmit={handleSubmit(submit)} {...modalProps}>
      <div className="mb-3">{children}</div>
      <Field
        label="Reason"
        as="textarea"
        rows={3}
        error={errors.reason}
        {...register('reason', {
          required: 'A reason is required.',
          minLength: { value: 10, message: 'Please give at least 10 characters.' },
        })}
      />
    </FormModal>
  )
}
