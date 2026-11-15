import { useForm } from 'react-hook-form'
import Field from '../../components/Field'
import FormModal from '../../components/FormModal'
import { PROBLEM_LIMITS } from '../../constants/student'
import { required } from '../../utils/rules'

export default function GoalModal({ show, goal, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ values: { goal } })
  const submit = async (values) => {
    await onSave(values.goal.trim())
    onClose()
  }
  return (
    <FormModal
      show={show}
      title="Edit your goal"
      submitLabel="Save goal"
      busy={isSubmitting}
      onClose={onClose}
      onExited={() => reset()}
      onSubmit={handleSubmit(submit)}
    >
      <Field
        label="What do you want to achieve?"
        as="textarea"
        rows={3}
        error={errors.goal}
        {...register('goal', {
          ...required('Write your goal.', PROBLEM_LIMITS.goalMax),
          minLength: { value: 10, message: 'Write at least 10 characters.' },
        })}
      />
    </FormModal>
  )
}
