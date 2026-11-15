import { useState } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { endMentorship, getMentorship, submitProgress } from '../../api/mentor'
import Details from '../../components/Details'
import Loading from '../../components/Loading'
import NextStepsSection from '../../components/NextStepsSection'
import ProgressModal from '../../components/ProgressModal'
import ReasonModal from '../../components/ReasonModal'
import Section from '../../components/Section'
import SessionsSection from '../../components/SessionsSection'
import { END_REASONS } from '../../constants/mentor'
import useFetch from '../../hooks/useFetch'
import { firstName, fmtDate, today } from '../../utils/format'

export default function MentorWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [m, reload] = useFetch(getMentorship, id)
  const [modal, setModal] = useState(null) // 'progress' | 'end'
  if (!m) return <Loading />

  const { student } = m
  const name = firstName(student.name)
  const overdue = m.checkpointDue < today()
  const close = () => setModal(null)

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
          <NextStepsSection mentorshipId={id} steps={m.steps} onChange={reload} />
          <SessionsSection mentorshipId={id} sessions={m.sessions} role="mentor" onChange={reload} />
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

      <ProgressModal
        show={modal === 'progress'}
        onClose={close}
        onSave={(progress, comment) => submitProgress(id, progress, comment).then(reload)}
      />
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
