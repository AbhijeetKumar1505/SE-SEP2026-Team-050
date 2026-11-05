import { Button, Dropdown, ListGroup } from 'react-bootstrap'
import { fmtDate, fmtTime } from '../utils/format'
import StatusBadge from './StatusBadge'

// Sessions record when / where / how long, never what was discussed. Shared by mentor and student.
// The other participant (role !== loggedBy) confirms a held session. Pass only the actions a user may take:
// onMarkHeld / onCancel apply to planned sessions, onEdit to planned and held ones.
export default function SessionList({ sessions, role, onConfirm, onEdit, onMarkHeld, onCancel }) {
  if (!sessions.length) return <p className="text-muted mb-0">No sessions yet.</p>
  return (
    <ListGroup variant="flush">
      {[...sessions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((s) => {
          const details = [s.channel, s.duration && `${s.duration} min`, s.topic].filter(Boolean)
          const planned = s.status === 'Planned'
          const canManage = (planned && (onMarkHeld || onCancel)) || (onEdit && s.status !== 'Cancelled')
          return (
            <ListGroup.Item key={s.id} className="d-flex justify-content-between align-items-center gap-3 px-0">
              <div>
                <strong>
                  {fmtDate(s.date)}
                  {s.time && `, ${fmtTime(s.time)}`}
                </strong>
                <div className="small text-muted">{details.join(' · ')}</div>
                {s.status === 'Held' && (s.confirmed || s.loggedBy === role) && (
                  <div className="small text-muted">{s.confirmed ? 'Confirmed by both' : 'Waiting for confirmation'}</div>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                <StatusBadge status={s.status} />
                {s.status === 'Held' && !s.confirmed && s.loggedBy !== role && onConfirm && (
                  <Button size="sm" variant="outline-primary" onClick={() => onConfirm(s.id)}>
                    Confirm
                  </Button>
                )}
                {canManage && (
                  <Dropdown align="end">
                    <Dropdown.Toggle size="sm" variant="outline-secondary">
                      Manage
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {planned && onMarkHeld && <Dropdown.Item onClick={() => onMarkHeld(s)}>Mark as held</Dropdown.Item>}
                      {onEdit && <Dropdown.Item onClick={() => onEdit(s)}>Edit details</Dropdown.Item>}
                      {planned && onCancel && (
                        <Dropdown.Item className="text-danger" onClick={() => onCancel(s)}>
                          Cancel session
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </ListGroup.Item>
          )
        })}
    </ListGroup>
  )
}
