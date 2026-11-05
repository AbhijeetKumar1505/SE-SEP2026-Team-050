import { Button, ListGroup } from 'react-bootstrap'
import { SESSION_BADGE } from '../constants/mentor'
import { fmtDate, fmtTime } from '../utils/format'

const labelOf = (s) => (s.status === 'Held' ? (s.confirmed ? 'Confirmed' : 'Awaiting confirmation') : s.status)

// Sessions record when / where / how long, never what was discussed.
// The other participant (role !== loggedBy) can confirm a held session; planned ones can be cancelled.
export default function SessionList({ sessions, role, onConfirm, onCancel }) {
  if (!sessions.length) return <p className="text-muted mb-0">No sessions yet.</p>
  return (
    <ListGroup variant="flush">
      {[...sessions].sort((a, b) => b.date.localeCompare(a.date)).map((s) => {
        const label = labelOf(s)
        const details = [s.channel, s.duration && `${s.duration} min`, s.topic].filter(Boolean)
        return (
          <ListGroup.Item key={s.id} className="d-flex justify-content-between align-items-center px-0">
            <div>
              <strong>{fmtDate(s.date)}{s.time && `, ${fmtTime(s.time)}`}</strong>
              <div className="small text-muted">{details.join(' · ')}</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className={`badge ${SESSION_BADGE[label]}`}>{label}</span>
              {label === 'Awaiting confirmation' && s.loggedBy !== role && onConfirm && (
                <Button size="sm" variant="outline-primary" onClick={() => onConfirm(s.id)}>Confirm</Button>
              )}
              {label === 'Planned' && onCancel && (
                <Button size="sm" variant="outline-secondary" onClick={() => onCancel(s.id)}>Cancel</Button>
              )}
            </div>
          </ListGroup.Item>
        )
      })}
    </ListGroup>
  )
}
