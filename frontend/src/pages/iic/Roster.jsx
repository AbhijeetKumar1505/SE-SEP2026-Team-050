import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { getRoster, importRoster, removeStudent } from '../../api/iic'
import CsvImportModal from '../../components/CsvImportModal'
import DataTable from '../../components/DataTable'
import FilterBar from '../../components/FilterBar'
import ImportResult from '../../components/ImportResult'
import Loading from '../../components/Loading'
import ReasonModal from '../../components/ReasonModal'
import StatusBadge from '../../components/StatusBadge'
import useFetch from '../../hooks/useFetch'
import useFilter, { chipsBy } from '../../hooks/useFilter'

const account = (s) => (s.signedUp ? 'Signed up' : 'Not signed up')
const CHIPS = chipsBy('All', ['Signed up', 'Not signed up'], account)

export default function Roster() {
  const [data, reload] = useFetch(getRoster)
  const filter = useFilter(data?.students ?? [], CHIPS, (s) => [s.name, s.roll, s.email])
  const [importing, setImporting] = useState(false)
  const [removing, setRemoving] = useState(null) // student id
  if (!data) return <Loading />

  const columns = [
    { header: 'Name', cell: (s) => <strong>{s.name}</strong> },
    { header: 'Roll number', cell: (s) => s.roll },
    { header: 'Institute email', cell: (s) => s.email },
    { header: 'Account', cell: (s) => <StatusBadge status={account(s)} /> },
    { header: 'Profile', cell: (s) => (s.signedUp ? (s.profileComplete ? 'Complete' : 'Incomplete') : '—') },
    { header: '', cell: (s) => <Button size="sm" variant="outline-danger" onClick={() => setRemoving(s.id)}>Remove</Button> },
  ]

  return (
    <>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h1 className="h3">Registered students</h1>
          <p className="text-muted">Only students on this roster can sign up.</p>
        </div>
        <Button onClick={() => setImporting(true)}>Import CSV</Button>
      </div>
      <ImportResult result={data.lastImport} />
      <FilterBar chips={CHIPS} {...filter} placeholder="Search name, roll number or email" />
      <DataTable columns={columns} rows={filter.filtered} empty="No students match." />

      <CsvImportModal
        show={importing}
        title="Import the student roster"
        columns={['name', 'roll number', 'institute email']}
        hint="Re-importing a roll number updates that student instead of duplicating them."
        onClose={() => setImporting(false)}
        onImport={async (rows, file) => {
          const result = await importRoster(rows, file)
          reload()
          return result
        }}
      />
      <ReasonModal
        show={removing !== null}
        title="Remove this student?"
        submitLabel="Remove student"
        onClose={() => setRemoving(null)}
        onConfirm={(reason) => removeStudent(removing, reason).then(reload)}
      >
        They won’t be able to sign up or submit new problems (“You are not registered with IIC”). The removal is recorded in the audit log.
      </ReasonModal>
    </>
  )
}
