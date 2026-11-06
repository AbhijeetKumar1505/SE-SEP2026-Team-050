import { useState } from 'react'
import { Alert, Button, Card, Col, Row, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { acceptAssignment, answerCapacityRequest, declineAssignment, getDashboard } from '../../api/mentor'
import Loading from '../../components/Loading'
import ReasonModal from '../../components/ReasonModal'
import Section from '../../components/Section'
import { DECLINE_REASONS } from '../../constants/mentor'
import { useAuth } from '../../context/useAuth'
import useFetch from '../../hooks/useFetch'
import { firstName, fmtDate, fmtTime } from '../../utils/format'
import AssignmentCard from './AssignmentCard'

export default function MentorDashboard() {
  const { user } = useAuth()
  const [data, reload] = useFetch(getDashboard)
  const [declining, setDeclining] = useState(null) // assignment id
  if (!data) return <Loading />

  const { capacity, load, assignments, mentorships, sessionsThisMonth, confirmed, nextCheckpoint, capacityRequest } = data
  const stats = [
    ['Active mentees', `${load} of ${capacity}`, load >= capacity ? 'At capacity' : `${capacity - load} open`],
    ['Sessions this month', sessionsThisMonth, `${confirmed} confirmed`],
    ['Next progress feedback', nextCheckpoint ? fmtDate(nextCheckpoint.date) : '—', nextCheckpoint && `For ${nextCheckpoint.student}`],
  ]
  const answer = (accept) => answerCapacityRequest(capacityRequest.id, accept).then(reload)

  return (
    <>
      <h1 className="h3 mb-4">Welcome back, {firstName(user.name)}</h1>

      <Row className="g-3 mb-4">
        {stats.map(([label, value, note]) => (
          <Col md={4} key={label}>
            <Card body className="h-100">
              <div className="small text-muted">{label}</div>
              <div className="h3 mb-0">{value}</div>
              <div className="small text-muted">{note}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {capacityRequest && (
        <Alert variant="info" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>
            <strong>{capacityRequest.by} asks: can you take one more student?</strong> Your capacity would go from {capacityRequest.from} to{' '}
            {capacityRequest.to}.
          </span>
          <span className="d-flex gap-2">
            <Button size="sm" onClick={() => answer(true)}>
              Increase capacity
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={() => answer(false)}>
              Not now
            </Button>
          </span>
        </Alert>
      )}

      {assignments.length > 0 && (
        <Section title={`Waiting for your response (${assignments.length})`}>
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onAccept={() => acceptAssignment(a.id).then(reload)}
              onDecline={() => setDeclining(a.id)}
            />
          ))}
        </Section>
      )}

      <Section title="Active mentorships">
        {mentorships.length ? (
          <Table hover responsive className="align-middle mb-0">
            <thead>
              <tr>
                <th>Mentee</th>
                <th>Started</th>
                <th>Sessions held</th>
                <th>Next session</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {mentorships.map((m) => (
                <tr key={m.id}>
                  <td>{m.student.name}</td>
                  <td>{fmtDate(m.startedAt)}</td>
                  <td>{m.held}</td>
                  <td>{m.nextSession ? `${fmtDate(m.nextSession.date)}, ${fmtTime(m.nextSession.time)}` : '—'}</td>
                  <td className="text-end">
                    <Button as={Link} to={`/mentor/mentorships/${m.id}`} size="sm" variant="outline-primary">
                      Open workspace
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted mb-0">No active mentorships yet.</p>
        )}
      </Section>

      <ReasonModal
        show={declining !== null}
        title="Decline this assignment?"
        submitLabel="Decline assignment"
        reasons={DECLINE_REASONS}
        onClose={() => setDeclining(null)}
        onConfirm={(reason, note) => declineAssignment(declining, reason, note).then(reload)}
      >
        The problem goes back to IIC’s queue so another mentor can be assigned.
      </ReasonModal>
    </>
  )
}
