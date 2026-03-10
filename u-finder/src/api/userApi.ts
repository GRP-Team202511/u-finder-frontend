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

export interface LoginTwoFactorResponse {
  temp_token: string | null
}

export type LoginApiResponse =
  | {
      status: 200
      data: LoginResponse
    }
  | {
      status: 202
      data: LoginTwoFactorResponse
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
export const login = async (data: LoginRequest): Promise<LoginApiResponse> => {
  const response = await http.post<LoginResponse | LoginTwoFactorResponse>('/auth/login', data)

  if (response.status === 200) {
    return {
      status: 200,
      data: response.data as LoginResponse
    }
  }

  if (response.status === 202) {
    return {
      status: 202,
      data: response.data as LoginTwoFactorResponse
    }
  }

  throw new Error(`Unexpected login response status: ${response.status}`)
}

export interface TwoFactorVerifyRequest {
  code: string
  type: 'totp' | 'recovery'
}

export interface TwoFactorVerifyResponse {
  id: number
  name: string
  token: string
}

export const verifyTwoFactor = (data: TwoFactorVerifyRequest, tempToken: string) => {
  return http.post<TwoFactorVerifyResponse>('/auth/2fa/verify', data, {
    headers: {
      'Temp-Token': tempToken
    }
  })
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