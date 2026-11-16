import { useState } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { openCase, saveGoal, submitFeedback } from '../../api/student'
import Details from '../../components/Details'
import NextStepsSection from '../../components/NextStepsSection'
import ProgressModal from '../../components/ProgressModal'
import Section from '../../components/Section'
import SessionsSection from '../../components/SessionsSection'
import { firstName, fmtDate, today } from '../../utils/format'
import CaseModal from './CaseModal'
import GoalModal from './GoalModal'

// S5: the student's side of the mentorship.
export default function StudentWorkspace({ m, reload }) {
  const [modal, setModal] = useState(null) // 'goal' | 'progress' | 'case'
  const { mentor } = m
  const overdue = m.checkpointDue < today()
  const close = () => setModal(null)
  const act = (fn, ...args) => fn(m.id, ...args).then(reload)

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="h3 mb-1">Your mentorship with {mentor.name}</h1>
          <p className="text-muted mb-0">Active since {fmtDate(m.startedAt)}</p>
        </div>
        <Button variant="outline-danger" disabled={m.caseOpen} onClick={() => setModal('case')}>
          Change or end mentorship
        </Button>
      </div>

      {m.caseOpen && (
        <Alert variant="info">
          <strong>Your request is with IIC.</strong> They’ll review it and get back to you.
        </Alert>
      )}
      <Alert variant={overdue ? 'warning' : 'info'} className="d-flex justify-content-between align-items-center">
        <strong>
          Progress feedback {overdue ? 'was due' : 'due'} {fmtDate(m.checkpointDue)}
        </strong>
        <Button size="sm" onClick={() => setModal('progress')}>
          Share progress feedback
        </Button>
      </Alert>

      <Row className="g-4">
        <Col lg={8}>
          <Section
            title="Your goal"
            action={
              <Button size="sm" variant="outline-secondary" onClick={() => setModal('goal')}>
                Edit goal
              </Button>
            }
          >
            <p className="mb-0">{m.goal}</p>
          </Section>
          <NextStepsSection mentorshipId={m.id} steps={m.steps} onChange={reload} />
          <SessionsSection mentorshipId={m.id} sessions={m.sessions} role="student" onChange={reload} />
        </Col>
        <Col lg={4}>
          <Section title={`About ${firstName(mentor.name)}`}>
            <p className="text-muted">{mentor.headline}</p>
            <Details
              items={[
                ['Preferred channel', mentor.channel],
                ['Contact', mentor.contact],
                ['Availability', mentor.availability],
                ['Time zone', mentor.timezone],
              ]}
            />
          </Section>
        </Col>
      </Row>

      <GoalModal show={modal === 'goal'} goal={m.goal} onClose={close} onSave={(goal) => act(saveGoal, goal)} />
      <ProgressModal show={modal === 'progress'} onClose={close} onSave={(progress, comment) => act(submitFeedback, progress, comment)} />
      <CaseModal show={modal === 'case'} onClose={close} onSave={(request, reason) => act(openCase, request, reason)} />
    </>
  )
}
