import { Alert } from 'react-bootstrap'
import { fmtDate } from '../utils/format'

// Outcome of a CSV import: counts plus every skipped row with its reason.
export default function ImportResult({ result }) {
  if (!result) return null
  const { errors } = result
  return (
    <Alert variant={errors.length ? 'warning' : 'success'} className="small">
      <strong>Import finished.</strong> {result.added} added, {result.updated} updated, {errors.length} skipped.
      <div className="text-muted">
        {result.file} · uploaded by {result.by} · {fmtDate(result.at)}
      </div>
      {errors.length > 0 && (
        <ul className="mb-0 mt-2">
          {errors.map((e) => (
            <li key={e.row}>
              Row {e.row}: {e.reason}
            </li>
          ))}
        </ul>
      )}
    </Alert>
  )
}
