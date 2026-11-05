import { Alert, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getQueue } from '../../api/iic'
import DataTable from '../../components/DataTable'
import FilterBar from '../../components/FilterBar'
import Loading from '../../components/Loading'
import StatusBadge from '../../components/StatusBadge'
import Tags from '../../components/Tags'
import { PROBLEM_STATUSES } from '../../constants/iic'
import useFetch from '../../hooks/useFetch'
import useFilter, { chipsBy } from '../../hooks/useFilter'
import { daysSince, fmtDate, plural } from '../../utils/format'

const CHIPS = chipsBy('All open', PROBLEM_STATUSES, (p) => p.status)

const columns = [
  { header: 'Submitted', cell: (p) => fmtDate(p.submittedAt) },
  { header: 'Student', cell: (p) => <><strong>{p.student.name}</strong><div className="small text-muted">{p.student.roll}</div></> },
  { header: 'Topic tags', cell: (p) => <Tags tags={p.tags} /> },
  { header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
  { header: 'Waiting', cell: (p) => plural(daysSince(p.submittedAt), 'day') },
  { header: '', cell: (p) => <Button as={Link} to={`/iic/problems/${p.id}`} size="sm" variant="outline-primary">Open</Button> },
]

export default function ProblemQueue() {
  const [data] = useFetch(getQueue)
  const filter = useFilter(data?.problems ?? [], CHIPS, (p) => [p.student.name, p.student.roll])
  if (!data) return <Loading />

  const reassign = data.problems.filter((p) => p.status === 'Reassignment needed')
  return (
    <>
      <h1 className="h3">Problem queue</h1>
      <p className="text-muted">Oldest first. Problems that need reassignment are pinned to the top.</p>
      {reassign.length > 0 && (
        <Alert variant="danger">
          <strong>{plural(reassign.length, 'problem')} need{reassign.length === 1 && 's'} reassignment</strong>
          <ul className="small mb-0 mt-1">
            {reassign.map((p) => <li key={p.id}>{p.student.name}: {p.reassignReason}</li>)}
          </ul>
        </Alert>
      )}
      <FilterBar chips={CHIPS} {...filter} placeholder="Search by name or roll number" />
      <DataTable columns={columns} rows={filter.filtered} empty="No problems match." />
      <p className="small text-muted mt-2">
        Showing {filter.filtered.length} of {data.problems.length}. Withdrawn and closed problems leave the queue.
      </p>
    </>
  )
}
