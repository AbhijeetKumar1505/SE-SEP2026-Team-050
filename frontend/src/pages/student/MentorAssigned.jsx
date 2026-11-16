import { useState } from 'react'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { markReachedOut } from '../../api/student'
import Details from '../../components/Details'
import Field from '../../components/Field'
import Pill from '../../components/Pill'
import Section from '../../components/Section'
import Tags from '../../components/Tags'
import { useAuth } from '../../context/useAuth'
import { firstMessage } from '../../constants/student'
import { firstName, fmtDate, initials } from '../../utils/format'
import { required } from '../../utils/rules'

// S4: the mentor accepted. The student writes first, on the mentor's preferred channel.
export default function MentorAssigned({ m, reload }) {
  const { user } = useAuth()
  const { mentor } = m
  const [copied, setCopied] = useState(false)
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      message: firstMessage({
        mentor: firstName(mentor.name),
        student: firstName(user.name),
        topics: m.topics.join(', ').toLowerCase(),
        channel: mentor.channel,
      }),
    },
  })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getValues('message'))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <h1 className="h3">Your mentor is ready</h1>
      <p className="text-muted mb-4">
        {firstName(mentor.name)} accepted on {fmtDate(m.startedAt)}. You make the first contact, on their preferred channel.
      </p>
      <Alert variant="info">
        <strong>Mentor assigned: you reach out first.</strong> Send the message below yourself. The platform never contacts your mentor for
        you.
      </Alert>

      <Row className="g-4">
        <Col lg={7}>
          <Section title="Your mentor" action={<Pill tone="success">Verified by IIC</Pill>}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="avatar">{initials(mentor.name)}</span>
              <div>
                <h2 className="h5 mb-0">{mentor.name}</h2>
                <div className="text-muted">{mentor.headline}</div>
              </div>
            </div>
            <Details
              items={[
                ['Preferred channel', mentor.channel],
                ['Contact', mentor.contact],
                ['Availability', mentor.availability],
                ['Time zone', mentor.timezone],
              ]}
            />
            <div className="fw-semibold mt-4 mb-2">Expertise</div>
            <Tags tags={mentor.expertise} />
            <div className="fw-semibold mt-4 mb-2">Experience</div>
            <ul className="ps-3 mb-0">
              {mentor.experience.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Section>
        </Col>
        <Col lg={5}>
          <Section title="Your first message">
            <Form
              onSubmit={handleSubmit(async () => {
                await markReachedOut(m.id)
                reload()
              })}
              noValidate
            >
              <p className="text-muted">Edit it, copy it and send it yourself.</p>
              <Field
                label="Message"
                as="textarea"
                rows={9}
                error={errors.message}
                {...register('message', required('Write a message.', 1000))}
              />
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={copy}>
                  {copied ? 'Copied' : 'Copy message'}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  I have reached out
                </Button>
              </div>
              <p className="small text-muted mt-3 mb-0">This records today’s date. Your mentor and IIC can see it.</p>
            </Form>
          </Section>
        </Col>
      </Row>
    </>
  )
}
