import { useState } from 'react'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getProfile, saveProfile } from '../../api/student'
import Field from '../../components/Field'
import Loading from '../../components/Loading'
import Pill from '../../components/Pill'
import Section from '../../components/Section'
import { INTERESTS, LEVELS } from '../../constants/student'
import useFetch from '../../hooks/useFetch'
import { required } from '../../utils/rules'

// S1: first-time setup (profile incomplete) and later edits.
export default function StudentProfile() {
  const navigate = useNavigate()
  const [profile, reload] = useFetch(getProfile)
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    values: profile && {
      level: profile.level ?? '',
      cgpa: profile.cgpa ?? '',
      courses: profile.courses ?? '',
      careerInterest: profile.careerInterest ?? '',
    },
  })
  if (!profile) return <Loading />

  const onboarding = !profile.complete
  const save = async (values) => {
    await saveProfile(values)
    if (onboarding) return navigate('/student')
    await reload()
    setSaved(true)
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3">{onboarding ? 'Complete your profile' : 'Your profile'}</h1>
          <p className="text-muted mb-0">
            {onboarding
              ? 'Add your academic and career information to get started with mentoring.'
              : 'Keep your academic and career information up to date so IIC can match you well.'}
          </p>
        </div>
        <Pill tone="primary">{onboarding ? 'Profile setup' : 'Student profile'}</Pill>
      </div>

      <Section title="Basic information">
        <Form onSubmit={handleSubmit(save)} noValidate>
          <Row>
            <Col md={6}>
              <Field label="Full name" value={profile.name} readOnly />
            </Col>
            <Col md={6}>
              <Field label="Roll number" value={profile.roll} readOnly />
            </Col>
            <Col md={6}>
              <Field
                label="Programme level"
                options={LEVELS}
                empty="Select level"
                error={errors.level}
                {...register('level', { required: 'Select your programme level.' })}
              />
            </Col>
            <Col md={6}>
              <Field
                label="CGPA"
                type="number"
                step="0.01"
                placeholder="Enter your CGPA"
                error={errors.cgpa}
                {...register('cgpa', {
                  required: 'Enter your CGPA.',
                  valueAsNumber: true,
                  min: { value: 0, message: 'CGPA must be between 0 and 10.' },
                  max: { value: 10, message: 'CGPA must be between 0 and 10.' },
                })}
              />
            </Col>
          </Row>
          <Field
            label="Completed courses"
            as="textarea"
            rows={3}
            placeholder="Course names, separated by commas"
            error={errors.courses}
            {...register('courses', required('Enter at least one completed course.', 500))}
          />
          <Field
            label="Primary career interest"
            options={INTERESTS}
            empty="Select your career interest"
            error={errors.careerInterest}
            {...register('careerInterest', { required: 'Select your career interest.' })}
          />
          <p className="small text-muted">Your CGPA is visible only to IIC.</p>
          {saved && !isDirty && <Alert variant="success">Profile saved.</Alert>}
          <div className="d-flex justify-content-end">
            <Button type="submit" disabled={isSubmitting || (!onboarding && !isDirty)}>
              {onboarding ? 'Complete profile & continue' : 'Save profile'}
            </Button>
          </div>
        </Form>
      </Section>
    </>
  )
}
