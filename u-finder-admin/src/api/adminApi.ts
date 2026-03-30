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
	user_type: number | string
}

function unwrapPayload(raw: unknown): Record<string, unknown> {
	if (!raw || typeof raw !== 'object') return {}
	const top = raw as Record<string, unknown>
	const nested = top.data
	if (nested && typeof nested === 'object') {
		return nested as Record<string, unknown>
	}
	return top
}

function normalizeUserType(value: unknown): number | string {
	if (typeof value === 'number') return value
	if (typeof value !== 'string') return 0

	const trimmed = value.trim()
	if (/^\d+$/.test(trimmed)) return Number(trimmed)

	const role = trimmed.toLowerCase().replace(/_/g, ' ')
	if (role === 'user' || role === 'free') return 1
	if (role === 'pro user' || role === 'pro') return 2
	if (role === 'admin') return 3
	if (role === 'super admin') return 4

	return trimmed
}

function normalizeUserInfo(raw: unknown): UserInfoResponse {
	const payload = unwrapPayload(raw)
	const userObject = payload.user
	const userRecord = userObject && typeof userObject === 'object'
		? (userObject as Record<string, unknown>)
		: null

	const nameCandidate = payload.name ?? payload.username ?? payload.admin_name ?? payload.user_name ?? userRecord?.name
	const emailCandidate =
		payload.email ??
		payload.email_address ??
		payload.user_email ??
		payload.admin_email ??
		payload.mail ??
		payload.account ??
		userRecord?.email ??
		userRecord?.email_address
	const userTypeCandidate = payload.user_type ?? payload.type ?? payload.role

	return {
		name: typeof nameCandidate === 'string' ? nameCandidate : '',
		email: typeof emailCandidate === 'string' ? emailCandidate : '',
		user_type: normalizeUserType(userTypeCandidate),
	}
}

const SETTINGS_INFO_ENDPOINTS = ['/api/admin/auth/settings/info', '/api/admin/settings/info'] as const

export const getUserInfo = async () => {
	let lastError: unknown = null

	for (const endpoint of SETTINGS_INFO_ENDPOINTS) {
		try {
			const response = await http.get<unknown>(endpoint)
			return {
				...response,
				data: normalizeUserInfo(response.data),
			}
		} catch (error: unknown) {
			const status = (error as any)?.response?.status
			lastError = error
			if (status !== 404) break
		}
	}

	throw lastError
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

// ──────── Avatar ────────

export interface AvatarUploadResponse {
	message: string
	avatar_urls: Record<string, string>
}

export interface AvatarDeleteResponse {
	message: string
}

export interface GetAvatarResponse {
	url: string | null
}

export const getAvatar = (size: string = '256x256') => {
	return http.get<GetAvatarResponse>('/api/admin/auth/settings/avatar', { params: { size } })
}

export const uploadAvatar = (file: File) => {
	const formData = new FormData()
	formData.append('file', file)
	return http.put<AvatarUploadResponse>('/api/admin/auth/settings/avatar', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
}

export const deleteAvatar = () => {
	return http.delete<AvatarDeleteResponse>('/api/admin/auth/settings/avatar')
}

// ──────── Account Deletion ────────

export interface DeleteAccountResponse {
	temp_token: string
	verification: '2fa' | 'email'
}

export interface VerifyDeleteRequest {
	code: string
}

export interface DeleteVerifyResponse {
	message: string
}

export const deleteAccount = () => {
	return http.delete<DeleteAccountResponse>('/auth/delete')
}

export const verifyDeleteWith2FA = (data: VerifyDeleteRequest, tempToken: string) => {
	return http.post<DeleteVerifyResponse>('/auth/delete/2fa', data, {
		headers: { 'Temp-Token': tempToken },
	})
}

export const verifyDeleteWithEmail = (data: VerifyDeleteRequest, tempToken: string) => {
	return http.post<DeleteVerifyResponse>('/auth/delete/email', data, {
		headers: { 'Temp-Token': tempToken },
	})
}
