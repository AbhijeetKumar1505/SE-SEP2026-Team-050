import { useState } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { Link, useLocation, useParams } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import Details from '../../components/Details'
import NextSteps from '../../components/NextSteps'
import ReasonModal from '../../components/ReasonModal'
import Section from '../../components/Section'
import SessionList from '../../components/SessionList'
import { END_REASONS, SESSION_FORMS } from '../../constants/mentor'
import { dayOffset, firstName, fmtDate, today } from '../../utils/format'
import ProgressModal from './modals/ProgressModal'
import SessionModal from './modals/SessionModal'

const FEEDBACK_DAYS = 14 // progress feedback is due this often

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
const SAMPLES = {
  r6: {
    student: {
      name: 'Karthik Subramanian',
      level: 'BS',
      careerInterest: 'Job',
      email: '22f3001234@ds.study.iitm.ac.in',
    },
    startedAt: dayOffset(-25),
    checkpointDue: dayOffset(3),
    problem: 'Choosing a career path and planning my job search.',
    goal: 'Shortlist two target roles and apply to five companies.',
    steps: [
      { id: 't1', text: 'Finish the SQL window-functions practice set', done: true },
      { id: 't2', text: 'Install Airflow locally and run the tutorial DAG', done: false },
    ],
    sessions: [
      {
        id: 's1',
        date: dayOffset(-20),
        channel: 'Google Meet',
        duration: 40,
        topic: 'Getting started',
        status: 'Held',
        confirmed: true,
        loggedBy: 'mentor',
      },
      {
        id: 's2',
        date: dayOffset(-10),
        channel: 'Google Meet',
        duration: 40,
        topic: 'Learning plan and skills',
        status: 'Held',
        confirmed: false,
        loggedBy: 'student',
      },
      { id: 's3', date: dayOffset(7), time: '20:00', channel: 'Google Meet', status: 'Planned', loggedBy: 'mentor' },
    ],
  },
}

export default function MentorWorkspace() {
  const { id } = useParams()
  const { state } = useLocation()
  // A mentorship accepted on the dashboard isn't in SAMPLES, so the dashboard passes it along.
  const [m, setM] = useState(() => SAMPLES[id] ?? (state?.mentorship && { ...state.mentorship, steps: [] }))
  const [ended, setEnded] = useState(null) // the reason, once ended
  const [modal, setModal] = useState(null) // 'progress' | 'end'
  const [sessionForm, setSessionForm] = useState({ open: false }) // kept after closing so the dialog doesn't change while fading out
  const [cancelling, setCancelling] = useState(null) // session id

  if (!m) {
    return (
      <p>
        This mentorship wasn’t found. <Link to="/mentor">Back to the dashboard</Link>
      </p>
    )
  }

  const { student } = m
  const name = firstName(student.name)
  const overdue = m.checkpointDue < today()
  const close = () => setModal(null)
  const openSession = (type, session) => setSessionForm({ open: true, ...SESSION_FORMS[type], session })
  const setSteps = (change) => setM((cur) => ({ ...cur, steps: change(cur.steps) }))
  const setSessions = (change) => setM((cur) => ({ ...cur, sessions: change(cur.sessions) }))
  const changeSession = (sid, values) => setSessions((list) => list.map((s) => (s.id === sid ? { ...s, ...values } : s)))

  function saveSession(values) {
    const { session } = sessionForm
    if (!session) {
      setSessions((list) => [...list, { ...values, id: Date.now(), loggedBy: 'mentor', confirmed: false }])
      return
    }
    const cleared = { time: undefined, link: undefined, duration: undefined, topic: undefined } // fields of the old kind
    changeSession(session.id, { ...cleared, ...values, loggedBy: 'mentor', confirmed: false }) // an edit needs confirming again
  }

  function submitProgress(progress, comment) {
    setM((cur) => ({ ...cur, progress, progressComment: comment, checkpointDue: dayOffset(FEEDBACK_DAYS) })) // visible to IIC only
  }

  return (
    <>
      <Link to="/mentor" className="small text-decoration-none">
        <i className="bi bi-arrow-left me-1" />
        Dashboard
      </Link>
      <div className="d-flex justify-content-between align-items-start my-3">
        <div>
          <h1 className="h3 mb-1">Mentorship with {student.name}</h1>
          <p className="text-muted mb-0">Active since {fmtDate(m.startedAt)}</p>
        </div>
        {!ended && (
          <Button variant="outline-danger" onClick={() => setModal('end')}>
            End mentorship
          </Button>
        )}
      </div>

      {ended ? (
        <Alert variant="secondary">
          <strong>Ended by you:</strong> {ended}. IIC and {name} have been notified.
        </Alert>
      ) : (
        <Alert variant={overdue ? 'warning' : 'info'} className="d-flex justify-content-between align-items-center">
          <strong>
            Progress feedback {overdue ? 'was due' : 'due'} {fmtDate(m.checkpointDue)}
          </strong>
          <Button size="sm" onClick={() => setModal('progress')}>
            Give progress feedback
          </Button>
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <Section title="Goal">
            <p className="mb-1">{m.goal}</p>
            <small className="text-muted">Set by {name}</small>
          </Section>
          <Section title={`Next steps · ${m.steps.filter((s) => s.done).length} of ${m.steps.length} done`}>
            <NextSteps
              steps={m.steps}
              onToggle={(sid) => setSteps((list) => list.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)))}
              onAdd={ended ? undefined : (text) => setSteps((list) => [...list, { id: Date.now(), text, done: false }])}
              onDelete={ended ? undefined : (sid) => setSteps((list) => list.filter((s) => s.id !== sid))}
            />
          </Section>
          <Section
            title="Sessions"
            action={
              !ended && (
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-primary" onClick={() => openSession('schedule')}>
                    Schedule a session
                  </Button>
                  <Button size="sm" variant="outline-primary" onClick={() => openSession('log')}>
                    Log a session
                  </Button>
                </div>
              )
            }
          >
            {ended ? (
              <SessionList sessions={m.sessions} role="mentor" />
            ) : (
              <SessionList
                sessions={m.sessions}
                role="mentor"
                onConfirm={(sid) => changeSession(sid, { confirmed: true })}
                onMarkHeld={(s) => openSession('markHeld', { ...s, date: today() })}
                onEdit={(s) => openSession(s.status === 'Held' ? 'editHeld' : 'editPlanned', s)}
                onCancel={(s) => setCancelling(s.id)}
              />
            )}
          </Section>
        </Col>
        <Col lg={4}>
          <Section title={`About ${name}`}>
            <Details
              items={[
                ['Level', student.level],
                ['Career interest', student.careerInterest],
                ['Institute email', student.email],
              ]}
            />
            <p className="small fst-italic text-muted mt-3 mb-0">“{m.problem}”</p>
          </Section>
        </Col>
      </Row>

      <SessionModal
        {...sessionForm}
        show={sessionForm.open}
        onClose={() => setSessionForm((f) => ({ ...f, open: false }))}
        onSave={saveSession}
      />
      <ProgressModal show={modal === 'progress'} onClose={close} onSave={submitProgress} />
      <ConfirmModal
        show={cancelling !== null}
        title="Cancel this session?"
        submitLabel="Cancel session"
        variant="danger"
        onClose={() => setCancelling(null)}
        onConfirm={() => changeSession(cancelling, { status: 'Cancelled' })} // cancelled sessions don't count
      >
        The session stays in the list as cancelled and doesn’t count as held.
      </ConfirmModal>
      <ReasonModal
        show={modal === 'end'}
        title="End this mentorship?"
        submitLabel="End mentorship"
        reasons={END_REASONS}
        noteLabel="Details for IIC (optional)"
        onClose={close}
        onConfirm={(reason, note) => setEnded(note ? `${reason} (${note})` : reason)}
      >
        This ends your mentorship with {name}. IIC will be notified.
      </ReasonModal>
    </>
  )
}
