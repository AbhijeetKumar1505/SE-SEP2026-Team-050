import { useState } from 'react'
import { Alert, Button, Card, Col, Row, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ReasonModal from '../../components/ReasonModal'
import Section from '../../components/Section'
import { DECLINE_REASONS } from '../../constants/mentor'
import { useAuth } from '../../context/useAuth'
import { dayOffset, firstName, fmtDate, fmtTime, hoursAgo, today } from '../../utils/format'
import AssignmentCard from './AssignmentCard'

const ACCEPT_HOURS = 72 // a mentor accepts or declines within this many hours
const FEEDBACK_DAYS = 14 // progress feedback is due this often

const student = (name, roll) => ({
  name,
  roll,
  email: `${roll}@ds.study.iitm.ac.in`, // shown to the mentor only after they accept
  level: 'BS',
  careerInterest: 'Job',
  courses: 'Programming in Python, DBMS, MAD I, PDSA, MLF',
})

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
const assignedAt = hoursAgo(30)
const ASSIGNMENTS = [
  {
    id: 'p6',
    assignedBy: 'Deepa Krishnan',
    assignedAt,
    deadline: new Date(new Date(assignedAt).getTime() + ACCEPT_HOURS * 36e5).toISOString(),
    tags: ['Choosing a career path', 'Job search strategy'],
    problem: 'I want to move into data engineering but I’m not sure what the role involves day to day or which tools to learn first.',
    goal: 'A 6-month learning plan and one portfolio project.',
    student: student('Neha Joshi', '21f1005567'),
  },
]

const MENTORSHIPS = [
  {
    id: 'r6',
    student: student('Karthik Subramanian', '22f3001234'),
    startedAt: dayOffset(-25),
    checkpointDue: dayOffset(3),
    sessions: [
      { date: dayOffset(-20), status: 'Held', confirmed: true },
      { date: dayOffset(-10), status: 'Held', confirmed: false },
      { date: dayOffset(7), time: '20:00', status: 'Planned' },
    ],
  },
]

const held = (m) => m.sessions.filter((s) => s.status === 'Held')
const byDate = (a, b) => `${a.date}${a.time ?? ''}`.localeCompare(`${b.date}${b.time ?? ''}`)
const nextSession = (m) => m.sessions.filter((s) => s.status === 'Planned').toSorted(byDate)[0]

export default function MentorDashboard() {
  const { user } = useAuth()
  const [capacity, setCapacity] = useState(3)
  const [capacityRequest, setCapacityRequest] = useState({ by: 'Deepa Krishnan' })
  const [assignments, setAssignments] = useState(ASSIGNMENTS)
  const [mentorships, setMentorships] = useState(MENTORSHIPS)
  const [declining, setDeclining] = useState(null) // assignment id

  const load = mentorships.length + assignments.length // waiting assignments count towards capacity
  const thisMonth = mentorships.flatMap(held).filter((s) => s.date.startsWith(today().slice(0, 7)))
  const confirmed = thisMonth.filter((s) => s.confirmed).length
  const sessionsThisMonth = thisMonth.length
  const nextDue = mentorships.toSorted((a, b) => a.checkpointDue.localeCompare(b.checkpointDue))[0]
  const nextCheckpoint = nextDue && { date: nextDue.checkpointDue, student: nextDue.student.name }

  function answer(accept) {
    if (accept) setCapacity(capacity + 1)
    setCapacityRequest(null)
  }

  function accept(a) {
    setAssignments(assignments.filter((x) => x !== a))
    setMentorships([
      ...mentorships,
      {
        id: `m-${a.id}`,
        student: a.student,
        problem: a.problem,
        goal: a.goal,
        startedAt: today(),
        checkpointDue: dayOffset(FEEDBACK_DAYS),
        sessions: [],
      },
    ])
  }

  // The problem goes back to IIC's queue (once the API is connected).
  function decline() {
    setAssignments(assignments.filter((x) => x.id !== declining))
  }

  const stats = [
    ['Active mentees', `${load} of ${capacity}`, load >= capacity ? 'At capacity' : `${capacity - load} open`],
    ['Sessions this month', sessionsThisMonth, `${confirmed} confirmed`],
    ['Next progress feedback', nextCheckpoint ? fmtDate(nextCheckpoint.date) : '—', nextCheckpoint && `For ${nextCheckpoint.student}`],
  ]

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
            <strong>{capacityRequest.by} asks: can you take one more student?</strong> Your capacity would go from {capacity} to{' '}
            {capacity + 1}.
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
            <AssignmentCard key={a.id} assignment={a} onAccept={() => accept(a)} onDecline={() => setDeclining(a.id)} />
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
                  <td>{held(m).length}</td>
                  <td>{nextSession(m) ? `${fmtDate(nextSession(m).date)}, ${fmtTime(nextSession(m).time)}` : '—'}</td>
                  <td className="text-end">
                    {/* A new mentorship isn't in the workspace's sample data, so pass it along. */}
                    <Button as={Link} to={`/mentor/mentorships/${m.id}`} state={{ mentorship: m }} size="sm" variant="outline-primary">
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
        onConfirm={decline}
      >
        The problem goes back to IIC’s queue so another mentor can be assigned.
      </ReasonModal>
    </>
  )
}
