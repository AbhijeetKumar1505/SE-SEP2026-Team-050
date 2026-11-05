import { Button, Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { DEMO_USERS, useAuth } from '../context/useAuth'

// Stand-in for the login page: pick a demo role to sign back in.
export default function LoggedOut() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  return (
    <Container className="py-5 text-center">
      <h1 className="h3">You’ve been logged out</h1>
      <p className="text-muted">Prototype: choose a role to log in again.</p>
      <div className="d-flex justify-content-center gap-2">
        {Object.entries(DEMO_USERS).map(([role, u]) => (
          <Button
            key={role}
            variant="outline-primary"
            className="text-capitalize"
            onClick={() => {
              setUser(u)
              navigate(`/${role}`)
            }}
          >
            Log in as {role}
          </Button>
        ))}
      </div>
    </Container>
  )
}
