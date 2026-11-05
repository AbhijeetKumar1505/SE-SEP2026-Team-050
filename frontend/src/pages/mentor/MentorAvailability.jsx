import { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { getProfile, updateProfile } from '../../api/mentor'
import Field from '../../components/Field'
import Loading from '../../components/Loading'
import Section from '../../components/Section'
import Tags from '../../components/Tags'
import { CHANNELS } from '../../constants/mentor'
import useFetch from '../../hooks/useFetch'

export default function MentorAvailability() {
  const [profile, reload] = useFetch(getProfile)
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm({ values: profile ?? undefined })
  if (!profile) return <Loading />

  const save = async (values) => {
    await updateProfile(values)
    await reload()
    setSaved(true)
  }

  return (
    <>
      <h1 className="h3">Availability &amp; contact</h1>
      <p className="text-muted">IIC only assigns you students when you’re available.</p>
      <Row className="g-4">
        <Col lg={7}>
          <Section title="Availability and contact details">
            <Form onSubmit={handleSubmit(save)} noValidate>
              <Form.Check type="switch" id="available" label="Available for new students" {...register('available')} />
              <Form.Text className="d-block mb-4">When off, IIC can’t recommend or assign you students. Current mentorships continue.</Form.Text>

              <Field label="Preferred channel" options={CHANNELS} {...register('channel')} />
              <Field label="When are you free?" error={errors.availability} {...register('availability', { required: 'Tell mentees when you’re free.' })} />
              <Field label="Time zone" error={errors.timezone} {...register('timezone', { required: 'Enter your time zone.' })} />
              <Form.Text className="d-block mb-3">Contact details are shared only with students after you accept them. Email: {profile.email}</Form.Text>

              <Button type="submit" disabled={!isDirty || isSubmitting}>Save changes</Button>
              {saved && !isDirty && <span className="text-success ms-3"><i className="bi bi-check-circle me-1" />Saved</span>}
            </Form>
          </Section>
        </Col>
        <Col lg={5}>
          <Section title="Capacity">
            <p className="h3 mb-1">{profile.capacity} <small className="h6 text-muted">student{profile.capacity > 1 && 's'} at a time</small></p>
            <Form.Text>Set by IIC. IIC can only assign you a student while you have spare capacity.</Form.Text>
          </Section>
          <Section title="Your expertise">
            <p className="small text-muted">Set and verified by IIC.</p>
            <Tags tags={profile.expertise} />
            <ul className="small ps-3 mt-3 mb-0">
              {profile.experience.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </Section>
        </Col>
      </Row>
    </>
  )
}
