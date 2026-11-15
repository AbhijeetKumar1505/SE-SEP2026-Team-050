import { Dropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'

// Sample notifications per role, until the Flask API sends them. [id, text, link]
const NOTIFICATIONS = {
  mentor: [
    ['p6', 'Neha Joshi was assigned to you', '/mentor'],
    ['cr1', 'Deepa Krishnan asked you to take on one more student', '/mentor'],
    ['r6-confirm', 'Karthik Subramanian logged a session to confirm', '/mentor/mentorships/r6'],
  ],
  iic: [
    ['reassign', '2 problems to reassign', '/iic'],
    ['new', '3 new problems to review', '/iic'],
    ['verify', '3 mentors to verify', '/iic/mentors'],
    ['C-014', 'Case C-014 is open', '/iic/cases/C-014'],
    ['r2-wellbeing', 'Wellbeing check (AI): a comment from Sneha Pillai', '/iic/mentorships/r2'],
  ],
}

// Bell with a count and a list of what needs attention.
export default function NotificationBell({ role }) {
  const items = NOTIFICATIONS[role] ?? []
  const count = items.length
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" bsPrefix="mt-bell" aria-label={`Notifications (${count})`}>
        <i className="bi bi-bell" />
        {count > 0 && <b>{count}</b>}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header>Notifications</Dropdown.Header>
        {count === 0 && <Dropdown.ItemText className="text-muted">You’re all caught up.</Dropdown.ItemText>}
        {items.map(([id, text, to]) => (
          <Dropdown.Item key={id} as={Link} to={to}>
            {text}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
