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