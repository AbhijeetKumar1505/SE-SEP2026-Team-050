import { Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import FormModal from '../../../components/FormModal'
import { PROGRESS } from '../../../constants/mentor'

// Progress checkpoint: three values, no rating. Only IIC sees the answer.
export default function ProgressModal({ show, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const submit = async ({ progress }) => {
    await onSave(progress)
    onClose()
  }
  return (
    <FormModal show={show} title="How is the mentorship going?" submitLabel="Send to IIC" busy={isSubmitting} onClose={onClose} onExited={() => reset()} onSubmit={handleSubmit(submit)}>
      <p className="small text-muted">Only IIC sees this. There is no rating, just where things stand.</p>
      {PROGRESS.map((p) => (
        <Form.Check key={p} type="radio" id={p} label={p} value={p} {...register('progress', { required: 'Choose one option.' })} />
      ))}
      {errors.progress && <div className="text-danger small mt-2">{errors.progress.message}</div>}
    </FormModal>
  )
}
