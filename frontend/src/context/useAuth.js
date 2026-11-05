import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Placeholders until the login page and API are connected.
export const DEMO_USERS = {
  mentor: { id: 'm01', name: 'Rahul Menon', role: 'mentor' },
  iic: { name: 'Deepa Krishnan', role: 'iic' },
  leadership: { name: 'Prof. Anand Rajan', role: 'leadership' },
}
