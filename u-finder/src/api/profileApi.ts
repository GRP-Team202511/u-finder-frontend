import http from './http'
import type {
  PersonalInfo,
  AllProfile,
  ProfileFieldName,
  ProfileFieldTypeMap,
  CVParseResponse,
} from '../types/profileTypes'

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

// ─── CV Upload ────────────────────────────────────────────────────────────────

/**
 * POST /profile/cv — Upload a CV file (PDF or DOCX) for AI parsing.
 * 
 * The server forwards the file to Dify AI service for information extraction
 * and returns the structured result.
 * 
 * @param file - The CV file to upload (PDF or DOCX, max 10MB)
 * @returns Parsed CV data structured by profile sections
 */
export const uploadCV = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post<CVParseResponse>('/profile/cv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
