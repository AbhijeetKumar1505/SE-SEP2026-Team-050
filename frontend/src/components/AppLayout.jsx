import { Container, Form, Nav } from 'react-bootstrap'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BRAND } from '../constants/brand'
import { NAV_LINKS } from '../constants/nav'
import { DEMO_USERS, useAuth } from '../context/AuthContext'
import ErrorBoundary from './ErrorBoundary'

// Shell for one role: sends other roles back to their own home, shows this role's links.
export default function AppLayout({ role }) {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />

  // Prototype only: remove once login (A1) decides the role.
  const switchRole = (e) => {
    setUser(DEMO_USERS[e.target.value])
    navigate(`/${e.target.value}`)
  }
  return (
    <>
      <header className="bg-white border-bottom">
        <Container className="d-flex align-items-center flex-wrap gap-4">
          <strong className="py-3">
            <i className="bi bi-mortarboard-fill text-primary me-2" />
            {BRAND.name}
          </strong>
          <Nav variant="underline" className="flex-grow-1">
            {NAV_LINKS[role].map(([to, label]) => (
              <Nav.Link key={to} as={NavLink} to={to} end>
                {label}
              </Nav.Link>
            ))}
          </Nav>
          <Form.Select size="sm" className="w-auto text-uppercase" aria-label="Switch role (prototype)" value={role} onChange={switchRole}>
            {Object.keys(DEMO_USERS).map((r) => <option key={r}>{r}</option>)}
          </Form.Select>
          <span className="small text-muted">
            <i className="bi bi-person-circle me-1" />
            {user.name}
          </span>
        </Container>
      </header>
      <Container as="main" className="py-4">
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </Container>
    </>
  )
}
