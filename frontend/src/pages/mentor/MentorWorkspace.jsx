import { useState } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  addSession,
  addStep,
  cancelSession,
  confirmSession,
  deleteStep,
  endMentorship,
  getMentorship,
  submitProgress,
  toggleStep,
  updateSession,
} from '../../api/mentor'
import ConfirmModal from '../../components/ConfirmModal'
import Details from '../../components/Details'
import Loading from '../../components/Loading'
import NextSteps from '../../components/NextSteps'
import ReasonModal from '../../components/ReasonModal'
import Section from '../../components/Section'
import SessionList from '../../components/SessionList'
import { END_REASONS, SESSION_FORMS } from '../../constants/mentor'
import useFetch from '../../hooks/useFetch'
import { firstName, fmtDate, today } from '../../utils/format'
import ProgressModal from './modals/ProgressModal'
import SessionModal from './modals/SessionModal'

export default function MentorWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [m, reload] = useFetch(getMentorship, id)
  const [modal, setModal] = useState(null) // 'progress' | 'end'
  const [sessionForm, setSessionForm] = useState({ open: false }) // kept after closing so the dialog doesn't change while fading out
  const [cancelling, setCancelling] = useState(null) // session id
  if (!m) return <Loading />

  const { student } = m
  const name = firstName(student.name)
  const overdue = m.checkpointDue < today()
  const run = (fn, ...args) => fn(id, ...args).then(reload) // call an API action, then refresh
  const close = () => setModal(null)
  const openSession = (type, session) => setSessionForm({ open: true, ...SESSION_FORMS[type], session })
  const saveSession = (values) => (sessionForm.session ? run(updateSession, sessionForm.session.id, values) : run(addSession, values))

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
        <Button variant="outline-danger" onClick={() => setModal('end')}>
          End mentorship
        </Button>
      </div>

      <Alert variant={overdue ? 'warning' : 'info'} className="d-flex justify-content-between align-items-center">
        <strong>
          Progress feedback {overdue ? 'was due' : 'due'} {fmtDate(m.checkpointDue)}
        </strong>
        <Button size="sm" onClick={() => setModal('progress')}>
          Give progress feedback
        </Button>
      </Alert>

      <Row className="g-4">
        <Col lg={8}>
          <Section title="Goal">
            <p className="mb-1">{m.goal}</p>
            <small className="text-muted">Set by {name}</small>
          </Section>
          <Section title={`Next steps · ${m.steps.filter((s) => s.done).length} of ${m.steps.length} done`}>
            <NextSteps
              steps={m.steps}
              onToggle={(sid) => run(toggleStep, sid)}
              onAdd={(text) => run(addStep, text)}
              onDelete={(sid) => run(deleteStep, sid)}
            />
          </Section>
          <Section
            title="Sessions"
            action={
              <div className="d-flex gap-2">
                <Button size="sm" variant="outline-primary" onClick={() => openSession('schedule')}>
                  Schedule a session
                </Button>
                <Button size="sm" variant="outline-primary" onClick={() => openSession('log')}>
                  Log a session
                </Button>
              </div>
            }
          >
            <SessionList
              sessions={m.sessions}
              role="mentor"
              onConfirm={(sid) => run(confirmSession, sid)}
              onMarkHeld={(s) => openSession('markHeld', { ...s, date: today() })}
              onEdit={(s) => openSession(s.status === 'Held' ? 'editHeld' : 'editPlanned', s)}
              onCancel={(s) => setCancelling(s.id)}
            />
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
      <ProgressModal show={modal === 'progress'} onClose={close} onSave={(progress, comment) => run(submitProgress, progress, comment)} />
      <ConfirmModal
        show={cancelling !== null}
        title="Cancel this session?"
        submitLabel="Cancel session"
        variant="danger"
        onClose={() => setCancelling(null)}
        onConfirm={() => run(cancelSession, cancelling)}
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
        onConfirm={(reason, note) => endMentorship(id, reason, note).then(() => navigate('/mentor'))}
      >
        This ends your mentorship with {name}. IIC will be notified.
      </ReasonModal>
    </>
  )
}
