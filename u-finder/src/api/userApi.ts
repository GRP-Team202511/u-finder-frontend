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

// Sends a login request to the server
export const login = (data: LoginRequest) => {
  return http.post<LoginResponse>('/auth/login', data)
}