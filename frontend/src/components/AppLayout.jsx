import { Form } from 'react-bootstrap'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BRAND } from '../constants/brand'
import { NAV_LINKS } from '../constants/nav'
import { DEMO_USERS, useAuth } from '../context/useAuth'
import ErrorBoundary from './ErrorBoundary'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

// Shell for one role: sends other roles back to their own home, shows this role's links.
// The header matches the student pages' navigation bar (.mt-navbar in theme.css).
export default function AppLayout({ role }) {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/logged-out" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />

  // Prototype only: remove once login (A1) decides the role.
  const switchRole = (e) => {
    setUser(DEMO_USERS[e.target.value])
    navigate(`/${e.target.value}`)
  }
  return (
    <div className="app-shell">
      <nav className="mt-navbar">
        <div className="mt-brand">
          <div className="mt-brand-logo">M</div>
          <strong>{BRAND.name}</strong>
        </div>
        <div className="mt-nav-links">
          {NAV_LINKS[role].map(([to, label]) => (
            <NavLink key={to} to={to} end>
              {label}
            </NavLink>
          ))}
        </div>
        <div className="mt-user-area">
          <Form.Select size="sm" className="role-switch" aria-label="Switch role (prototype)" value={role} onChange={switchRole}>
            {Object.keys(DEMO_USERS).map((r) => (
              <option key={r} value={r}>
                {r === 'iic' ? 'IIC' : r}
              </option>
            ))}
          </Form.Select>
          <ErrorBoundary fallback={null}>
            <NotificationBell role={role} />
          </ErrorBoundary>
          <UserMenu />
        </div>
      </nav>
      <main className="mt-page">
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
