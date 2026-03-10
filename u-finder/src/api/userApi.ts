import http from './http'

// Login request payload structure
export interface LoginRequest {
  email: string
  password: string
}

// Login response payload structure
export interface LoginResponse {
  id: number
  name: string
  token: string
}

// Signup request payload structure
export interface SignupRequest {
  name: string
  email: string
  password: string
}

// Signup response payload structure
export interface SignupResponse {
  temp_token: string
}

// Verify signup request payload structure
export interface VerifySignupRequest {
  code: string
}

// Verify signup response payload structure
export interface VerifySignupResponse {
  id: number
  name: string
  token: string
}

// Sends a login request to the server
export const login = (data: LoginRequest) => {
  return http.post<LoginResponse>('/auth/login', data)
}

// Sends a signup request to the server
export const signup = (data: SignupRequest) => {
  return http.post<SignupResponse>('/auth/signup', data)
}

// Verifies the signup email with the verification code
export const verifySignup = (data: VerifySignupRequest, tempToken: string) => {
  console.log(tempToken)
  return http.post<VerifySignupResponse>('/auth/verify', data, {
    headers: {
      'Temp-Token': tempToken
    }
  })
}

// Resends the verification code during signup
export const resendSignupCode = (tempToken: string) => {
  return http.post<{ message: string }>('/auth/signup/resend', {}, {
    headers: {
      'Temp-Token': tempToken
    }
  })
}

// Reset password request payload structure
export interface ResetPasswordRequest {
  email: string
}

// Reset password response payload structure
export interface ResetPasswordResponse {
  temp_token: string
}

// Verify reset password request payload structure
export interface VerifyResetPasswordRequest {
  code: string
  newPassword: string
}

// Verify reset password response payload structure
export interface VerifyResetPasswordResponse {
  message: string
}

// Resend reset password code response structure
export interface ResendResetPasswordResponse {
  message: string
}

// Sends a password reset request to the server
export const resetPassword = (data: ResetPasswordRequest) => {
  return http.post<ResetPasswordResponse>('/auth/reset', data)
}

// Verifies the password reset with OTP code and sets new password
export const verifyResetPassword = (data: VerifyResetPasswordRequest, tempToken: string) => {
  return http.post<VerifyResetPasswordResponse>('/auth/reset/verify', data, {
    headers: {
      'Temp-Token': tempToken
    }
  })
}

// Resends the verification code during password reset
export const resendResetPasswordCode = (tempToken: string) => {
  return http.post<ResendResetPasswordResponse>('/auth/reset/resend', {}, {
    headers: {
      'Temp-Token': tempToken
    }
  })
}

export interface PersonalInfo {
  birthday: string
  gender: string
  name: string
  [property: string]: any
}

export interface Education {
  data: Record<string, any>[]
  [property: string]: any
}

export interface Academic {
  data: Record<string, any>[]
  [property: string]: any
}

export interface Test {
  data: Record<string, any>[]
  [property: string]: any
}

export interface Internship {
  data: Record<string, any>[]
  [property: string]: any
}

export interface Project {
  data: Record<string, any>[]
  [property: string]: any
}

export interface Campus {
  data: Record<string, any>[]
  [property: string]: any
}

export interface Award {
  data: Record<string, any>[]
  [property: string]: any
}

export type OtherProfileField =
  | 'education'
  | 'academic'
  | 'test'
  | 'internship'
  | 'project'
  | 'campus'
  | 'award'

export interface FullProfile {
  education: Education
  academic: Academic
  test: Test
  internship: Internship
  personalInfo: PersonalInfo
  project: Project
  campus: Campus
  award: Award
  [property: string]: any
}

type ProfileFieldDataMap = {
  education: Education['data']
  academic: Academic['data']
  test: Test['data']
  internship: Internship['data']
  project: Project['data']
  campus: Campus['data']
  award: Award['data']
}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`
})

export const getPersonalInfo = (token: string) => {
  return http.get<PersonalInfo>('/profile/personal', {
    headers: authHeaders(token)
  })
}

export const updatePersonalInfo = (data: PersonalInfo, token: string) => {
  return http.put<PersonalInfo>('/profile/personal', data, {
    headers: authHeaders(token)
  })
}

export const getProfileArrayField = <TField extends OtherProfileField>(field: TField, token: string) => {
  return http.get<ProfileFieldDataMap[TField]>(`/profile/array/${field}`, {
    headers: authHeaders(token)
  })
}

export const updateProfileArrayField = <TField extends OtherProfileField>(
  field: TField,
  data: ProfileFieldDataMap[TField],
  token: string
) => {
  return http.put<{ message: string }>(`/profile/array/${field}`, data, {
    headers: authHeaders(token)
  })
}

export const getFullProfile = (token: string) => {
  return http.get<FullProfile>('/profile', {
    headers: authHeaders(token)
  })
}

export const updateFullProfile = (data: FullProfile, token: string) => {
  return http.put<FullProfile>('/profile', data, {
    headers: authHeaders(token)
  })
}

// Logs out the current user; JWT token is attached automatically by the request interceptor
export const logoutUser = () => {
  return http.post<{ message: string }>('/auth/logout')
}

// ==================== Two-Factor Authentication APIs ====================

// 2FA Status Response
export interface TwoFAStatusResponse {
  is_2fa_enabled: boolean
  backup_codes_remaining: number
}

// Setup 2FA Response
export interface Setup2FAResponse {
  totp_uri: string
  qr_code_base64: string
  backup_codes: string[]
}

// Confirm 2FA Request
export interface Confirm2FARequest {
  code: string
}

// Confirm 2FA Response
export interface Confirm2FAResponse {
  message: string
}

// Disable 2FA Request
export interface Disable2FARequest {
  password: string
}

// Disable 2FA Response
export interface Disable2FAResponse {
  message: string
}

// Regenerate Backup Codes Request
export interface RegenerateBackupCodesRequest {
  code: string
}

// Regenerate Backup Codes Response
export interface RegenerateBackupCodesResponse {
  backup_codes: string[]
}

// Get 2FA status for the current user
export const get2FAStatus = () => {
  return http.get<TwoFAStatusResponse>('/auth/2fa/status')
}

// Setup 2FA - Generate TOTP secret and QR code
export const setup2FA = () => {
  return http.post<Setup2FAResponse>('/auth/2fa/setup')
}

// Confirm 2FA binding - Verify initial TOTP code
export const confirm2FA = (data: Confirm2FARequest) => {
  return http.post<Confirm2FAResponse>('/auth/2fa/confirm', data)
}

// Disable 2FA
export const disable2FA = (data: Disable2FARequest) => {
  return http.post<Disable2FAResponse>('/auth/2fa/disable', data)
}

// Regenerate backup recovery codes
export const regenerateBackupCodes = (data: RegenerateBackupCodesRequest) => {
  return http.post<RegenerateBackupCodesResponse>('/auth/2fa/backup-codes/regenerate', data)
}