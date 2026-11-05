import { Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { optional, required } from '../utils/rules'
import Field from './Field'
import FormModal from './FormModal'

// "Give a reason" dialog. Without `reasons` it asks for a free-text reason: onConfirm(text).
// With `reasons` it shows those options plus an optional note: onConfirm(reason, note).
// Extra props (title, submitLabel, variant) go to FormModal; children are the explanation.
export default function ReasonModal({ show, onClose, onConfirm, reasons, noteLabel = 'Note for IIC (optional)', children, ...modalProps }) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()
  const submit = async ({ reason, note }) => {
    await onConfirm(reason, note?.trim())
    onClose()
  }
  return (
    <FormModal
      show={show}
      onClose={onClose}
      onExited={() => reset()}
      busy={isSubmitting}
      variant="danger"
      onSubmit={handleSubmit(submit)}
      {...modalProps}
    >
      {children && <div className="mb-3">{children}</div>}
      {reasons ? (
        <>
          <Form.Label>Reason</Form.Label>
          {reasons.map((r, i) => (
            <Form.Check
              key={r}
              type="radio"
              id={`reason-${i}`}
              label={r}
              value={r}
              {...register('reason', { required: 'Choose a reason.' })}
            />
          ))}
          {errors.reason && <div className="text-danger small mt-1">{errors.reason.message}</div>}
          <Field
            label={noteLabel}
            as="textarea"
            rows={2}
            className="mt-3"
            error={errors.note}
            {...register('note', {
              ...optional(500),
              validate: (v) => getValues('reason') !== 'Other' || !!v.trim() || 'Add a few words for “Other”.',
            })}
          />
        </>
      ) : (
        <Field
          label="Reason"
          as="textarea"
          rows={3}
          error={errors.reason}
          {...register('reason', {
            ...required('A reason is required.', 500),
            minLength: { value: 10, message: 'Please give at least 10 characters.' },
          })}
        />
      )}
    </FormModal>
  )
}
