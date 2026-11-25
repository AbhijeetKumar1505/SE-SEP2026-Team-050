import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { PROBLEM_LIMITS as L } from '../constants/student'
import { showApiErrors } from '../utils/apiErrors'
import { optional, required } from '../utils/rules'
import Field from './Field'
import ProblemCoach from './ProblemCoach'
import TagPicker from './TagPicker'

const EMPTY = { problem: '', tags: [], goal: '', guidance: '' }
// The API's field names, and the form fields they belong to.
const API_FIELDS = { description: 'problem', tags: 'tags', desired_outcome: 'goal', guidance_preferences: 'guidance' }

// The problem form, for submitting a new problem and for editing one. coach shows the AI problem coach (S2).
export default function ProblemForm({ defaultValues = EMPTY, submitLabel, onSubmit, onCancel, coach = false }) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })
  const [formError, setFormError] = useState('')
  // A refusal from the API is shown on the form: field errors under their fields, anything else
  // (such as "You already have an open problem.") above them.
  const submit = async (values) => {
    setFormError('')
    try {
      await onSubmit(values)
    } catch (error) {
      setFormError(showApiErrors(error, setError, API_FIELDS))
    }
  }
  const problem = useWatch({ control, name: 'problem' })
  const tags = useWatch({ control, name: 'tags' })
  const length = problem.length
  // Suggested tags join the chosen ones, up to the limit.
  const addTags = (names) =>
    setValue('tags', [...tags, ...names.filter((n) => !tags.includes(n))].slice(0, L.tagsMax), { shouldValidate: true })
  return (
    <Form onSubmit={handleSubmit(submit)} noValidate>
      {formError && <Alert variant="danger">{formError}</Alert>}
      <Field
        label="Describe your problem"
        as="textarea"
        rows={5}
        error={errors.problem}
        {...register('problem', {
          ...required('Describe your problem.', L.descMax),
          minLength: { value: L.descMin, message: `Write at least ${L.descMin} characters so IIC can understand it.` },
        })}
      />
      <div className="form-text text-end mb-3">
        {length} / {L.descMax}
      </div>
      {coach && <ProblemCoach text={problem} selected={tags} onAdd={addTags} />}

      <div className="mb-3">
        <div className="form-label">Topics</div>
        <Controller
          name="tags"
          control={control}
          rules={{ validate: (v) => (v.length >= 1 && v.length <= L.tagsMax) || `Choose 1 to ${L.tagsMax} topics.` }}
          render={({ field, fieldState }) => (
            <TagPicker value={field.value} onChange={field.onChange} max={L.tagsMax} error={fieldState.error} />
          )}
        />
      </div>

      <Field
        label="What do you want to achieve?"
        as="textarea"
        rows={2}
        error={errors.goal}
        {...register('goal', required('Say what you want to achieve.', L.goalMax))}
      />
      <Field
        label="How do you like to be guided? (optional)"
        as="textarea"
        rows={2}
        error={errors.guidance}
        {...register('guidance', optional(L.guidanceMax))}
      />

      <div className="d-flex gap-2 justify-content-end">
        {onCancel && (
          <Button variant="light" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </Form>
  )
}
