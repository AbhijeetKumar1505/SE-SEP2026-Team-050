import { Route } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import MentorAvailability from '../pages/mentor/MentorAvailability'
import MentorDashboard from '../pages/mentor/MentorDashboard'
import MentorWorkspace from '../pages/mentor/MentorWorkspace'

export default (
  <Route path="/mentor" element={<AppLayout role="mentor" />}>
    <Route index element={<MentorDashboard />} />
    <Route path="availability" element={<MentorAvailability />} />
    <Route path="mentorships/:id" element={<MentorWorkspace />} />
  </Route>
)
