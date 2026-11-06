import { useState } from 'react'
import { session } from '../api/mock/session'
import { AuthContext, DEMO_USERS } from './useAuth'

export function AuthProvider({ children, initialRole = 'mentor' }) {
  const [user, setCurrentUser] = useState(DEMO_USERS[initialRole])
  const setUser = (u) => {
    if (u.role === 'mentor') session.mentorId = u.id // mock only: in M3 the API reads the user from the token
    setCurrentUser(u)
  }
  const logout = () => setCurrentUser(null)
  return <AuthContext value={{ user, setUser, logout }}>{children}</AuthContext>
}
