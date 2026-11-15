import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Pill from '../../components/Pill'
import DataTable from '../../components/DataTable'
import FilterBar from '../../components/FilterBar'
import Section from '../../components/Section'
import { FLAGS } from '../../constants/iic'
import useFilter from '../../hooks/useFilter'
import { dayOffset, daysSince, fmtDate, fmtDateTime, hoursAgo, plural } from '../../utils/format'

const CHIPS = {
  all: { label: 'All' },
  ...Object.fromEntries(Object.entries(FLAGS).map(([key, { label }]) => [key, { label, test: (r) => r.flags.includes(key) }])),
}

// Timing windows from Settings (I7).
const SETTINGS = { firstSessionDays: 10, inactiveDays: 14, feedbackOverdueDays: 7 }

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
// logged / confirmed = held sessions; lastAgo = days since the last held one.
const mentorship = (id, student, mentor, startedAgo, logged, confirmed, lastAgo, checkpointIn, extra) => ({
  id,
  student,
  mentor,
  startedAt: dayOffset(-startedAgo),
  logged,
  confirmed,
  lastSession: logged ? dayOffset(-lastAgo) : null,
  checkpointDue: dayOffset(checkpointIn),
  progress: null,
  caseId: null,
  reassign: false, // its problem is back in the queue as Reassignment needed
  wellbeing: false, // the AI flagged a feedback comment for IIC to read (see MentorshipReview)
  ...extra,
})

const MENTORSHIPS = [
  mentorship('r1', 'Karan Mehta', 'Meera Iyer', 20, 0, 0, null, 4, { reassign: true }),
  mentorship('r2', 'Sneha Pillai', 'Arjun Shah', 34, 1, 1, 20, 3, { reassign: true, wellbeing: true, progress: 'Some progress' }),
  mentorship('r3', 'Fatima Khan', 'Priya Natarajan', 26, 3, 2, 10, -9, { progress: 'Some progress', caseId: 'C-014' }),
  mentorship('r4', 'Divya Menon', 'Manoj Pillai', 11, 0, 0, null, 3),
  mentorship('r6', 'Karthik Subramanian', 'Rahul Menon', 25, 2, 1, 10, 3, { progress: 'Some progress' }),
  mentorship('r7', 'Rohan Gupta', 'Meera Iyer', 35, 5, 5, 1, 5, { progress: 'Goal met' }),
]

const flagsOf = (m) =>
  [
    m.reassign && 'reassign',
    !m.logged && daysSince(m.startedAt) >= SETTINGS.firstSessionDays && 'firstSession',
    daysSince(m.lastSession ?? m.startedAt) >= SETTINGS.inactiveDays && 'inactive',
    daysSince(m.checkpointDue) >= SETTINGS.feedbackOverdueDays && 'feedback',
    m.wellbeing && 'wellbeing',
  ].filter(Boolean)

const ROWS = MENTORSHIPS.map((m) => ({ ...m, flags: flagsOf(m) })).sort((a, b) => b.flags.length - a.flags.length) // flagged first

const CASES = [{ id: 'C-014', type: 'Change request', student: 'Fatima Khan', mentor: 'Priya Natarajan', openedAt: hoursAgo(30) }]

const DAILY_CHECKS = { lastRun: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), reminders: 3 }

const caseColumns = [
  { header: 'Case', cell: (c) => c.id },
  { header: 'Type', cell: (c) => c.type },
  { header: 'Student', cell: (c) => c.student },
  { header: 'Mentor', cell: (c) => c.mentor },
  { header: 'Opened', cell: (c) => fmtDate(c.openedAt) },
  {
    header: '',
    cell: (c) => (
      <Button as={Link} to={`/iic/cases/${c.id}`} size="sm" variant="outline-primary">
        Open case
      </Button>
    ),
  },
]

export default function Monitoring() {
  // This page only reads its data.
  const rows = ROWS
  const cases = CASES
  const dailyChecks = DAILY_CHECKS
  const filter = useFilter(rows, CHIPS, (r) => [r.student, r.mentor])
  const hints = Object.fromEntries(Object.entries(FLAGS).map(([key, f]) => [key, f.hint(SETTINGS)]))
  const columns = [
    {
      header: 'Student → mentor',
      cell: (r) => (
        <>
          <strong>{r.student}</strong> → {r.mentor}
        </>
      ),
    },
    { header: 'Started', cell: (r) => fmtDate(r.startedAt) },
    { header: 'Sessions', cell: (r) => `${r.logged} logged · ${r.confirmed} confirmed` },
    { header: 'Last session', cell: (r) => (r.lastSession ? fmtDate(r.lastSession) : '—') },
    { header: 'Latest progress', cell: (r) => r.progress ?? '—' },
    {
      header: 'Flags',
      cell: (r) => (
        <span className="d-flex flex-wrap gap-1">
          {r.flags.map((f) => (
            <Pill key={f} tone={f === 'wellbeing' ? 'danger' : 'warning'}>
              {FLAGS[f].label}
            </Pill>
          ))}
        </span>
      ),
    },
    {
      header: '',
      cell: (r) => (
        <span className="d-flex justify-content-end gap-2 text-nowrap">
          {r.caseId && (
            <Button as={Link} to={`/iic/cases/${r.caseId}`} size="sm" variant="outline-secondary">
              Open case
            </Button>
          )}
          <Button as={Link} to={`/iic/mentorships/${r.id}`} size="sm" variant="outline-primary">
            Open
          </Button>
        </span>
      ),
    },
  ]

  return (
    <>
      <h1 className="h3">Active mentorships</h1>
      <p className="text-muted">
        {plural(rows.length, 'active mentorship')} across {new Set(rows.map((r) => r.mentor)).size} mentors
      </p>
      {cases.length > 0 && (
        <Section title={`Open cases (${cases.length})`}>
          <DataTable columns={caseColumns} rows={cases} />
        </Section>
      )}
      <FilterBar chips={CHIPS} {...filter} hints={hints} placeholder="Search student or mentor" />
      <DataTable columns={columns} rows={filter.filtered} empty="No mentorships match." />
      <p className="small text-muted mt-2">
        Flagged rows come first. Last daily check: {fmtDateTime(dailyChecks.lastRun)}, {plural(dailyChecks.reminders, 'reminder')} sent.
      </p>
    </>
  )
}
