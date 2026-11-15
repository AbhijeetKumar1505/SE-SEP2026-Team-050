import { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import Field from '../../../components/Field'
import Section from '../../../components/Section'
import { TIMING_FIELDS } from '../../../constants/iic'

export default function TimingForm({ values, onSave }) {
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ values })
  const save = async (v) => {
    await onSave(v)
    setSaved(true)
  }
  return (
    <Section title="Timing windows and mentor capacity">
      <Form onSubmit={handleSubmit(save)} noValidate>
        <Row>
          {TIMING_FIELDS.map(({ name, label, unit, max }) => (
            <Col md={6} key={name}>
              <Field
                label={`${label} (${unit})`}
                type="number"
                error={errors[name]}
                {...register(name, {
                  valueAsNumber: true,
                  required: 'Enter a number.',
                  min: { value: 1, message: 'Must be at least 1.' },
                  max: { value: max, message: `Must be at most ${max}.` },
                  validate: {
                    whole: (v) => Number.isInteger(v) || 'Enter a whole number.',
                    reminder: (v) =>
                      name !== 'reminderHours' || v < getValues('acceptHours') || 'Must be shorter than the response window.',
                  },
                })}
              />
            </Col>
          ))}
        </Row>
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          Save changes
        </Button>
        {saved && !isDirty && (
          <span className="text-success ms-3">
            <i className="bi bi-check-circle me-1" />
            Saved
          </span>
        )}
      </Form>
    </Section>
  )
}
