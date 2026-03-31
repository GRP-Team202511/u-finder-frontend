// This code was completed by GRP Team 2025.11.
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

export type AvatarSize = 'origin' | '64x64' | '256x256'

const BASE_URL = import.meta.env.VITE_BASE_URL

/**
 * Convert a relative avatar path to a full URL
 * @param path - Relative path like '/uploads/avatars/1/256.webp' or null
 * @returns Full URL or null if path is null
 */
export const buildAvatarUrl = (path: string | null): string | null => {
  if (!path) return null
  return `${BASE_URL}${path}`
}

/**
 * GET /profile/avatar — Fetch the avatar URL for the authenticated user.
 *
 * @param size - The requested avatar size: 'origin', '64x64', or '256x256'
 * @returns Avatar URL for the requested size, or null if user has no avatar
 */
export const getAvatar = (size: AvatarSize) => {
  return http.get<{ url: string | null }>('/profile/avatar', {
    params: { size }
  })
}

/**
 * PUT /profile/avatar — Upload or replace the user's avatar image.
 *
 * Accepted formats: JPEG, PNG, WebP, HEIC, HEIF. Maximum file size: 2 MB.
 * Generates WebP variants at original size, 256x256, and 64x64.
 *
 * @param file - The cropped image file to upload
 * @returns Success message and map of avatar URLs for all generated variants
 */
export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return http.put<{
    message: string
    avatar_urls: {
      original: string
      webp_original: string
      webp_256: string
      webp_64: string
    }
  }>('/profile/avatar', formData, {
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
