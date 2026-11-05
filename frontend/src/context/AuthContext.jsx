import { createContext, useContext, useState } from 'react'
import { session } from '../api/mock/session'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Placeholders until the login page and API are connected.
export const DEMO_USERS = {
  mentor: { id: 'm01', name: 'Rahul Menon', role: 'mentor' },
  iic: { name: 'Deepa Krishnan', role: 'iic' },
  leadership: { name: 'Prof. Anand Rajan', role: 'leadership' },
}

export function AuthProvider({ children, initialRole = 'mentor' }) {
  const [user, setCurrentUser] = useState(DEMO_USERS[initialRole])
  const setUser = (u) => {
    if (u.role === 'mentor') session.mentorId = u.id // mock only: in M3 the API reads the user from the token
    setCurrentUser(u)
  }
  return <AuthContext value={{ user, setUser }}>{children}</AuthContext>
}
