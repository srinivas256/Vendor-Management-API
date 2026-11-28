import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import {
  getCurrentUser,
  login as requestLogin,
  register as requestRegister,
  type RegisterPayload,
  type UserProfile,
} from '../api/auth'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() =>
    window.localStorage.getItem('labor-connect-token'),
  )
  const currentUser = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => getCurrentUser(token!),
    enabled: Boolean(token),
    retry: false,
  })

  useEffect(() => {
    if (currentUser.error instanceof ApiError && currentUser.error.status === 401) {
      window.localStorage.removeItem('labor-connect-token')
    }
  }, [currentUser.error])

  const storeSession = useCallback((newToken: string, user: UserProfile) => {
    window.localStorage.setItem('labor-connect-token', newToken)
    setToken(newToken)
    queryClient.setQueryData(['auth', 'me'], user)
  }, [queryClient])

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await requestLogin(email, password)
    storeSession(response.access_token, response.user)
  }, [storeSession])

  const signUp = useCallback(async (payload: RegisterPayload) => {
    const response = await requestRegister(payload)
    storeSession(response.access_token, response.user)
  }, [storeSession])

  const signOut = useCallback(() => {
    window.localStorage.removeItem('labor-connect-token')
    setToken(null)
    queryClient.removeQueries({ queryKey: ['auth', 'me'] })
  }, [queryClient])

  const invalidSession = currentUser.error instanceof ApiError && currentUser.error.status === 401
  const value = useMemo<AuthContextValue>(
    () => ({
      token: invalidSession ? null : token,
      user: invalidSession ? null : currentUser.data ?? null,
      isLoading: Boolean(token) && currentUser.isPending,
      signIn,
      signUp,
      signOut,
    }),
    [token, currentUser.data, currentUser.isPending, invalidSession, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
