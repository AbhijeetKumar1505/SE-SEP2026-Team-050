import { createContext, useContext } from 'react'

// The logged-in user ({ id, name, role, roll? }) or null.
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)
