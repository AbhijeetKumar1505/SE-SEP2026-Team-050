import { Route, Routes } from 'react-router-dom'
import PublicOnly from './components/PublicOnly'
import ActivateAccount from './pages/ActivateAccount'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import ResetPassword from './pages/auth/ResetPassword'
import Signup from './pages/auth/Signup'
import { VerifyPending, VerifyResult } from './pages/auth/VerifyEmail'
import Welcome from './pages/auth/Welcome'
import NotFound from './pages/NotFound'
import iicRoutes from './routes/iicRoutes'
import leadershipRoutes from './routes/leadershipRoutes'
import mentorRoutes from './routes/mentorRoutes'
import studentRoutes from './routes/studentRoutes'

// Visitor pages, then each role's own routes.
export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>
      <Route path="/verify-email" element={<VerifyPending />} />
      <Route path="/verify-email/:token" element={<VerifyResult />} />
      <Route path="/activate/:token" element={<ActivateAccount />} />
      {studentRoutes}
      {mentorRoutes}
      {iicRoutes}
      {leadershipRoutes}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
