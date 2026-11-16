import { Route } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import RequireProfile from '../pages/student/RequireProfile'
import StudentHome from '../pages/student/StudentHome'
import StudentMentorship from '../pages/student/StudentMentorship'
import StudentProfile from '../pages/student/StudentProfile'
import SubmitProblem from '../pages/student/SubmitProblem'

export default (
  <Route path="/student" element={<AppLayout role="student" />}>
    <Route path="profile" element={<StudentProfile />} />
    <Route element={<RequireProfile />}>
      <Route index element={<StudentHome />} />
      <Route path="problem/new" element={<SubmitProblem />} />
      <Route path="mentorship" element={<StudentMentorship />} />
    </Route>
  </Route>
)
