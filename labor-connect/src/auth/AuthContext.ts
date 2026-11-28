import { createContext } from 'react'
import type { RegisterPayload, UserProfile } from '../api/auth'

export interface AuthContextValue {
  token: string | null
  user: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (payload: RegisterPayload) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
