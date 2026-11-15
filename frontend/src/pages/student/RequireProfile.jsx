import { Navigate, Outlet } from 'react-router-dom'
import { getProfile } from '../../api/student'
import Loading from '../../components/Loading'
import useFetch from '../../hooks/useFetch'

// Students finish their profile before using anything else.
export default function RequireProfile() {
  const [profile] = useFetch(getProfile)
  if (!profile) return <Loading />
  return profile.complete ? <Outlet /> : <Navigate to="/student/profile" replace />
}
