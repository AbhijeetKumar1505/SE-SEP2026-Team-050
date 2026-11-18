import { useEffect, useState } from 'react'
import { logout as logoutRequest, me } from '../api/auth'
import { hasToken } from '../api/client'
import { AuthContext } from './useAuth'

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser)
  // A stored token is checked with GET /api/auth/me before the first page decides where to go.
  const [ready, setReady] = useState(!hasToken() || !!initialUser)

  useEffect(() => {
    if (!hasToken() || initialUser) return
    let active = true
    me()
      .then((account) => active && setUser(account))
      .catch(() => {}) // an expired token is cleared by the API client
      .finally(() => active && setReady(true))
    return () => {
      active = false
    }
  }, [initialUser])

  // A 401 on any later request means the token expired or was revoked.
  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [])

  const logout = async () => {
    try {
      await logoutRequest()
    } catch {
      // The server may be unreachable or the token already expired; either way, sign out locally.
    } finally {
      setUser(null)
    }
  }

  return <AuthContext value={{ user, setUser, logout, ready }}>{children}</AuthContext>
}
