import { Table } from 'react-bootstrap'

// columns = [{ header, cell: (row) => node }]. Rows need an `id`.
export default function DataTable({ columns, rows, empty = 'Nothing to show.' }) {
  if (!rows.length) return <p className="text-muted">{empty}</p>
  return (
    <Table hover responsive className="align-middle bg-white border mb-0">
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i}>{c.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            {columns.map((c, i) => (
              <td key={i}>{c.cell(r)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
