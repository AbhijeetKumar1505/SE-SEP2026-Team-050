import { useEffect } from 'react'
import { Badge, Dropdown } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { getNotifications } from '../api/notifications'
import useFetch from '../hooks/useFetch'

// Bell with a count and a list of what needs attention. Refreshes on navigation and when opened.
export default function NotificationBell({ role }) {
  const { pathname } = useLocation()
  const [items, reload] = useFetch(getNotifications, role)
  useEffect(() => {
    reload()
  }, [pathname, reload])
  const count = items?.length ?? 0
  return (
    <Dropdown align="end" onToggle={(open) => open && reload()}>
      <Dropdown.Toggle variant="link" bsPrefix="p-0" className="text-body position-relative" aria-label={`Notifications (${count})`}>
        <i className="bi bi-bell fs-5" />
        {count > 0 && (
          <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
            {count}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header>Notifications</Dropdown.Header>
        {count === 0 && <Dropdown.ItemText className="text-muted">You’re all caught up.</Dropdown.ItemText>}
        {items?.map((n) => (
          <Dropdown.Item key={n.id} as={Link} to={n.to}>
            {n.text}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
