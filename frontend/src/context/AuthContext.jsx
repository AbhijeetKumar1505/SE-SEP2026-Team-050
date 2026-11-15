import { useState } from 'react'
import { AuthContext, DEMO_USERS } from './useAuth'

export function AuthProvider({ children, initialRole = 'mentor' }) {
  const [user, setUser] = useState(DEMO_USERS[initialRole])
  const logout = () => setUser(null)
  return <AuthContext value={{ user, setUser, logout }}>{children}</AuthContext>
}
