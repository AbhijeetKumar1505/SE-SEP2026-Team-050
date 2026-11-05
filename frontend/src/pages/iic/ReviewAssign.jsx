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
import useFetch from '../../hooks/useFetch'
import { fmtDate } from '../../utils/format'

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
  const assign = (mentorId) =>
    assignMentor(id, mentorId)
      .then(() => navigate('/iic'))
      .catch((e) => setError(e.message))

  return (
    <>
      <Link to="/iic" className="small text-decoration-none"><i className="bi bi-arrow-left me-1" />Problem queue</Link>
      <div className="d-flex align-items-center gap-3 my-3">
        <h1 className="h3 mb-0">Review {student.name}’s problem</h1>
        <StatusBadge status={p.status} />
      </div>

      <Row className="g-4">
        <Col lg={6}>
          <Section title={`Submitted ${fmtDate(p.submittedAt)}`}>
            {p.reassignReason && <Alert variant="danger" className="small">Needs reassignment: {p.reassignReason}</Alert>}
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
                ['Guidance preferences', `${p.guidance} (only you can see these)`],
              ]}
            />
            <div className="my-3"><Tags tags={p.tags} /></div>
            <Button variant="outline-danger" size="sm" onClick={() => setClosing(true)}>Close this problem</Button>
          </Section>
        </Col>

        <Col lg={6}>
          <Section
            title={showAll ? 'All eligible mentors' : 'Recommended mentors'}
            action={
              <Button size="sm" variant="outline-primary" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Back to recommendations' : 'Browse all eligible mentors'}
              </Button>
            }
          >
            <p className="small text-muted">
              {showAll ? 'Available mentors with spare capacity.' : 'Most shared topic tags first, then fewest active mentees.'}
            </p>
            {error && <Alert variant="danger" className="small">{error}</Alert>}
            {mentors.length === 0 && <p className="text-muted">No mentors match. Try browsing all eligible mentors.</p>}
            <ListGroup variant="flush">
              {mentors.map((m, i) => (
                <ListGroup.Item key={m.id} className="px-0 d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <strong>{!showAll && `${i + 1}. `}{m.name}</strong>
                    <div className="small text-muted">{m.headline}</div>
                    <div className="small">Shared tags: {m.shared} · {m.load} of {m.capacity} mentees</div>
                    <div className="small text-muted">{m.availability} · {m.timezone} · Style: {m.style}</div>
                  </div>
                  <Button size="sm" onClick={() => assign(m.id)}>Assign</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <p className="small text-muted mt-3 mb-0">
              The mentor receives level, completed courses, career interest, tags and the problem. No CGPA or guidance preferences.
            </p>
          </Section>
        </Col>
      </Row>

      <ReasonModal
        show={closing}
        title="Close this problem?"
        submitLabel="Close problem"
        onClose={() => setClosing(false)}
        onConfirm={(reason) => closeProblem(id, reason).then(() => navigate('/iic'))}
      >
        {student.name} is notified with your reason and can submit a new problem. Use this for out-of-scope problems or wellbeing referrals.
      </ReasonModal>
    </>
  )
}
