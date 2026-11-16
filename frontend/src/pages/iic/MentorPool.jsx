import { useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { addMentor, getMentors, importMentors, requestCapacity, resendActivation, verifyMentor } from '../../api/iic'
import ConfirmModal from '../../components/ConfirmModal'
import CsvImportModal from '../../components/CsvImportModal'
import DataTable from '../../components/DataTable'
import FilterBar from '../../components/FilterBar'
import Loading from '../../components/Loading'
import StatusBadge from '../../components/StatusBadge'
import Tags from '../../components/Tags'
import { MENTOR_STATUSES } from '../../constants/iic'
import useFetch from '../../hooks/useFetch'
import useFilter, { chipsBy } from '../../hooks/useFilter'
import AddMentorModal from './AddMentorModal'
import VerifyPanel from './VerifyPanel'

const CHIPS = chipsBy('All', MENTOR_STATUSES, (m) => m.status)

export default function MentorPool() {
  const [mentors, reload] = useFetch(getMentors)
  const filter = useFilter(mentors ?? [], CHIPS, (m) => [m.name, m.email])
  const [modal, setModal] = useState(null) // 'add' | 'import'
  const [verifying, setVerifying] = useState(null)
  const [asking, setAsking] = useState(null) // mentor to ask for more capacity
  const [link, setLink] = useState(null) // activation link just "emailed"
  if (!mentors) return <Loading />

  const active = (m) => m.status === 'Active'
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
        <Button size="sm" variant="outline-secondary" onClick={() => resendActivation(m.id).then((r) => setLink(r.link))}>
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
          Activation link emailed (valid for 7 days). Prototype shortcut: <Link to={link}>open the link</Link>.
        </Alert>
      )}
      <FilterBar chips={CHIPS} {...filter} placeholder="Search by name or email" />
      <DataTable columns={columns} rows={filter.filtered} empty="No mentors match." />

      {verifying && (
        <VerifyPanel
          mentor={verifying}
          onClose={() => setVerifying(null)}
          onVerify={(id, tags) =>
            verifyMentor(id, tags).then((r) => {
              setLink(r.link)
              reload()
            })
          }
        />
      )}
      <AddMentorModal show={modal === 'add'} onClose={() => setModal(null)} onAdd={(m) => addMentor(m).then(reload)} />
      <ConfirmModal
        show={asking !== null}
        title="Ask for more capacity?"
        submitLabel="Send request"
        onClose={() => setAsking(null)}
        onConfirm={() => requestCapacity(asking.id).then(reload)}
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
        onImport={async (rows, file) => {
          const result = await importMentors(rows, file)
          reload()
          return result
        }}
      />
    </>
  )
}
