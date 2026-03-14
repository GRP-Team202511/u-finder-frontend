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

// ─── Avatar ───────────────────────────────────────────────────────────────────

/** GET /profile/avatar — Fetch the avatar URL for the authenticated user.
 *  Returns null for avatar_url when the user has not uploaded an avatar yet. */
export const getAvatar = () => {
  return http.get<{ avatar_url: string | null }>('/profile/avatar')
}

/**
 * PUT /profile/avatar — Upload or replace the user's avatar image.
 *
 * Accepted formats: JPEG, PNG, WebP.  Maximum file size: 2 MB.
 * The server automatically removes the previous avatar when a new one is uploaded.
 *
 * @param file - The cropped image file to upload
 * @returns Updated avatar URL and a success message
 */
export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return http.put<{ message: string; avatar_url: string }>('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// ─── CV Upload ────────────────────────────────────────────────────────────────

/**
 * Timeout for CV upload requests in milliseconds.
 * AI parsing can take significantly longer than the global 8 s default,
 * so we use a dedicated per-request timeout here instead of touching the
 * global axios instance.
 */
const CV_UPLOAD_TIMEOUT_MS = 60_000

/**
 * POST /profile/cv — Upload a CV file (PDF or DOCX) for AI parsing.
 *
 * The server forwards the file to Dify AI service for information extraction
 * and returns the structured result.
 *
 * @param file   - The CV file to upload (PDF or DOCX, max 10 MB)
 * @param signal - Optional AbortSignal so the caller can cancel the request
 * @returns Parsed CV data structured by profile sections
 */
export const uploadCV = (file: File, signal?: AbortSignal) => {
  const formData = new FormData()
  formData.append('file', file)

  return http.post<CVParseResponse>('/profile/cv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // Override the global 8 s timeout — AI parsing can legitimately take up to ~1 min
    timeout: CV_UPLOAD_TIMEOUT_MS,
    // Allow the caller (e.g. a cancel button) to abort the in-flight request
    signal,
  })
}
