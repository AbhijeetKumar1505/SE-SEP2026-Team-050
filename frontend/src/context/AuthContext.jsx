import { useState } from 'react'
import { AuthContext } from './useAuth'

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser)
  const logout = () => setUser(null)
  return <AuthContext value={{ user, setUser, logout }}>{children}</AuthContext>
}
