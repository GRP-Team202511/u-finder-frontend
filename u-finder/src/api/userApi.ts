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