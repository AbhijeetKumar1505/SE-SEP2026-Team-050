import { Container, Form, Nav } from 'react-bootstrap'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { switchDemoRole } from '../api/auth'
import { DEMO_ACCOUNTS } from '../constants/demo'
import { NAV_LINKS } from '../constants/nav'
import { useAuth } from '../context/useAuth'
import Brand from './Brand'
import ErrorBoundary from './ErrorBoundary'
import Loading from './Loading'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

// Shell for one role: sends visitors to login and other roles to their own home.
export default function AppLayout({ role }) {
  const { user, setUser, ready } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  if (!ready) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />

  // Prototype only: jump between the demo accounts without logging out. Removed in M3 with them.
  const switchRole = async (e) => {
    const next = await switchDemoRole(e.target.value)
    setUser(next)
    navigate(`/${next.role}`)
  }

  return (
    <>
      <header className="bg-white border-bottom">
        <Container className="d-flex align-items-center flex-wrap gap-4">
          <span className="py-3">
            <Brand />
          </span>
          <Nav variant="underline" className="flex-grow-1">
            {NAV_LINKS[role].map(([to, label]) => (
              <Nav.Link key={to} as={NavLink} to={to} end>
                {label}
              </Nav.Link>
            ))}
          </Nav>
          <Form.Select size="sm" className="w-auto" aria-label="Switch role (prototype)" value={role} onChange={switchRole}>
            {DEMO_ACCOUNTS.map((a) => (
              <option key={a.role} value={a.role}>
                {a.label}
              </option>
            ))}
          </Form.Select>
          <ErrorBoundary fallback={null}>
            <NotificationBell role={role} />
          </ErrorBoundary>
          <UserMenu />
        </Container>
      </header>
      <Container as="main">
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </Container>
    </>
  )
}
