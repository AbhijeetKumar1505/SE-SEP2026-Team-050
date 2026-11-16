import { useState } from 'react'
import { Alert, Button, Col, ListGroup, Row } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { summariseMentorship } from '../../api/ai'
import { getMentorshipReview, resolveWellbeingFlag } from '../../api/iic'
import AuditLog from '../../components/AuditLog'
import Details from '../../components/Details'
import Loading from '../../components/Loading'
import Pill from '../../components/Pill'
import Section from '../../components/Section'
import StatusBadge from '../../components/StatusBadge'
import useFetch from '../../hooks/useFetch'
import { fmtDate } from '../../utils/format'

// I8: one mentorship's feedback from both sides for IIC, with an AI summary and the AI wellbeing flag.
// The AI reads feedback comments and session dates only. Sessions never record what was discussed.

const PROGRESS_TONE = { 'No progress': 'danger', 'Some progress': 'warning', 'Goal met': 'success' }

export default function MentorshipReview() {
  const { id } = useParams()
  const [m, reload] = useFetch(getMentorshipReview, id)
  const [summary, setSummary] = useState(null) // null | 'writing' | { summary, feedbackCount }
  const [error, setError] = useState('')
  if (!m) return <Loading />

  const { flag } = m
  const flagOpen = flag?.status === 'open'
  const held = m.sessions.filter((s) => s.status === 'Held')
  const latest = m.feedback[0]

  const summarise = () => {
    setSummary('writing')
    setError('')
    summariseMentorship(id)
      .then(setSummary)
      .catch((e) => {
        setSummary(null)
        setError(e.message)
      })
  }
  const closeFlag = (outcome) =>
    resolveWellbeingFlag(id, outcome)
      .then(() => {
        setSummary(null) // a summary written before mentions the open flag
        return reload()
      })
      .catch((e) => setError(e.message))

  return (
    <>
      <Link to="/iic/monitoring" className="small text-decoration-none">
        <i className="bi bi-arrow-left me-1" />
        Monitoring
      </Link>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 my-3">
        <div>
          <h1 className="h3 mb-1">
            {m.student} → {m.mentor}
          </h1>
          <p className="text-muted mb-0">Active since {fmtDate(m.startedAt)}</p>
        </div>
        {m.caseId && (
          <Button as={Link} to={`/iic/cases/${m.caseId}`} variant="outline-primary">
            Open case {m.caseId}
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {flagOpen && (
        <Alert variant="warning">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              <strong>
                <i className="bi bi-stars me-1" />
                Wellbeing check (AI): a comment from {m.student} may need attention
              </strong>
              <p className="mb-1 mt-2 fst-italic">“{flag.quote}”</p>
              <p className="small mb-0">Why it was flagged: {flag.why}</p>
            </div>
            <div className="d-flex gap-2">
              <Button size="sm" variant="warning" onClick={() => closeFlag('reviewed')}>
                I’ll follow up
              </Button>
              <Button size="sm" variant="outline-secondary" onClick={() => closeFlag('dismissed')}>
                Not a concern
              </Button>
            </div>
          </div>
          <p className="small mb-0 mt-3 border-top border-warning-subtle pt-2">
            The AI only points IIC to comments worth reading. It doesn’t diagnose anything, contact the student or change the mentorship. If
            you’re worried, follow the programme’s wellbeing referral process.
          </p>
        </Alert>
      )}
      {flag && !flagOpen && (
        <Alert variant="secondary" className="small">
          Wellbeing flag {flag.status === 'reviewed' ? 'reviewed: you’ll follow up' : 'closed as not a concern'}. It’s recorded in the
          history.
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={7}>
          <Section
            title="AI summary"
            action={
              (summary === null || summary === 'writing') && (
                <Button size="sm" variant="outline-primary" disabled={summary === 'writing'} onClick={summarise}>
                  <i className="bi bi-stars me-1" />
                  {summary === 'writing' ? 'Summarising…' : 'Summarise with AI'}
                </Button>
              )
            }
          >
            {summary?.summary ? (
              <>
                <p className="mb-2">{summary.summary}</p>
                <p className="small text-muted mb-0">
                  Based on {summary.feedbackCount} feedback {summary.feedbackCount === 1 ? 'entry' : 'entries'} and the session dates. AI
                  can be wrong, so read the feedback below before acting.
                </p>
              </>
            ) : (
              <p className="small text-muted mb-0">
                Summarises the feedback from both sides and the session pattern. Only feedback comments and session dates are sent to the
                AI.
              </p>
            )}
          </Section>

          <Section title={`Feedback (${m.feedback.length})`}>
            {m.feedback.length === 0 && <p className="text-muted mb-0">No feedback yet.</p>}
            <ListGroup variant="flush">
              {m.feedback.map((f) => {
                const flagged = flagOpen && flag.feedbackId === f.id
                return (
                  <ListGroup.Item key={f.id} className={flagged ? 'px-3 bg-warning-subtle rounded border-0' : 'px-0'}>
                    <div className="d-flex flex-wrap justify-content-between gap-2 mb-1">
                      <span className="small">
                        <strong>{f.from === 'Student' ? m.student : m.mentor}</strong>
                        <span className="text-muted">
                          {' '}
                          · {f.from.toLowerCase()} · {fmtDate(f.date)}
                        </span>
                      </span>
                      <span className="d-flex gap-1">
                        {flagged && <Pill tone="warning">Flagged by AI</Pill>}
                        <Pill tone={PROGRESS_TONE[f.progress]}>{f.progress}</Pill>
                      </span>
                    </div>
                    {f.comment && <p className="small mb-0">{f.comment}</p>}
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          </Section>
        </Col>

        <Col lg={5}>
          <Section title="Mentorship at a glance">
            <Details
              items={[
                ['Started', fmtDate(m.startedAt)],
                ['Sessions', `${held.length} held · ${held.filter((s) => s.confirmed).length} confirmed`],
                ['Latest progress', latest ? `${latest.progress} (${latest.from.toLowerCase()})` : '—'],
              ]}
            />
          </Section>
          <Section title="Sessions">
            {m.sessions.length === 0 && <p className="text-muted small mb-0">No sessions logged yet.</p>}
            <ListGroup variant="flush">
              {m.sessions.map((s) => (
                <ListGroup.Item key={s.id} className="px-0 small d-flex justify-content-between align-items-center">
                  <span>
                    {fmtDate(s.date)}
                    {s.duration && ` · ${s.duration} min`}
                    {s.status === 'Held' && !s.confirmed && <span className="text-muted"> · waiting for confirmation</span>}
                  </span>
                  <StatusBadge status={s.status} />
                </ListGroup.Item>
              ))}
            </ListGroup>
            <p className="small text-muted mt-2 mb-0">Dates and durations only. IIC doesn’t see what was discussed.</p>
          </Section>
          <Section title="History">
            {m.history.length ? <AuditLog entries={m.history} /> : <p className="text-muted small mb-0">Nothing recorded yet.</p>}
          </Section>
        </Col>
      </Row>
    </>
  )
}
