import { useState } from 'react'
import { Alert, Button, Col, ListGroup, Row } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { assignMentor, closeProblem, getEligibleMentors, getProblem, getRecommendations } from '../../api/iic'
import Details from '../../components/Details'
import Loading from '../../components/Loading'
import ReasonModal from '../../components/ReasonModal'
import Section from '../../components/Section'
import StatusBadge from '../../components/StatusBadge'
import Tags from '../../components/Tags'
import { LOW_CAPACITY } from '../../constants/iic'
import useFetch from '../../hooks/useFetch'
import { fmtDate, fmtDateTime } from '../../utils/format'

export default function ReviewAssign() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const [p] = useFetch(getProblem, id)
  const [mentors] = useFetch(showAll ? getEligibleMentors : getRecommendations, id)
  const [error, setError] = useState('')
  const [closing, setClosing] = useState(false)
  if (!p || !mentors) return <Loading />

  const { student } = p
  const assigned = ['Awaiting mentor', 'Mentor assigned'].includes(p.status) // a student has one mentor at a time
  const assign = (mentorId) =>
    assignMentor(id, mentorId)
      .then(() => navigate('/iic'))
      .catch((e) => setError(e.message))

  return (
    <>
      <Link to="/iic" className="small text-decoration-none">
        <i className="bi bi-arrow-left me-1" />
        Problem queue
      </Link>
      <div className="d-flex align-items-center gap-3 my-3">
        <h1 className="h3 mb-0">Review {student.name}’s problem</h1>
        <StatusBadge status={p.status} />
      </div>

      <Row className="g-4">
        <Col lg={6}>
          <Section title={`Submitted ${fmtDate(p.submittedAt)}`}>
            {p.reassignReason && (
              <Alert variant="danger" className="small">
                Needs reassignment: {p.reassignReason}
              </Alert>
            )}
            <Details
              items={[
                ['Student', `${student.name} · ${student.roll}`],
                ['Institute email', student.email],
                ['Level', student.level],
                ['CGPA', `${student.cgpa} (IIC only)`],
                ['Career interest', student.careerInterest],
                ['Completed courses', student.courses],
                ['Problem', p.problem],
                ['Hopes to achieve', p.goal],
                ['Guidance preferences', p.guidance],
              ]}
            />
            <div className="my-3">
              <Tags tags={p.tags} />
            </div>
            {p.status !== 'Mentor assigned' && (
              <Button variant="outline-danger" size="sm" onClick={() => setClosing(true)}>
                Close this problem
              </Button>
            )}
          </Section>
        </Col>

        <Col lg={6}>
          {assigned ? (
            <Section title="Assigned mentor">
              <Details
                items={[
                  ['Mentor', p.mentor],
                  ['Assigned', fmtDate(p.assignedAt)],
                  p.status === 'Awaiting mentor' ? ['Waiting for a response by', fmtDateTime(p.respondBy)] : ['Status', 'Accepted'],
                ]}
              />
            </Section>
          ) : (
            <Section
              title={showAll ? 'All eligible mentors' : 'Recommended mentors'}
              action={
                <Button size="sm" variant="outline-primary" onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Back to recommendations' : 'Browse all eligible mentors'}
                </Button>
              }
            >
              {error && (
                <Alert variant="danger" className="small">
                  {error}
                </Alert>
              )}
              {mentors.length < LOW_CAPACITY && (
                <Alert variant="warning" className="small">
                  {mentors.length === 0 ? 'No mentors have spare capacity.' : 'Few mentors have spare capacity.'}{' '}
                  <Link to="/iic/mentors">Ask available mentors to take on more.</Link>
                </Alert>
              )}
              <ListGroup variant="flush">
                {mentors.map((m, i) => (
                  <ListGroup.Item key={m.id} className="px-0 d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <strong>
                        {!showAll && `${i + 1}. `}
                        {m.name}
                      </strong>
                      <div className="small text-muted">{m.headline}</div>
                      <div className="small">
                        Shared tags: {m.shared} · {m.load} of {m.capacity} mentees
                      </div>
                      <div className="small text-muted">
                        {m.availability} · {m.timezone} · Style: {m.style}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => assign(m.id)}>
                      Assign
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Section>
          )}
        </Col>
      </Row>

      <ReasonModal
        show={closing}
        title="Close this problem?"
        submitLabel="Close problem"
        onClose={() => setClosing(false)}
        onConfirm={(reason) => closeProblem(id, reason).then(() => navigate('/iic'))}
      >
        {student.name} is notified with your reason and can submit a new problem.
      </ReasonModal>
    </>
  )
}
