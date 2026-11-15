import { useNavigate } from 'react-router-dom'
import PublicPage from '../components/PublicPage'
import { DEMO_USERS, useAuth } from '../context/useAuth'

const LABEL = { student: 'student', mentor: 'mentor', iic: 'IIC coordinator', leadership: 'programme leadership' }

// Stand-in for the login page: pick a demo role to sign back in.
export default function LoggedOut() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  return (
    <PublicPage title="You’ve been logged out" intro="Prototype: choose a role to log in again.">
      <div className="public-actions">
        {Object.entries(DEMO_USERS).map(([role, u]) => (
          <button
            key={role}
            type="button"
            className="login-signup-link"
            onClick={() => {
              setUser(u)
              navigate(`/${role}`)
            }}
          >
            Log in as {LABEL[role]}
          </button>
        ))}
      </div>
    </PublicPage>
  )
}
