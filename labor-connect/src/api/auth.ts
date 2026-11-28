import { apiRequest } from './client'

export type AccountRole = 'labor' | 'vendor'

export interface UserProfile {
  id: number
  name: string
  email: string
  phone: string | null
  role: AccountRole
  location: string | null
  skills: string | null
  experience_years: number
  is_available: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: AccountRole
  phone?: string
  location?: string
  skills?: string
  experience_years?: number
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: UserProfile
}

export async function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getCurrentUser(token: string) {
  return apiRequest<UserProfile>('/auth/me', {}, token)
}
