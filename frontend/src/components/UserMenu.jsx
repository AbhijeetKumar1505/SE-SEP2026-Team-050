import { Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const ROLE_LABEL = { student: 'Student', mentor: 'Mentor', iic: 'IIC coordinator', leadership: 'Programme leadership' }

const initials = (name) =>
  name
    .replace(/^Prof\.\s*/, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

// Avatar, name and role, as on the student pages; the menu holds Log out.
export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" bsPrefix="user-toggle" className="text-decoration-none">
        <span className="mt-avatar">{initials(user.name)}</span>
        <span>
          <strong>{user.name}</strong>
          <small>{ROLE_LABEL[user.role]}</small>
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
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
