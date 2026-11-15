import { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useForm, useWatch } from 'react-hook-form'
import Field from '../../components/Field'
import Section from '../../components/Section'
import Tags from '../../components/Tags'
import { CHANNELS, CONTACT } from '../../constants/mentor'
import { required } from '../../utils/rules'

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
const PROFILE = {
  available: true,
  channel: 'Google Meet',
  contact: 'rahul.menon@example.com',
  availability: 'Weekday evenings',
  timezone: 'IST (UTC+05:30)',
  capacity: 3, // read-only: IIC sets it
  expertise: ['Data engineering', 'SQL and database design', 'Python programming', 'Job search strategy'], // read-only: IIC sets it
  experience: ['Data Engineer · 2 years', 'Analytics intern · 6 months', 'Real-time pipeline with Kafka · 3 months'],
}

export default function MentorAvailability() {
  const [profile, setProfile] = useState(PROFILE)
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ values: profile })
  const channel = useWatch({ control, name: 'channel' })

  function save(values) {
    const { capacity, expertise, experience } = profile // IIC sets these; the mentor can't change them
    setProfile({ ...values, capacity, expertise, experience })
    setSaved(true)
  }

  return (
    <>
      <h1 className="h3 mb-4">Availability &amp; contact</h1>
      <Row className="g-4">
        <Col lg={7}>
          <Section title="Availability and contact details">
            <Form onSubmit={handleSubmit(save)} noValidate>
              <Form.Check type="switch" id="available" label="Available for new students" {...register('available')} />
              <Form.Text className="d-block mb-4">When off, IIC can’t assign you new students. Current mentorships continue.</Form.Text>

              <Field label="Preferred channel" options={CHANNELS} {...register('channel')} />
              <Field
                label="Contact details"
                placeholder={CONTACT[channel]?.hint}
                error={errors.contact}
                {...register('contact', { ...required('Enter your contact details.', 120), pattern: CONTACT[channel]?.pattern })}
              />
              <Field
                label="When are you free?"
                error={errors.availability}
                {...register('availability', required('Tell mentees when you’re free.', 100))}
              />
              <Field label="Time zone" error={errors.timezone} {...register('timezone', required('Enter your time zone.', 60))} />
              <Form.Text className="d-block mb-3">Shared with a student once you accept them.</Form.Text>

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
        </Col>
        <Col lg={5}>
          <Section title="Capacity">
            <p className="h3 mb-0">
              {profile.capacity} <small className="h6 text-muted">student{profile.capacity > 1 && 's'} at a time</small>
            </p>
          </Section>
          <Section title="Your expertise">
            <Tags tags={profile.expertise} />
            <ul className="small ps-3 mt-3 mb-0">
              {profile.experience.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Section>
        </Col>
      </Row>
    </>
  )
}
