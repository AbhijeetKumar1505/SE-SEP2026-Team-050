import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Pill from '../../components/Pill'
import { getMonitoring } from '../../api/iic'
import DataTable from '../../components/DataTable'
import FilterBar from '../../components/FilterBar'
import Loading from '../../components/Loading'
import Section from '../../components/Section'
import { FLAGS } from '../../constants/iic'
import useFetch from '../../hooks/useFetch'
import useFilter from '../../hooks/useFilter'
import { fmtDate, fmtDateTime, plural } from '../../utils/format'

const CHIPS = {
  all: { label: 'All' },
  ...Object.fromEntries(Object.entries(FLAGS).map(([key, { label }]) => [key, { label, test: (r) => r.flags.includes(key) }])),
}

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
  const [data] = useFetch(getMonitoring)
  const filter = useFilter(data?.rows ?? [], CHIPS, (r) => [r.student, r.mentor])
  if (!data) return <Loading />

  const { rows, cases, settings, dailyChecks } = data
  const hints = Object.fromEntries(Object.entries(FLAGS).map(([key, f]) => [key, f.hint(settings)]))
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
            <Pill key={f} tone="warning">
              {FLAGS[f].label}
            </Pill>
          ))}
        </span>
      ),
    },
    {
      header: '',
      cell: (r) =>
        r.caseId && (
          <Button as={Link} to={`/iic/cases/${r.caseId}`} size="sm" variant="outline-primary">
            Open case
          </Button>
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
