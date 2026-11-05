import { useForm, useWatch } from 'react-hook-form'
import Field from '../../../components/Field'
import FormModal from '../../../components/FormModal'
import { CHANNELS } from '../../../constants/mentor'
import { today } from '../../../utils/format'
import { LINK, optional } from '../../../utils/rules'

const DEFAULTS = { channel: CHANNELS[0] }

// The fields live in their own component so they register only while the dialog is open.
function SessionFields({ planned, session, form: { register, errors, control } }) {
  const channel = useWatch({ control, name: 'channel', defaultValue: session?.channel ?? DEFAULTS.channel })
  const dateRule = (d) => (planned ? d >= today() || 'Pick today or a later date.' : d <= today() || 'Pick today or an earlier date.')
  return (
    <>
      <Field label="Date" type="date" error={errors.date} {...register('date', { required: 'Choose a date.', validate: dateRule })} />
      {planned ? (
        <Field label="Time" type="time" error={errors.time} {...register('time', { required: 'Choose a time.' })} />
      ) : (
        <Field
          label="Duration (minutes)"
          type="number"
          error={errors.duration}
          {...register('duration', {
            required: 'Enter how long it lasted.',
            valueAsNumber: true,
            min: { value: 5, message: 'At least 5 minutes.' },
            max: { value: 480, message: 'At most 480 minutes.' },
            validate: (v) => Number.isInteger(v) || 'Enter a whole number.',
          })}
        />
      )}
      <Field label="Channel" options={CHANNELS} {...register('channel')} />
      {planned && channel === 'Google Meet' && (
        <Field
          label="Meeting link (optional)"
          type="url"
          placeholder="https://"
          error={errors.link}
          {...register('link', { ...optional(300), pattern: LINK })}
        />
      )}
      {!planned && (
        <Field
          label="Topic (optional)"
          placeholder="e.g. Learning plan and skills"
          error={errors.topic}
          {...register('topic', optional(100))}
        />
      )}
    </>
  )
}

// One dialog for scheduling (kind "planned") and logging (kind "held"), new or existing sessions.
export default function SessionModal({ show, title, submitLabel, kind, session, onClose, onSave }) {
  const planned = kind === 'planned'
  const form = useForm({
    shouldUnregister: true, // fields of the other kind are dropped
    values: session ?? DEFAULTS,
  })
  const submit = async (values) => {
    await onSave({ ...values, status: planned ? 'Planned' : 'Held' })
    onClose()
  }
  return (
    <FormModal
      show={show}
      title={title}
      submitLabel={submitLabel}
      busy={form.formState.isSubmitting}
      onClose={onClose}
      onExited={() => form.reset()}
      onSubmit={form.handleSubmit(submit)}
    >
      <SessionFields
        planned={planned}
        session={session}
        form={{ register: form.register, errors: form.formState.errors, control: form.control }}
      />
    </FormModal>
  )
}
