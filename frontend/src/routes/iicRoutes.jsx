import { Route } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import CaseDetail from '../pages/iic/CaseDetail'
import MentorPool from '../pages/iic/MentorPool'
import Monitoring from '../pages/iic/Monitoring'
import ProblemQueue from '../pages/iic/ProblemQueue'
import Roster from '../pages/iic/Roster'
import ReviewAssign from '../pages/iic/ReviewAssign'
import Settings from '../pages/iic/Settings'

export default (
  <Route path="/iic" element={<AppLayout role="iic" />}>
    <Route index element={<ProblemQueue />} />
    <Route path="problems/:id" element={<ReviewAssign />} />
    <Route path="mentors" element={<MentorPool />} />
    <Route path="students" element={<Roster />} />
    <Route path="monitoring" element={<Monitoring />} />
    <Route path="cases/:id" element={<CaseDetail />} />
    <Route path="settings" element={<Settings />} />
  </Route>
)
