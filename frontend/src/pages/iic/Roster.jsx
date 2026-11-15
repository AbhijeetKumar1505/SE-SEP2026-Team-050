import { useState } from 'react'
import { Button } from 'react-bootstrap'
import CsvImportModal from '../../components/CsvImportModal'
import DataTable from '../../components/DataTable'
import FilterBar from '../../components/FilterBar'
import ImportResult from '../../components/ImportResult'
import ReasonModal from '../../components/ReasonModal'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/useAuth'
import useFilter, { chipsBy } from '../../hooks/useFilter'
import { hoursAgo } from '../../utils/format'

const account = (s) => (s.signedUp ? 'Signed up' : 'Not signed up')
const CHIPS = chipsBy('All', ['Signed up', 'Not signed up'], account)
const ROLL = /^\d{2}f\d{7}$/i
const DOMAINS = ['ds.study.iitm.ac.in', 'es.study.iitm.ac.in'] // approved in Settings (I7)

// Sample data for this page. Each page keeps its own data until the Flask API is connected.
const student = (name, roll, signedUp, profileComplete) => ({
  id: roll,
  name,
  roll,
  email: `${roll}@${DOMAINS[0]}`,
  signedUp,
  profileComplete,
})

const STUDENTS = [
  student('Ananya Rao', '23f1002345', true, true),
  student('Karan Mehta', '22f3001876', true, true),
  student('Rohit Verma', '23f1004420', true, false),
  student('Fatima Khan', '22f1000932', true, true),
  student('Aditya Nair', '24f1000876', false, false),
  student('Meghna Bose', '23f3004512', false, false),
]

const LAST_IMPORT = {
  file: 'roster_nov_2026.csv',
  by: 'Deepa Krishnan',
  at: hoursAgo(50),
  added: 310,
  updated: 0,
  errors: [
    { row: 14, reason: 'Roll number is not valid (letter O instead of 0).' },
    { row: 31, reason: 'Email is not on an approved domain.' },
  ],
}

// Why a CSV row can't be imported, or nothing when it's fine.
function rowError(r) {
  if (!r.name) return 'Name is missing.'
  if (!ROLL.test(r['roll number'])) return 'Roll number is not valid.'
  if (!DOMAINS.includes(r['institute email']?.split('@')[1])) return 'Email is not on an approved domain.'
}

export default function Roster() {
  const { user } = useAuth()
  const [students, setStudents] = useState(STUDENTS)
  const [lastImport, setLastImport] = useState(LAST_IMPORT)
  const filter = useFilter(students, CHIPS, (s) => [s.name, s.roll, s.email])
  const [importing, setImporting] = useState(false)
  const [removing, setRemoving] = useState(null) // student id

  // Saves the good rows and reports the rest. Re-importing a roll number updates that student.
  function importRoster(rows, file) {
    const result = { file, by: user.name, at: new Date().toISOString(), added: 0, updated: 0, errors: [] }
    let list = students
    rows.forEach((r, i) => {
      const reason = rowError(r)
      if (reason) return result.errors.push({ row: i + 2, reason }) // row 1 is the header
      const roll = r['roll number']
      if (list.some((s) => s.id === roll)) {
        list = list.map((s) => (s.id === roll ? { ...s, name: r.name, email: r['institute email'] } : s))
        result.updated += 1
      } else {
        list = [...list, { ...student(r.name, roll, false, false), email: r['institute email'] }]
        result.added += 1
      }
    })
    setStudents(list)
    setLastImport(result)
    return result
  }

  const columns = [
    { header: 'Name', cell: (s) => <strong>{s.name}</strong> },
    { header: 'Roll number', cell: (s) => s.roll },
    { header: 'Institute email', cell: (s) => s.email },
    { header: 'Account', cell: (s) => <StatusBadge status={account(s)} /> },
    { header: 'Profile', cell: (s) => (s.signedUp ? (s.profileComplete ? 'Complete' : 'Incomplete') : '—') },
    {
      header: '',
      cell: (s) => (
        <Button size="sm" variant="outline-danger" onClick={() => setRemoving(s.id)}>
          Remove
        </Button>
      ),
    },
  ]

  return (
    <>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h1 className="h3 mb-4">Registered students</h1>
        </div>
        <Button onClick={() => setImporting(true)}>Import CSV</Button>
      </div>
      <ImportResult result={lastImport} />
      <FilterBar chips={CHIPS} {...filter} placeholder="Search name, roll number or email" />
      <DataTable columns={columns} rows={filter.filtered} empty="No students match." />

      <CsvImportModal
        show={importing}
        title="Import the student roster"
        columns={['name', 'roll number', 'institute email']}
        hint="Re-importing a roll number updates that student instead of duplicating them."
        onClose={() => setImporting(false)}
        onImport={importRoster}
      />
      <ReasonModal
        show={removing !== null}
        title="Remove this student?"
        submitLabel="Remove student"
        onClose={() => setRemoving(null)}
        onConfirm={() => setStudents(students.filter((s) => s.id !== removing))} // the API will also block sign-up and new problems
      >
        They won’t be able to sign up or submit new problems.
      </ReasonModal>
    </>
  )
}
