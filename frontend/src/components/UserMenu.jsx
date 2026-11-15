import { Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ROLE_LABELS } from '../constants/nav'
import { useAuth } from '../context/useAuth'
import { initials } from '../utils/format'

// Avatar and name; the menu holds Log out.
export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" bsPrefix="p-0" className="text-body text-decoration-none d-flex align-items-center gap-2">
        <span className="avatar">{initials(user.name)}</span>
        <span className="text-start lh-sm">
          <strong className="d-block">{user.name}</strong>
          <small className="text-muted">{user.roll ? `${ROLE_LABELS[user.role]} · ${user.roll}` : ROLE_LABELS[user.role]}</small>
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          <i className="bi bi-box-arrow-right me-2" />
          Log out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
