import { useState } from 'react'
import { Alert, Nav } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import Field from '../../../components/Field'
import FormModal from '../../../components/FormModal'
import { CHANNELS } from '../../../constants/mentor'
import { today } from '../../../utils/format'

// Schedule an upcoming session or log one that already happened.
export default function LogSessionModal({ show, onClose, onSave }) {
  const [planned, setPlanned] = useState(true)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ shouldUnregister: true })
  const dateRule = (d) => (planned ? d > today() || 'Pick a future date.' : d <= today() || 'Pick today or an earlier date.')
  const submit = async (values) => {
    await onSave({ status: planned ? 'Planned' : 'Held', ...values })
    onClose()
  }
  return (
    <FormModal show={show} title="Log a session" submitLabel={planned ? 'Schedule session' : 'Save session'} busy={isSubmitting} onClose={onClose} onExited={() => reset()} onSubmit={handleSubmit(submit)}>
      <Alert variant="light" className="small border">
        Record when you met, not what was said. There is no field for what was discussed; conversations stay confidential.
      </Alert>
      <Nav variant="tabs" activeKey={planned ? 'schedule' : 'log'} onSelect={(key) => setPlanned(key === 'schedule')} className="mb-3">
        <Nav.Link eventKey="schedule">Schedule upcoming</Nav.Link>
        <Nav.Link eventKey="log">Log a past session</Nav.Link>
      </Nav>

      <Field label="Date" type="date" error={errors.date} {...register('date', { required: 'Choose a date.', validate: dateRule })} />
      {planned ? (
        <Field label="Time" type="time" error={errors.time} {...register('time', { required: 'Choose a time.' })} />
      ) : (
        <Field
          label="Duration (minutes)"
          type="number"
          error={errors.duration}
          {...register('duration', { required: 'Enter how long it lasted.', valueAsNumber: true, min: { value: 5, message: 'At least 5 minutes.' } })}
        />
      )}
      <Field label="Channel" options={CHANNELS} {...register('channel')} />
      {planned ? (
        <Field label="Meeting link (optional)" type="url" placeholder="https://" {...register('link')} />
      ) : (
        <Field label="Topic (optional)" placeholder="e.g. Learning plan and skills" {...register('topic')} />
      )}
    </FormModal>
  )
}
