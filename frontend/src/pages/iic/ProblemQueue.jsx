import { Alert, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import DataTable from '../../components/DataTable'
import FilterBar from '../../components/FilterBar'
import StatusBadge from '../../components/StatusBadge'
import Tags from '../../components/Tags'
import { PROBLEM_STATUSES } from '../../constants/iic'
import useFilter, { chipsBy } from '../../hooks/useFilter'
import { dayOffset, daysSince, fmtDate, plural } from '../../utils/format'

const CHIPS = chipsBy('All open', PROBLEM_STATUSES, (p) => p.status)

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
const problem = (id, name, roll, daysAgo, status, tags, reassignReason) => ({
  id,
  student: { name, roll },
  submittedAt: dayOffset(-daysAgo),
  status,
  tags,
  reassignReason,
})

const PROBLEMS = [
  problem(
    'p1',
    'Karan Mehta',
    '22f3001876',
    9,
    'Reassignment needed',
    ['SQL and database design', 'Data engineering'],
    'the assigned mentor didn’t respond within 72 h.',
  ),
  problem(
    'p2',
    'Sneha Pillai',
    '23f2000451',
    7,
    'Reassignment needed',
    ['Machine learning', 'Python programming'],
    'the mentorship has been inactive for 14 days.',
  ),
  problem('p3', 'Ananya Rao', '23f1002345', 3, 'Submitted', [
    'Data engineering',
    'SQL and database design',
    'Industry and role requirements',
  ]),
  problem('p4', 'Rohit Verma', '23f1004420', 2, 'Submitted', ['Job search strategy', 'Resume and portfolio']),
  problem('p5', 'Vikram Das', '23f3002201', 1, 'Submitted', ['Machine learning', 'Choosing a master’s programme']),
  problem('p6', 'Neha Joshi', '21f1005567', 1, 'Awaiting mentor', ['Choosing a career path', 'Job search strategy']),
]

// Reassignment needed is pinned to the top, then oldest first.
const QUEUE = PROBLEMS.toSorted(
  (a, b) => (b.status === 'Reassignment needed') - (a.status === 'Reassignment needed') || a.submittedAt.localeCompare(b.submittedAt),
)

const columns = [
  { header: 'Submitted', cell: (p) => fmtDate(p.submittedAt) },
  {
    header: 'Student',
    cell: (p) => (
      <>
        <strong>{p.student.name}</strong>
        <div className="small text-muted">{p.student.roll}</div>
      </>
    ),
  },
  { header: 'Topic tags', cell: (p) => <Tags tags={p.tags} /> },
  { header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
  { header: 'Waiting', cell: (p) => plural(daysSince(p.submittedAt), 'day') },
  {
    header: '',
    cell: (p) => (
      <Button as={Link} to={`/iic/problems/${p.id}`} size="sm" variant="outline-primary">
        Open
      </Button>
    ),
  },
]

export default function ProblemQueue() {
  const problems = QUEUE // this page only reads the queue
  const filter = useFilter(problems, CHIPS, (p) => [p.student.name, p.student.roll])

  const reassign = problems.filter((p) => p.status === 'Reassignment needed')
  return (
    <>
      <h1 className="h3 mb-4">Problem queue</h1>
      {reassign.length > 0 && (
        <Alert variant="danger">
          <strong>
            {plural(reassign.length, 'problem')} need{reassign.length === 1 && 's'} reassignment
          </strong>
          <ul className="small mb-0 mt-1">
            {reassign.map((p) => (
              <li key={p.id}>
                {p.student.name}: {p.reassignReason}
              </li>
            ))}
          </ul>
        </Alert>
      )}
      <FilterBar chips={CHIPS} {...filter} placeholder="Search by name or roll number" />
      <DataTable columns={columns} rows={filter.filtered} empty="No problems match." />
      <p className="small text-muted mt-2">
        Showing {filter.filtered.length} of {problems.length}
      </p>
    </>
  )
}
