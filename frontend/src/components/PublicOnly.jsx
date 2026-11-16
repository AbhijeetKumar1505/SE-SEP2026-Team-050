import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Pages for visitors: logged-in users go to their own home instead.
export default function PublicOnly() {
  const { user } = useAuth()
  return user ? <Navigate to={`/${user.role}`} replace /> : <Outlet />
}
