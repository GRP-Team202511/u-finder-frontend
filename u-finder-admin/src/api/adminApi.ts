import http from './http'

export interface AdminLoginRequest {
	email: string
	password: string
}

export interface AdminLoginResponse {
	id: number
	name: string
	token: string
}

export interface AdminLoginTwoFactorResponse {
	temp_token: string | null
}

export type AdminLoginApiResponse =
	| {
			status: 200
			data: AdminLoginResponse
		}
	| {
			status: 202
			data: AdminLoginTwoFactorResponse
		}

export const login = async (data: AdminLoginRequest): Promise<AdminLoginApiResponse> => {
	const response = await http.post<AdminLoginResponse | AdminLoginTwoFactorResponse>('/api/admin/auth/login', data)

	if (response.status === 200) {
		return {
			status: 200,
			data: response.data as AdminLoginResponse,
		}
	}

	if (response.status === 202) {
		return {
			status: 202,
			data: response.data as AdminLoginTwoFactorResponse,
		}
	}

	throw new Error(`Unexpected admin login response status: ${response.status}`)
}

export interface AdminTwoFactorVerifyRequest {
	code: string
	type: 'totp' | 'recovery'
}

export interface AdminTwoFactorVerifyResponse {
	id: number
	name: string
	token: string
}

export const verifyTwoFactor = (data: AdminTwoFactorVerifyRequest, tempToken: string) => {
	return http.post<AdminTwoFactorVerifyResponse>('/api/admin/auth/2fa/verify', data, {
		headers: {
			'Temp-Token': tempToken,
		},
	})
}

export interface ResetPasswordRequest {
	email: string
}

export interface ResetPasswordResponse {
	temp_token: string
}

export interface VerifyResetPasswordRequest {
	code: string
	newPassword: string
}

export interface VerifyResetPasswordResponse {
	message: string
}

export interface ResendResetPasswordResponse {
	message: string
}

export const resetPassword = (data: ResetPasswordRequest) => {
	return http.post<ResetPasswordResponse>('/api/admin/auth/reset', data)
}

export const verifyResetPassword = (data: VerifyResetPasswordRequest, tempToken: string) => {
	return http.post<VerifyResetPasswordResponse>('/api/admin/auth/reset/verify', data, {
		headers: {
			'Temp-Token': tempToken,
		},
	})
}

export const resendResetPasswordCode = (tempToken: string) => {
	return http.post<ResendResetPasswordResponse>('/api/admin/auth/reset/resend', {}, {
		headers: {
			'Temp-Token': tempToken,
		},
	})
}

export const logoutUser = () => {
	return http.post<{ message: string }>('/api/admin/auth/logout')
}

export interface TwoFAStatusResponse {
	is_2fa_enabled: boolean
	backup_codes_remaining: number
}

export interface Setup2FAResponse {
	totp_uri: string
	qr_code_base64: string
	backup_codes: string[]
}

export interface Confirm2FARequest {
	code: string
}

export interface Confirm2FAResponse {
	message: string
}

export interface Disable2FARequest {
	password: string
}

export interface Disable2FAResponse {
	message: string
}

export interface RegenerateBackupCodesRequest {
	code: string
}

export interface RegenerateBackupCodesResponse {
	backup_codes: string[]
}

export const get2FAStatus = () => {
	return http.get<TwoFAStatusResponse>('/api/admin/auth/2fa/status')
}

export const setup2FA = () => {
	return http.post<Setup2FAResponse>('/api/admin/auth/2fa/setup')
}

export const confirm2FA = (data: Confirm2FARequest) => {
	return http.post<Confirm2FAResponse>('/api/admin/auth/2fa/confirm', data)
}

export const disable2FA = (data: Disable2FARequest) => {
	return http.post<Disable2FAResponse>('/api/admin/auth/2fa/disable', data)
}

export const regenerateBackupCodes = (data: RegenerateBackupCodesRequest) => {
	return http.post<RegenerateBackupCodesResponse>('/api/admin/auth/2fa/backup-codes/regenerate', data)
}

export interface UserInfoResponse {
	name: string
	email: string
	user_type: number
}

export const getUserInfo = () => {
	return http.get<UserInfoResponse>('/api/admin/auth/settings/info')
}

export type DeviceType = 'PC' | 'Mobile' | 'Tablet' | 'Bot' | 'Unknown'

export interface Device {
	session_id: number
	browser: string
	os: string
	device_type: DeviceType
	created_at: string
	is_current: boolean
}

export interface DevicesResponse {
	devices: Device[]
	total: number
}

export interface LogoutAllDevicesResponse {
	message: string
	revoked_count: number
}

export interface LogoutDeviceResponse {
	message: string
}

export const getDevices = () => {
	return http.get<DevicesResponse>('/api/admin/auth/settings/devices')
}

export const logoutDevice = (sessionId: number) => {
	return http.delete<LogoutDeviceResponse>(`/api/admin/auth/settings/devices/${sessionId}`)
}

export const logoutAllDevices = () => {
	return http.post<LogoutAllDevicesResponse>('/api/admin/auth/settings/logout-all')
}
