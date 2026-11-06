import { Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import Field from '../../../components/Field'
import FormModal from '../../../components/FormModal'
import { PROGRESS } from '../../../constants/mentor'
import { optional } from '../../../utils/rules'

// Progress checkpoint: three options and an optional comment. Only IIC sees the answer.
export default function ProgressModal({ show, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()
  const submit = async ({ progress, comment }) => {
    await onSave(progress, comment.trim())
    onClose()
  }
  return (
    <FormModal
      show={show}
      title="Progress feedback"
      submitLabel="Send to IIC"
      busy={isSubmitting}
      onClose={onClose}
      onExited={() => reset()}
      onSubmit={handleSubmit(submit)}
    >
      <p className="small text-muted">How is the mentorship going? Only IIC sees this.</p>
      {PROGRESS.map((p) => (
        <Form.Check key={p} type="radio" id={p} label={p} value={p} {...register('progress', { required: 'Choose one option.' })} />
      ))}
      {errors.progress && <div className="text-danger small mt-1">{errors.progress.message}</div>}
      <Field
        label="Comment (optional)"
        as="textarea"
        rows={3}
        className="mt-3"
        error={errors.comment}
        {...register('comment', optional(500))}
      />
    </FormModal>
  )
}
