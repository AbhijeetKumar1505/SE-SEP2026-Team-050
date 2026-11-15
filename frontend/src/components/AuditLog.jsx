import { ListGroup } from 'react-bootstrap'
import { fmtDateTime } from '../utils/format'

// Read-only history. entries = [{ at, text }], newest first.
export default function AuditLog({ entries }) {
  return (
    <ListGroup variant="flush">
      {entries.map((e, i) => (
        <ListGroup.Item key={i} className="px-0 small d-flex justify-content-between gap-3">
          <span>{e.text}</span>
          <span className="text-muted text-nowrap">{fmtDateTime(e.at)}</span>
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}
