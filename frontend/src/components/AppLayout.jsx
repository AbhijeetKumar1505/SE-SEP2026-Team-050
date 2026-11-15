import { Container, Nav } from 'react-bootstrap'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { NAV_LINKS } from '../constants/nav'
import { useAuth } from '../context/useAuth'
import Brand from './Brand'
import ErrorBoundary from './ErrorBoundary'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

// Shell for one role: sends visitors to login and other roles to their own home.
export default function AppLayout({ role }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />

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
