import { apiRequest } from './client'

export interface Laborer {
  id: number
  name: string
  email: string
  phone: string | null
  location: string | null
  skills: string | null
  experience_years: number
  is_available: boolean
}

export interface LaborerFilters {
  search: string
  location: string
  skill: string
}

export function getLaborers(token: string, filters: LaborerFilters) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.location) params.set('location', filters.location)
  if (filters.skill) params.set('skill', filters.skill)
  return apiRequest<Laborer[]>(`/laborers/?${params.toString()}`, {}, token)
}
