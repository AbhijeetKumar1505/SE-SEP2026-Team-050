import { useForm } from 'react-hook-form'
import Field from '../../components/Field'
import FormModal from '../../components/FormModal'
import { EMAIL, required } from '../../utils/rules'

export default function AddMentorModal({ show, onClose, onAdd }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm()
  const submit = async (values) => {
    try {
      await onAdd(values)
      onClose()
    } catch (e) {
      setError('email', { message: e.message })
    }
  }
  return (
    <FormModal
      show={show}
      title="Add a mentor"
      submitLabel="Add mentor"
      busy={isSubmitting}
      onClose={onClose}
      onExited={() => reset()}
      onSubmit={handleSubmit(submit)}
    >
      <Field label="Full name" error={errors.name} {...register('name', required('Enter the mentor’s name.', 100))} />
      <Field
        label="Email"
        type="email"
        error={errors.email}
        {...register('email', { ...required('Enter an email.', 120), pattern: EMAIL })}
      />
      <Field
        label="Background"
        placeholder="e.g. Data Engineer · BS Data Science ’24"
        error={errors.headline}
        {...register('headline', required('Add a short background.', 120))}
      />
    </FormModal>
  )
}
