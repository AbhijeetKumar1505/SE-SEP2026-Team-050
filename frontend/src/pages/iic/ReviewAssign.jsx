import { useState } from 'react'
import { Alert, Button, Col, ListGroup, Row } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import Details from '../../components/Details'
import ReasonModal from '../../components/ReasonModal'
import Section from '../../components/Section'
import StatusBadge from '../../components/StatusBadge'
import Tags from '../../components/Tags'
import { LOW_CAPACITY } from '../../constants/iic'
import { useAuth } from '../../context/useAuth'
import { dayOffset, fmtDate, fmtDateTime, hoursAgo } from '../../utils/format'

const ACCEPT_HOURS = 72 // the mentor accepts or declines within this many hours

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
const problem = (id, name, roll, daysAgo, status, tags, extra) => ({
  id,
  student: {
    name,
    roll,
    email: `${roll}@ds.study.iitm.ac.in`,
    level: 'BS',
    cgpa: 8.1, // IIC only
    careerInterest: 'Job',
    courses: 'Programming in Python, DBMS, MAD I, PDSA, MLF',
  },
  submittedAt: dayOffset(-daysAgo),
  status,
  tags,
  problem: 'I want to move into data engineering but I’m not sure what the role involves day to day or which tools to learn first.',
  goal: 'A 6-month learning plan and one portfolio project.',
  guidance: 'Direction first, then detailed steps',
  ...extra,
})

const PROBLEMS = [
  problem('p1', 'Karan Mehta', '22f3001876', 9, 'Reassignment needed', ['SQL and database design', 'Data engineering'], {
    reassignReason: 'the assigned mentor didn’t respond within 72 h.',
  }),
  problem('p2', 'Sneha Pillai', '23f2000451', 7, 'Reassignment needed', ['Machine learning', 'Python programming'], {
    reassignReason: 'the mentorship has been inactive for 14 days.',
  }),
  problem('p3', 'Ananya Rao', '23f1002345', 3, 'Submitted', [
    'Data engineering',
    'SQL and database design',
    'Industry and role requirements',
  ]),
  problem('p4', 'Rohit Verma', '23f1004420', 2, 'Submitted', ['Job search strategy', 'Resume and portfolio']),
  problem('p5', 'Vikram Das', '23f3002201', 1, 'Submitted', ['Machine learning', 'Choosing a master’s programme']),
  problem('p6', 'Neha Joshi', '21f1005567', 1, 'Awaiting mentor', ['Choosing a career path', 'Job search strategy'], {
    mentor: 'Rahul Menon',
    assignedBy: 'Deepa Krishnan',
    assignedAt: hoursAgo(30),
  }),
]

// Active mentors. load = active mentorships + assignments waiting for their answer.
const mentor = (id, name, capacity, load, expertise, extra) => ({
  id,
  name,
  capacity,
  load,
  expertise,
  available: true,
  headline: 'Data Engineer · BS Data Science ’24',
  availability: 'Weekday evenings',
  timezone: 'IST (UTC+05:30)',
  style: 'Direction first, then detailed steps',
  ...extra,
})

const MENTORS = [
  mentor('m01', 'Rahul Menon', 3, 2, ['Data engineering', 'SQL and database design', 'Python programming', 'Job search strategy']),
  mentor('m02', 'Priya Natarajan', 2, 1, ['Data engineering', 'Machine learning', 'Technical interview preparation'], {
    headline: 'Analytics Engineer · BS Data Science ’23',
    timezone: 'UTC-4',
    availability: 'Weekends',
    style: 'Detailed step-by-step, written',
  }),
  mentor('m03', 'Arjun Shah', 2, 1, ['Data engineering', 'Python programming'], {
    available: false,
    headline: 'Data Platform Lead · BS Data Science ’22',
  }),
  mentor('m04', 'Meera Iyer', 3, 2, ['Job search strategy', 'Resume and portfolio', 'Finding internships', 'SQL and database design'], {
    headline: 'Backend Developer · BS Data Science ’24',
    availability: 'Flexible',
  }),
  mentor('m05', 'Manoj Pillai', 1, 1, ['Machine learning']),
]

// Deterministic ranking: shared tags (more first), active mentees (fewer first), mentor id.
const rank = (mentors, tags) =>
  mentors
    .map((m) => ({ ...m, shared: m.expertise.filter((t) => tags.includes(t)).length }))
    .filter((m) => m.available && m.load < m.capacity)
    .sort((a, b) => b.shared - a.shared || a.load - b.load || a.id.localeCompare(b.id))

const listOf = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])
const withArticle = (role) => `${/^[AEIOU]/i.test(role) ? 'an' : 'a'} ${role}`

// "Why this mentor" note. Stand-in for the AI until the Flask API is connected: the AI gets the
// problem, its tags and the guidance preferences plus the mentor's profile, never the CGPA.
// It only explains the ranking above; it never reorders or picks a mentor.
function fitNote(p, m) {
  const first = m.name.split(' ')[0]
  const role = withArticle(m.headline.split(' · ')[0])
  const covered = m.expertise.filter((t) => p.tags.includes(t))
  const missing = p.tags.filter((t) => !m.expertise.includes(t))
  return [
    covered.length
      ? `${first} works as ${role} and covers ${listOf(covered)}, which this problem asks about.`
      : `${first} works as ${role} but shares no topic with this problem.`,
    missing.length ? `Not covered: ${listOf(missing)}.` : 'Covers every tag on this problem.',
    m.style === p.guidance
      ? `Their style (“${m.style}”) matches what the student asked for.`
      : `Their style (“${m.style}”) differs from the student’s preference (“${p.guidance}”).`,
  ].join(' ')
}

// Opening a submitted problem starts the review.
const openProblem = (id) => {
  const p = PROBLEMS.find((x) => x.id === id)
  return p && { ...p, status: p.status === 'Submitted' ? 'Under review' : p.status }
}

export default function ReviewAssign() {
  const { id } = useParams()
  const { user } = useAuth()
  const [p, setP] = useState(() => openProblem(id))
  const [mentors, setMentors] = useState(MENTORS)
  const [showAll, setShowAll] = useState(false)
  const [error, setError] = useState('')
  const [closing, setClosing] = useState(false)
  const [notes, setNotes] = useState('off') // AI fit notes: 'off' | 'writing' | 'on'

  if (!p) {
    return (
      <p>
        This problem wasn’t found. <Link to="/iic">Back to the problem queue</Link>
      </p>
    )
  }

  const { student } = p
  const ranked = rank(mentors, p.tags)
  const shown = showAll ? ranked : ranked.filter((m) => m.shared > 0).slice(0, 4)
  const assigned = ['Awaiting mentor', 'Mentor assigned'].includes(p.status) // a student has one mentor at a time
  const closed = p.status === 'Closed by IIC'
  const respondBy = p.assignedAt && new Date(new Date(p.assignedAt).getTime() + ACCEPT_HOURS * 36e5).toISOString()

  function assign(m) {
    if (m.load >= m.capacity) return setError(`${m.name} is at capacity and can’t be assigned another student.`)
    setP({
      ...p,
      status: 'Awaiting mentor',
      mentor: m.name,
      assignedBy: user.name,
      assignedAt: new Date().toISOString(),
      reassignReason: undefined, // assigning clears it
    })
    setMentors(mentors.map((x) => (x.id === m.id ? { ...x, load: x.load + 1 } : x)))
    setError('')
  }

  function explainFit() {
    setNotes('writing')
    setTimeout(() => setNotes('on'), 900) // the AI call, once the API is connected
  }

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
            {p.status !== 'Mentor assigned' && !closed && (
              <Button variant="outline-danger" size="sm" onClick={() => setClosing(true)}>
                Close this problem
              </Button>
            )}
          </Section>
        </Col>

        <Col lg={6}>
          {closed && (
            <Section title="Problem closed">
              <p className="mb-1">
                <strong>Reason:</strong> {p.closeReason}
              </p>
              <p className="small text-muted mb-0">{student.name} has been notified and can submit a new problem.</p>
            </Section>
          )}
          {assigned && (
            <Section title="Assigned mentor">
              <Details
                items={[
                  ['Mentor', p.mentor],
                  ['Assigned', fmtDate(p.assignedAt)],
                  p.status === 'Awaiting mentor' ? ['Waiting for a response by', fmtDateTime(respondBy)] : ['Status', 'Accepted'],
                ]}
              />
            </Section>
          )}
          {!assigned && !closed && (
            <Section
              title={showAll ? 'All eligible mentors' : 'Recommended mentors'}
              action={
                <div className="d-flex flex-wrap justify-content-end gap-2">
                  {notes === 'on' ? (
                    <Button size="sm" variant="outline-secondary" onClick={() => setNotes('off')}>
                      Hide AI notes
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline-primary" disabled={notes === 'writing' || !shown.length} onClick={explainFit}>
                      <i className="bi bi-stars me-1" />
                      {notes === 'writing' ? 'Writing notes…' : 'Explain fit with AI'}
                    </Button>
                  )}
                  <Button size="sm" variant="outline-primary" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Back to recommendations' : 'Browse all eligible mentors'}
                  </Button>
                </div>
              }
            >
              {notes === 'on' && (
                <p className="small text-muted">
                  <i className="bi bi-stars text-primary me-1" />
                  AI notes explain the ranking; they don’t change it. Check each mentor’s profile before you assign.
                </p>
              )}
              {error && (
                <Alert variant="danger" className="small">
                  {error}
                </Alert>
              )}
              {shown.length < LOW_CAPACITY && (
                <Alert variant="warning" className="small">
                  {shown.length === 0 ? 'No mentors have spare capacity.' : 'Few mentors have spare capacity.'}{' '}
                  <Link to="/iic/mentors">Ask available mentors to take on more.</Link>
                </Alert>
              )}
              <ListGroup variant="flush">
                {shown.map((m, i) => (
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
                      {notes === 'on' && (
                        <div className="small bg-primary-subtle text-primary-emphasis rounded p-2 mt-2">
                          <i className="bi bi-stars me-1" />
                          <strong>Why this mentor (AI):</strong> {fitNote(p, m)}
                        </div>
                      )}
                    </div>
                    <Button size="sm" onClick={() => assign(m)}>
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
        onConfirm={(reason) => setP({ ...p, status: 'Closed by IIC', closeReason: reason })}
      >
        {student.name} is notified with your reason and can submit a new problem.
      </ReasonModal>
    </>
  )
}
