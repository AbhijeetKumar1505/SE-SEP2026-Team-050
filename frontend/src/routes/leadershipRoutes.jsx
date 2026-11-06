import { Route } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Insights from '../pages/leadership/Insights'

export default (
  <Route path="/leadership" element={<AppLayout role="leadership" />}>
    <Route index element={<Insights />} />
  </Route>
)
