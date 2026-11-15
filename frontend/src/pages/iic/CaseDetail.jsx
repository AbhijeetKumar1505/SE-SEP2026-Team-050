import { useState } from 'react'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import AuditLog from '../../components/AuditLog'
import Details from '../../components/Details'
import Field from '../../components/Field'
import Section from '../../components/Section'
import { DECISIONS, FLAGS } from '../../constants/iic'
import { useAuth } from '../../context/useAuth'
import { dayOffset, fmtDate, hoursAgo } from '../../utils/format'
import { required } from '../../utils/rules'

const reasonRule = { ...required('A reason is required.', 500), minLength: { value: 10, message: 'Please give at least 10 characters.' } }

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
const CASES = {
  'C-014': {
    id: 'C-014',
    type: 'Change request',
    status: 'Open',
    student: 'Fatima Khan',
    mentor: 'Priya Natarajan',
    openedAt: hoursAgo(30),
    request: 'Change my mentor',
    reason: 'Our call times keep clashing and Priya is travelling next month, so we can’t keep a regular schedule.',
    mentorResponse: '',
    history: [
      { at: hoursAgo(30), text: 'Case opened by Fatima Khan' },
      { at: hoursAgo(120), text: 'System flagged feedback overdue' },
      { at: hoursAgo(600), text: 'Priya Natarajan accepted the assignment' },
    ],
    mentorship: {
      startedAt: dayOffset(-26),
      logged: 3,
      confirmed: 2,
      lastSession: dayOffset(-10),
      progress: 'Some progress',
      comment: '',
      flags: ['feedback'],
    },
  },
}

export default function CaseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [c, setC] = useState(CASES[id])
  const [decided, setDecided] = useState(null) // the decision's label, once recorded
  const response = useForm({ values: c ? { text: c.mentorResponse } : undefined })
  const decision = useForm()
  const chosen = useWatch({ control: decision.control, name: 'decision' })

  if (!c) {
    return (
      <p>
        This case wasn’t found. <Link to="/iic/monitoring">Back to monitoring</Link>
      </p>
    )
  }

  const m = c.mentorship
  const log = (text) => [{ at: new Date().toISOString(), text }, ...c.history]

  function saveResponse({ text }) {
    setC({ ...c, mentorResponse: text.trim(), history: log(`${user.name} recorded the mentor’s response`) })
  }

  // Both parties are notified once the API is connected. A decided case can't be decided again.
  function decide({ decision: value, reason }) {
    const label = DECISIONS.find((d) => d.value === value).label
    setC({ ...c, status: 'Decided', history: log(`${user.name} decided “${label}”: ${reason}`) })
    setDecided(label)
  }

  return (
    <>
      <Link to="/iic/monitoring" className="small text-decoration-none">
        <i className="bi bi-arrow-left me-1" />
        Monitoring
      </Link>
      <h1 className="h3 mt-3 mb-1">
        {c.type}: {c.student} and {c.mentor}
      </h1>
      <p className="text-muted">
        Case {c.id}, opened by {c.student} (student) on {fmtDate(c.openedAt)}
      </p>

      <Row className="g-4">
        <Col lg={7}>
          <Section title="Student’s submission">
            <p className="mb-1">
              <strong>Request:</strong> {c.request}
            </p>
            <p className="mb-0">{c.reason}</p>
          </Section>

          <Section title="Mentor’s side">
            <Form onSubmit={response.handleSubmit(saveResponse)} noValidate>
              <Field
                label="Recorded by IIC after speaking to the mentor"
                as="textarea"
                rows={3}
                error={response.formState.errors.text}
                {...response.register('text', required('Write what the mentor said.', 1000))}
              />
              <Button type="submit" variant="outline-primary" size="sm" disabled={!response.formState.isDirty}>
                Save response
              </Button>
            </Form>
          </Section>

          <Section title="Decision">
            {decided ? (
              <Alert variant="success" className="mb-0">
                <strong>Decision recorded: {decided}.</strong> Both parties have been notified.
              </Alert>
            ) : (
              <Form onSubmit={decision.handleSubmit(decide)} noValidate>
                {DECISIONS.map((d) => (
                  <Form.Check
                    key={d.value}
                    type="radio"
                    id={`decision-${d.value}`}
                    value={d.value}
                    className="mb-2"
                    label={
                      <>
                        <strong>{d.label}</strong>
                        <span className="d-block small text-muted">{d.hint}</span>
                      </>
                    }
                    {...decision.register('decision', { required: 'Choose a decision.' })}
                  />
                ))}
                {decision.formState.errors.decision && (
                  <div className="text-danger small mb-2">{decision.formState.errors.decision.message}</div>
                )}
                <Field
                  label="Reason"
                  as="textarea"
                  rows={3}
                  className="mt-3"
                  error={decision.formState.errors.reason}
                  {...decision.register('reason', reasonRule)}
                />
                <p className="small text-muted">Both parties are notified and the decision is logged.</p>
                <Button type="submit" variant={chosen === 'remove' ? 'danger' : 'primary'} disabled={decision.formState.isSubmitting}>
                  Record decision
                </Button>
              </Form>
            )}
          </Section>
        </Col>

        <Col lg={5}>
          {m && (
            <Section title="Mentorship at a glance">
              <Details
                items={[
                  ['Started', fmtDate(m.startedAt)],
                  ['Sessions', `${m.logged} logged · ${m.confirmed} confirmed`],
                  ['Last session', m.lastSession ? fmtDate(m.lastSession) : '—'],
                  ['Latest progress', m.progress ? `${m.progress}${m.comment ? `: ${m.comment}` : ''}` : '—'],
                  ['Flags', m.flags.map((f) => FLAGS[f].label).join(', ') || 'None'],
                ]}
              />
            </Section>
          )}
          <Section title="History">
            <AuditLog entries={c.history} />
          </Section>
        </Col>
      </Row>
    </>
  )
}
