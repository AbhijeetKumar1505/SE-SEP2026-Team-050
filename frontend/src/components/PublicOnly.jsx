import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Loading from './Loading'

// Pages for visitors: logged-in users go to their own home instead.
export default function PublicOnly() {
  const { user, ready } = useAuth()
  if (!ready) return <Loading />
  return user ? <Navigate to={`/${user.role}`} replace /> : <Outlet />
}
