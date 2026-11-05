import { Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Avatar and name; the menu holds Log out.
export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" bsPrefix="p-0" className="text-body text-decoration-none d-flex align-items-center gap-2">
        <i className="bi bi-person-circle fs-4" />
        {user.name}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header className="text-capitalize">{user.role}</Dropdown.Header>
        <Dropdown.Item
          onClick={() => {
            logout()
            navigate('/logged-out')
          }}
        >
          <i className="bi bi-box-arrow-right me-2" />
          Log out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
