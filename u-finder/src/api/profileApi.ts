import http from './http'
import type {
  PersonalInfo,
  AllProfile,
  ProfileFieldName,
  ProfileFieldTypeMap,
} from './profileTypes'

// ─── Personal Info ────────────────────────────────────────────────────────────

/** GET /profile/personal — Fetch the current user's personal info */
export const getPersonalInfo = () => {
  return http.get<PersonalInfo>('/profile/personal')
}

/** PUT /profile/personal — Update the current user's personal info */
export const updatePersonalInfo = (data: PersonalInfo) => {
  return http.put<{ message: string }>('/profile/personal', data)
}

// ─── Single Profile Field ─────────────────────────────────────────────────────

/**
 * GET /profile/array/{field} — Fetch a single profile section by field name.
 *
 * Accepted field values: education | academic | test | internship | project | campus | award
 */
export const getProfileField = <F extends ProfileFieldName>(field: F) => {
  return http.get<{ data: ProfileFieldTypeMap[F][] }>(`/profile/array/${field}`)
}

/**
 * PUT /profile/array/{field} — Replace a single profile section with the provided array.
 *
 * Accepted field values: education | academic | test | internship | project | campus | award
 */
export const updateProfileField = <F extends ProfileFieldName>(
  field: F,
  data: ProfileFieldTypeMap[F][]
) => {
  return http.put<{ message: string }>(`/profile/array/${field}`, { data })
}

// ─── All Profile ──────────────────────────────────────────────────────────────

/** GET /profile — Fetch all profile sections in a single request */
export const getAllProfile = () => {
  return http.get<AllProfile>('/profile')
}

/** PUT /profile — Replace all profile sections in a single request */
export const updateAllProfile = (data: AllProfile) => {
  return http.put<{ message: string }>('/profile', data)
}
