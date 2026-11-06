import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import ActivateAccount from './pages/ActivateAccount'
import LoggedOut from './pages/LoggedOut'
import NotFound from './pages/NotFound'
import iicRoutes from './routes/iicRoutes'
import leadershipRoutes from './routes/leadershipRoutes'
import mentorRoutes from './routes/mentorRoutes'

// Each role contributes its own routes. Activation is public.
export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/logged-out'} replace />} />
      <Route path="/logged-out" element={<LoggedOut />} />
      <Route path="/activate/:token" element={<ActivateAccount />} />
      {mentorRoutes}
      {iicRoutes}
      {leadershipRoutes}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
