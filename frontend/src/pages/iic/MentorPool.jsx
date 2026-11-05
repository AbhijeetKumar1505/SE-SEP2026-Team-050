import { useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { addMentor, getMentors, importMentors, resendActivation, verifyMentor } from '../../api/iic'
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
  const [link, setLink] = useState(null) // activation link just "emailed"
  if (!mentors) return <Loading />

  const active = (m) => m.status === 'Active'
  const columns = [
    { header: 'Mentor', cell: (m) => <><strong>{m.name}</strong><div className="small text-muted">{m.email}</div></> },
    { header: 'Expertise', cell: (m) => (m.expertise.length ? <Tags tags={m.expertise} /> : '—') },
    { header: 'Status', cell: (m) => <StatusBadge status={m.status} /> },
    { header: 'Availability', cell: (m) => (active(m) ? (m.available ? 'Available' : 'Unavailable') : '—') },
    { header: 'Load', cell: (m) => (active(m) ? `${m.load} / ${m.capacity}` : '—') },
    {
      header: '',
      cell: (m) =>
        m.status === 'Pending verification' ? (
          <Button size="sm" variant="outline-primary" onClick={() => setVerifying(m)}>Verify</Button>
        ) : (
          m.status === 'Verified – not activated' && (
            <Button size="sm" variant="outline-secondary" onClick={() => resendActivation(m.id).then((r) => setLink(r.link))}>Resend link</Button>
          )
        ),
    },
  ]

  return (
    <>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h1 className="h3">Mentor pool</h1>
          <p className="text-muted">Only verified mentors who have activated their account are recommended or assignable.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setModal('add')}>Add mentor</Button>
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

      {verifying && <VerifyPanel mentor={verifying} onClose={() => setVerifying(null)} onVerify={(id, tags) => verifyMentor(id, tags).then((r) => { setLink(r.link); reload() })} />}
      <AddMentorModal show={modal === 'add'} onClose={() => setModal(null)} onAdd={(m) => addMentor(m).then(reload)} />
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
