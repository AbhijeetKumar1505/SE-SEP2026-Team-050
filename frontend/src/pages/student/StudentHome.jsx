import { Alert, Button, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getHome } from '../../api/student'
import Details from '../../components/Details'
import Loading from '../../components/Loading'
import Pill from '../../components/Pill'
import Section from '../../components/Section'
import useFetch from '../../hooks/useFetch'
import ProblemCard from './ProblemCard'

export default function StudentHome() {
  const [data, reload] = useFetch(getHome)
  if (!data) return <Loading />

  const { problem, mentorship, profile, acceptHours } = data
  return (
    <>
      <h1 className="h3">My mentoring problem</h1>
      <p className="text-muted mb-4">Track your request and its current status.</p>

      {mentorship && (
        <Alert variant="info" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>
            <strong>
              {mentorship.reachedOut ? `Your mentorship with ${mentorship.mentor} is active.` : `${mentorship.mentor} accepted. Say hello!`}
            </strong>
          </span>
          <Button as={Link} to="/student/mentorship" size="sm">
            {mentorship.reachedOut ? 'Open mentorship' : 'Send your first message'}
          </Button>
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={8}>
          {problem ? (
            <ProblemCard problem={problem} acceptHours={acceptHours} onChange={reload} />
          ) : (
            <Section title="Your request">
              <p className="text-muted">You haven’t shared a problem yet. Tell IIC what you need help with and we’ll find you a mentor.</p>
              <Button as={Link} to="/student/problem/new">
                Share your problem
              </Button>
            </Section>
          )}
        </Col>
        <Col lg={4}>
          <Section title="Your profile" action={<Pill tone="success">Complete</Pill>}>
            <p className="text-muted">
              {profile.level} · {profile.careerInterest} · {profile.courseCount} completed{' '}
              {profile.courseCount === 1 ? 'course' : 'courses'}
            </p>
            <Link to="/student/profile" className="fw-semibold text-decoration-none">
              Edit profile
            </Link>
          </Section>
        </Col>
      </Row>
    </>
  )
}
