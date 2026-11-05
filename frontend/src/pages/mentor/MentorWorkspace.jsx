import { useState } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addSession, addStep, cancelSession, confirmSession, endMentorship, getMentorship, submitProgress, toggleStep } from '../../api/mentor'
import Details from '../../components/Details'
import Loading from '../../components/Loading'
import NextSteps from '../../components/NextSteps'
import ReasonModal from '../../components/ReasonModal'
import Section from '../../components/Section'
import SessionList from '../../components/SessionList'
import useFetch from '../../hooks/useFetch'
import { firstName, fmtDate, today } from '../../utils/format'
import LogSessionModal from './modals/LogSessionModal'
import ProgressModal from './modals/ProgressModal'

export default function MentorWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [m, reload] = useFetch(getMentorship, id)
  const [modal, setModal] = useState(null) // 'session' | 'progress' | 'end'
  if (!m) return <Loading />

  const { student } = m
  const name = firstName(student.name)
  const run = (fn, ...args) => fn(id, ...args).then(reload) // call an API action, then refresh
  const close = () => setModal(null)

  return (
    <>
      <Link to="/mentor" className="small text-decoration-none"><i className="bi bi-arrow-left me-1" />Dashboard</Link>
      <div className="d-flex justify-content-between align-items-start my-3">
        <div>
          <h1 className="h3 mb-1">Mentorship with {student.name}</h1>
          <p className="text-muted mb-0">Active since {fmtDate(m.startedAt)}</p>
        </div>
        <Button variant="outline-danger" onClick={() => setModal('end')}>End mentorship</Button>
      </div>

      <Alert variant={m.checkpointDue < today() ? 'warning' : 'info'} className="d-flex justify-content-between align-items-center">
        <span><strong>Progress checkpoint {m.checkpointDue < today() ? 'was due' : 'due'} {fmtDate(m.checkpointDue)}.</strong> Only IIC sees your answer.</span>
        <Button size="sm" onClick={() => setModal('progress')}>Give feedback</Button>
      </Alert>

      <Row className="g-4">
        <Col lg={8}>
          <Section title="Goal">
            <p className="mb-1">{m.goal}</p>
            <small className="text-muted">Set by {name}. Visible to both of you and IIC.</small>
          </Section>
          <Section title={`Next steps · ${m.steps.filter((s) => s.done).length} of ${m.steps.length} done`}>
            <NextSteps steps={m.steps} onToggle={(sid) => run(toggleStep, sid)} onAdd={(text) => run(addStep, text)} />
          </Section>
          <Section title="Sessions" action={<Button size="sm" onClick={() => setModal('session')}>Log a session</Button>}>
            <SessionList sessions={m.sessions} role="mentor" onConfirm={(sid) => run(confirmSession, sid)} onCancel={(sid) => run(cancelSession, sid)} />
          </Section>
        </Col>
        <Col lg={4}>
          <Section title={`About ${name}`}>
            <Details items={[['Level', student.level], ['Career interest', student.careerInterest], ['Institute email', student.email]]} />
            <p className="small fst-italic text-muted mt-3 mb-0">“{m.problem}”</p>
          </Section>
        </Col>
      </Row>

      <LogSessionModal show={modal === 'session'} onClose={close} onSave={(s) => run(addSession, s)} />
      <ProgressModal show={modal === 'progress'} onClose={close} onSave={(p) => run(submitProgress, p)} />
      <ReasonModal
        show={modal === 'end'}
        title="End this mentorship?"
        submitLabel="End mentorship"
        onClose={close}
        onConfirm={(reason) => endMentorship(id, reason).then(() => navigate('/mentor'))}
      >
        <p>{name} and IIC will be notified, and your capacity is freed up.</p>
        <ul className="small mb-0">
          <li>{name} is listed for reassignment and asked for final feedback.</li>
          <li>IIC may assign {name} a new mentor.</li>
        </ul>
      </ReasonModal>
    </>
  )
}
