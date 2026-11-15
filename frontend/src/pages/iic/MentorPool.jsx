import { useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import CsvImportModal from '../../components/CsvImportModal'
import DataTable from '../../components/DataTable'
import FilterBar from '../../components/FilterBar'
import StatusBadge from '../../components/StatusBadge'
import Tags from '../../components/Tags'
import { MENTOR_STATUSES } from '../../constants/iic'
import { TAGS } from '../../constants/tags'
import { useAuth } from '../../context/useAuth'
import useFilter, { chipsBy } from '../../hooks/useFilter'
import { EMAIL } from '../../utils/rules'
import AddMentorModal from './AddMentorModal'
import VerifyPanel from './VerifyPanel'

const CHIPS = chipsBy('All', MENTOR_STATUSES, (m) => m.status)
const DEFAULT_CAPACITY = 1 // capacity of a newly added mentor

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
const mentor = (id, name, status, extra) => ({
  id,
  name,
  status,
  email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
  headline: 'Data Engineer · BS Data Science ’24',
  available: status === 'Active',
  capacity: 1,
  load: 0, // active mentorships + assignments waiting for their answer
  capacityRequested: false,
  expertise: [],
  channel: 'Google Meet',
  timezone: 'IST (UTC+05:30)',
  experience: ['Data Engineer · 2 years'],
  ...extra,
})

const MENTORS = [
  mentor('m01', 'Rahul Menon', 'Active', {
    capacity: 3,
    load: 2,
    capacityRequested: true,
    expertise: ['Data engineering', 'SQL and database design', 'Python programming', 'Job search strategy'],
    experience: ['Data Engineer · 2 years', 'Analytics intern · 6 months', 'Real-time pipeline with Kafka · 3 months'],
  }),
  mentor('m02', 'Priya Natarajan', 'Active', {
    capacity: 2,
    load: 1,
    headline: 'Analytics Engineer · BS Data Science ’23',
    timezone: 'UTC-4',
    expertise: ['Data engineering', 'Machine learning', 'Technical interview preparation'],
  }),
  mentor('m03', 'Arjun Shah', 'Active', {
    capacity: 2,
    load: 1,
    available: false,
    headline: 'Data Platform Lead · BS Data Science ’22',
    expertise: ['Data engineering', 'Python programming'],
  }),
  mentor('m04', 'Meera Iyer', 'Active', {
    capacity: 3,
    load: 2,
    headline: 'Backend Developer · BS Data Science ’24',
    expertise: ['Job search strategy', 'Resume and portfolio', 'Finding internships', 'SQL and database design'],
  }),
  mentor('m05', 'Manoj Pillai', 'Active', { load: 1, expertise: ['Machine learning'] }),
  mentor('m06', 'Imran Qureshi', 'Verified – not activated', { expertise: ['Web development'], verifiedBy: 'Deepa Krishnan' }),
  mentor('m07', 'Lakshmi Rao', 'Pending verification', {
    headline: 'Graduated · BS Data Science ’22',
    channel: 'Email',
    timezone: 'UTC+01:00',
    experience: ['Research, PhD student at TU Munich · 2 years'],
  }),
  mentor('m08', 'Sameer Kulkarni', 'Pending verification'),
  mentor('m09', 'Nisha George', 'Pending verification'),
  mentor('m10', 'Vivek Anand', 'Removed'),
]

const KNOWN_TAGS = TAGS.map((t) => t.name)
const split = (s = '') =>
  s
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean)

// Why a CSV row can't be imported, or nothing when it's fine.
function rowError(r) {
  if (!r.name) return 'Name is missing.'
  if (!EMAIL.value.test(r.email)) return 'Email is not valid.'
  const unknown = split(r['expertise tags']).find((t) => !KNOWN_TAGS.includes(t))
  if (unknown) return `Unknown topic tag: ${unknown}.`
}

export default function MentorPool() {
  const { user } = useAuth()
  const [mentors, setMentors] = useState(MENTORS)
  const filter = useFilter(mentors, CHIPS, (m) => [m.name, m.email])
  const [modal, setModal] = useState(null) // 'add' | 'import'
  const [verifying, setVerifying] = useState(null)
  const [asking, setAsking] = useState(null) // mentor to ask for more capacity
  const [link, setLink] = useState(null) // activation link just "emailed": { to, state }

  const active = (m) => m.status === 'Active'
  const change = (id, values) => setMentors((list) => list.map((m) => (m.id === id ? { ...m, ...values } : m)))

  // "Sends" the 7-day activation email; the prototype shows the link so it can be opened.
  function sendActivation(m, verifiedBy) {
    setLink({ to: `/activate/${Date.now().toString(36)}`, state: { name: m.name, verifiedBy } })
  }

  function verify(id, expertise) {
    const m = mentors.find((x) => x.id === id)
    change(id, { status: 'Verified – not activated', expertise, verifiedBy: user.name })
    sendActivation(m, user.name)
  }

  function addMentor({ name, email, headline }) {
    if (mentors.some((m) => m.email === email)) throw new Error('A mentor with this email already exists.')
    setMentors([...mentors, mentor(`m-${Date.now()}`, name, 'Pending verification', { email, headline, experience: [] })])
  }

  // Saves the good rows and reports the rest with row number and reason.
  function importMentors(rows, file) {
    const result = { file, by: user.name, at: new Date().toISOString(), added: 0, updated: 0, errors: [] }
    let list = mentors
    rows.forEach((r, i) => {
      const reason = rowError(r)
      if (reason) return result.errors.push({ row: i + 2, reason }) // row 1 is the header
      const data = { name: r.name, email: r.email, expertise: split(r['expertise tags']), experience: split(r.experience) }
      if (list.some((m) => m.email === r.email)) {
        list = list.map((m) => (m.email === r.email ? { ...m, ...data } : m))
        result.updated += 1
      } else {
        list = [
          ...list,
          mentor(`m-${Date.now()}-${i}`, r.name, 'Pending verification', { ...data, headline: '', capacity: DEFAULT_CAPACITY }),
        ]
        result.added += 1
      }
    })
    setMentors(list)
    return result
  }

  const action = (m) => {
    if (m.status === 'Pending verification') {
      return (
        <Button size="sm" variant="outline-primary" onClick={() => setVerifying(m)}>
          Verify
        </Button>
      )
    }
    if (m.status === 'Verified – not activated') {
      return (
        <Button size="sm" variant="outline-secondary" onClick={() => sendActivation(m, m.verifiedBy)}>
          Resend link
        </Button>
      )
    }
    if (active(m) && m.available) {
      return m.capacityRequested ? (
        <span className="small text-muted">Capacity request pending</span>
      ) : (
        <Button size="sm" variant="outline-secondary" onClick={() => setAsking(m)}>
          Ask for more capacity
        </Button>
      )
    }
    return null
  }
  const columns = [
    {
      header: 'Mentor',
      cell: (m) => (
        <>
          <strong>{m.name}</strong>
          <div className="small text-muted">{m.email}</div>
        </>
      ),
    },
    { header: 'Expertise', cell: (m) => (m.expertise.length ? <Tags tags={m.expertise} /> : '—') },
    { header: 'Status', cell: (m) => <StatusBadge status={m.status} /> },
    { header: 'Availability', cell: (m) => (active(m) ? (m.available ? 'Available' : 'Unavailable') : '—') },
    { header: 'Load', cell: (m) => (active(m) ? `${m.load} / ${m.capacity}` : '—') },
    { header: '', cell: action },
  ]

  return (
    <>
      <div className="d-flex justify-content-between align-items-start">
        <h1 className="h3 mb-4">Mentor pool</h1>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setModal('add')}>
            Add mentor
          </Button>
          <Button onClick={() => setModal('import')}>Import CSV</Button>
        </div>
      </div>
      {link && (
        <Alert variant="success" dismissible onClose={() => setLink(null)} className="small">
          Activation link emailed (valid for 7 days). Prototype shortcut:{' '}
          <Link to={link.to} state={link.state}>
            open the link
          </Link>
          .
        </Alert>
      )}
      <FilterBar chips={CHIPS} {...filter} placeholder="Search by name or email" />
      <DataTable columns={columns} rows={filter.filtered} empty="No mentors match." />

      {verifying && <VerifyPanel mentor={verifying} onClose={() => setVerifying(null)} onVerify={verify} />}
      <AddMentorModal show={modal === 'add'} onClose={() => setModal(null)} onAdd={addMentor} />
      <ConfirmModal
        show={asking !== null}
        title="Ask for more capacity?"
        submitLabel="Send request"
        onClose={() => setAsking(null)}
        onConfirm={() => change(asking.id, { capacityRequested: true })}
      >
        {asking?.name} will see the request on their dashboard. If they accept, their capacity goes from {asking?.capacity} to{' '}
        {asking && asking.capacity + 1}.
      </ConfirmModal>
      <CsvImportModal
        show={modal === 'import'}
        title="Import mentors from CSV"
        columns={['name', 'email', 'expertise tags', 'experience']}
        hint="Separate several tags or experiences with “;”. Re-importing an email updates that mentor."
        onClose={() => setModal(null)}
        onImport={importMentors}
      />
    </>
  )
}
