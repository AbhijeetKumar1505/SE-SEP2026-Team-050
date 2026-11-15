import { Route } from 'react-router-dom'
import { StudentUiFrame } from '../components/StudentLayout'
import {
  EmailVerificationScreen,
  ForgotPasswordScreen,
  LoginScreen,
  ResetPasswordScreen,
  SignupScreen,
  WelcomeScreen,
} from '../pages/AccountScreens'

// Public pages: welcome, log in (A1), student sign-up (A2), verify email (A3) and password reset.
export default (
  <Route element={<StudentUiFrame />}>
    <Route path="/welcome" element={<WelcomeScreen />} />
    <Route path="/login" element={<LoginScreen />} />
    <Route path="/signup" element={<SignupScreen />} />
    <Route path="/verify-email" element={<EmailVerificationScreen />} />
    <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
    <Route path="/reset-password" element={<ResetPasswordScreen />} />
  </Route>
)
