import { createContext, useContext } from 'react'

// { user, setUser, logout, ready }: the logged-in user ({ id, email, roles, role, name, roll? })
// or null, and `ready` is false while a stored token is being checked with the API.
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)
