import { Route } from 'react-router-dom'
import StudentLayout from '../components/StudentLayout'
import { StudentOnboardingScreen } from '../pages/AccountScreens'
import StudentMentorAssigned from '../pages/StudentMentorAssigned'
import StudentMentorshipWorkspace from '../pages/StudentMentorshipWorkspace'
import StudentMyProblem, { Navbar } from '../pages/StudentMyProblem'
import StudentProfile from '../pages/StudentProfile'
import StudentSubmitProblem from '../pages/StudentSubmitProblem'

export default (
  <Route path="/student" element={<StudentLayout />}>
    <Route index element={<StudentMentorAssigned />} />
    <Route path="problem" element={<StudentMyProblem />} />
    <Route path="problem/new" element={<StudentSubmitProblem />} />
    <Route path="mentorship" element={<StudentMentorshipWorkspace />} />
    <Route
      path="profile"
      element={
        <div className="dashboard-page">
          <Navbar activeTab="profile" />
          <StudentProfile />
        </div>
      }
    />
    <Route path="onboarding" element={<StudentOnboardingScreen />} />
  </Route>
)
