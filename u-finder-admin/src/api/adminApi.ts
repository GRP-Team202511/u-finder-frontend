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
	const response = await http.post<AdminLoginResponse | AdminLoginTwoFactorResponse>('/auth/login', data)

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
