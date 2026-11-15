import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './StudentLayout.css'

// Khushi's student pages draw their own navbar and switch pages by firing these
// window events, so the layout maps each event to its route.
const EVENT_ROUTES = {
  'open-dashboard': '/student',
  'open-my-problem': '/student/problem',
  'open-mentorship': '/student/mentorship',
  'open-profile': '/student/profile',
}

// Shell for the student role: sends other roles back to their own home.
export default function StudentLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handlers = Object.entries(EVENT_ROUTES).map(([event, path]) => [event, () => navigate(path)])
    handlers.forEach(([event, handler]) => window.addEventListener(event, handler))
    return () => handlers.forEach(([event, handler]) => window.removeEventListener(event, handler))
  }, [navigate])

  if (!user) return <Navigate to="/logged-out" replace />
  if (user.role !== 'student') return <Navigate to={`/${user.role}`} replace />
  return <StudentUiFrame />
}

// Wraps pages in the student design (see StudentLayout.css). The public account pages use it too.
export function StudentUiFrame() {
  return (
    <div className="student-ui">
      <Outlet />
    </div>
  )
}
