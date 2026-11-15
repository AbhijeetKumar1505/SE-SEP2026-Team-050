import { useState } from 'react'
import { Alert, Button, Col, ListGroup, Row } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import AuditLog from '../../components/AuditLog'
import Details from '../../components/Details'
import Pill from '../../components/Pill'
import Section from '../../components/Section'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/useAuth'
import { dayOffset, fmtDate, hoursAgo } from '../../utils/format'

// I8: one mentorship's feedback for IIC, with an AI summary and AI wellbeing flags.
// The AI reads feedback comments and session dates only. Sessions never record what was discussed.

const PROGRESS_TONE = { 'No progress': 'danger', 'Some progress': 'warning', 'Goal met': 'success' }

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
// `ai` is what the AI endpoint returns: an on-demand summary, and a flag raised when feedback arrives.
const FLAGGED_AT = hoursAgo(140)
const held = (daysAgo, confirmed = true) => ({ date: dayOffset(-daysAgo), duration: 40, status: 'Held', confirmed })
const feedback = (id, daysAgo, from, progress, comment) => ({ id, date: dayOffset(-daysAgo), from, progress, comment })

const SAMPLES = {
  r1: {
    student: 'Karan Mehta',
    mentor: 'Meera Iyer',
    startedAt: dayOffset(-20),
    sessions: [],
    feedback: [],
    ai: { summary: 'No sessions logged in 20 days and no feedback yet. The problem is already back in the queue as Reassignment needed.' },
  },
  r2: {
    student: 'Sneha Pillai',
    mentor: 'Arjun Shah',
    startedAt: dayOffset(-34),
    sessions: [held(20)],
    feedback: [
      feedback('f3', 4, 'Mentor', 'Some progress', 'Sneha hasn’t replied to my last two messages.'),
      feedback(
        'f2',
        6,
        'Student',
        'No progress',
        'I’ve fallen behind because exams and my internship hours piled up. Honestly I’m exhausted all the time and I’ve stopped enjoying any of this.',
      ),
      feedback('f1', 16, 'Mentor', 'Some progress', 'First call went well. We agreed on a Python refresher before starting ML.'),
    ],
    ai: {
      summary:
        'One session was held, 20 days ago, and none since. Sneha says exams and internship hours left her behind and that she feels exhausted; Arjun reports no reply to his last two messages. The problem is already back in the queue as Reassignment needed.',
      flag: {
        feedbackId: 'f2',
        quote: 'Honestly I’m exhausted all the time and I’ve stopped enjoying any of this.',
        why: 'Mentions ongoing exhaustion and loss of interest.',
      },
    },
  },
  r3: {
    student: 'Fatima Khan',
    mentor: 'Priya Natarajan',
    startedAt: dayOffset(-26),
    caseId: 'C-014',
    sessions: [held(10, false), held(17), held(24)],
    feedback: [
      feedback('f2', 12, 'Student', 'Some progress', 'Useful advice, but our call times keep clashing and we have rescheduled twice.'),
      feedback('f1', 19, 'Mentor', 'Some progress', 'Good start on the portfolio plan. I travel a lot next month, so calls may move.'),
    ],
    ai: {
      summary:
        'Three sessions held, the last 10 days ago; two are confirmed. Both sides describe repeated scheduling clashes, and Priya travels next month. Progress feedback is 9 days overdue and Fatima has opened a change request (case C-014).',
    },
  },
  r4: {
    student: 'Divya Menon',
    mentor: 'Manoj Pillai',
    startedAt: dayOffset(-11),
    sessions: [],
    feedback: [],
    ai: { summary: 'No sessions logged in the 11 days since Manoj accepted, and no feedback yet.' },
  },
  r6: {
    student: 'Karthik Subramanian',
    mentor: 'Rahul Menon',
    startedAt: dayOffset(-25),
    sessions: [held(10, false), held(20)],
    feedback: [feedback('f1', 9, 'Mentor', 'Some progress', 'Karthik finished the SQL practice set and is setting up Airflow.')],
    ai: {
      summary:
        'Two sessions held in 25 days; the latest is still waiting for Karthik to confirm. Rahul reports some progress: the SQL practice set is done and Airflow set-up has started.',
    },
  },
  r7: {
    student: 'Rohan Gupta',
    mentor: 'Meera Iyer',
    startedAt: dayOffset(-35),
    sessions: [held(1), held(8), held(15), held(22), held(29)],
    feedback: [
      feedback('f2', 2, 'Student', 'Goal met', 'I got the internship offer I was preparing for. Thank you!'),
      feedback('f1', 3, 'Mentor', 'Goal met', 'Rohan cleared both interview rounds.'),
    ],
    ai: {
      summary:
        'Five confirmed sessions over five weeks, the last one yesterday. Both sides report the goal as met, so the mentorship looks ready to end.',
    },
  },
}

export default function MentorshipReview() {
  const { id } = useParams()
  const { user } = useAuth()
  const m = SAMPLES[id]
  const [summary, setSummary] = useState('off') // 'off' | 'writing' | 'on'
  const [flagState, setFlagState] = useState('open') // 'open' | 'reviewed' | 'dismissed'
  const [history, setHistory] = useState(() =>
    m?.ai.flag ? [{ at: FLAGGED_AT, text: 'AI flagged a feedback comment for a wellbeing check' }] : [],
  )

  if (!m) {
    return (
      <p>
        This mentorship wasn’t found. <Link to="/iic/monitoring">Back to monitoring</Link>
      </p>
    )
  }

  const { flag } = m.ai
  const heldSessions = m.sessions.filter((s) => s.status === 'Held')
  const latest = m.feedback[0]

  function summarise() {
    setSummary('writing')
    setTimeout(() => setSummary('on'), 900) // the AI call, once the API is connected
  }

  // Recorded in the audit log. The AI never contacts anyone or changes the mentorship.
  function closeFlag(state) {
    setFlagState(state)
    const text =
      state === 'reviewed' ? 'reviewed the AI wellbeing flag and will follow up' : 'marked the AI wellbeing flag as not a concern'
    setHistory([{ at: new Date().toISOString(), text: `${user.name} ${text}` }, ...history])
  }

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

      {flag && flagState === 'open' && (
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
      {flag && flagState !== 'open' && (
        <Alert variant="secondary" className="small">
          Wellbeing flag {flagState === 'reviewed' ? 'reviewed: you’ll follow up' : 'closed as not a concern'}. It’s recorded in the
          history.
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={7}>
          <Section
            title="AI summary"
            action={
              summary !== 'on' && (
                <Button size="sm" variant="outline-primary" disabled={summary === 'writing'} onClick={summarise}>
                  <i className="bi bi-stars me-1" />
                  {summary === 'writing' ? 'Summarising…' : 'Summarise with AI'}
                </Button>
              )
            }
          >
            {summary === 'on' ? (
              <>
                <p className="mb-2">{m.ai.summary}</p>
                <p className="small text-muted mb-0">
                  Based on {m.feedback.length} feedback {m.feedback.length === 1 ? 'entry' : 'entries'} and the session dates. AI can be
                  wrong, so read the feedback below before acting.
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
                const flagged = flag?.feedbackId === f.id && flagState === 'open'
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
                    <p className="small mb-0">{f.comment}</p>
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
                ['Sessions', `${heldSessions.length} held · ${heldSessions.filter((s) => s.confirmed).length} confirmed`],
                ['Latest progress', latest ? `${latest.progress} (${latest.from.toLowerCase()})` : '—'],
              ]}
            />
          </Section>
          <Section title="Sessions">
            {m.sessions.length === 0 && <p className="text-muted small mb-0">No sessions logged yet.</p>}
            <ListGroup variant="flush">
              {m.sessions.map((s) => (
                <ListGroup.Item key={s.date} className="px-0 small d-flex justify-content-between align-items-center">
                  <span>
                    {fmtDate(s.date)} · {s.duration} min
                    {!s.confirmed && <span className="text-muted"> · waiting for confirmation</span>}
                  </span>
                  <StatusBadge status={s.status} />
                </ListGroup.Item>
              ))}
            </ListGroup>
            <p className="small text-muted mt-2 mb-0">Dates and durations only. What was discussed is never recorded.</p>
          </Section>
          <Section title="History">
            {history.length ? <AuditLog entries={history} /> : <p className="text-muted small mb-0">Nothing recorded yet.</p>}
          </Section>
        </Col>
      </Row>
    </>
  )
}
