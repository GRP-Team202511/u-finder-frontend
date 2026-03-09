import http from './http'
import type { ProgramCardData } from '@/types/chat'

export type FavouriteItem = {
	unit_id: string
	liked_at: string
	program: ProgramCardData
}

export type FavouriteListResponse = {
	data: FavouriteItem[]
}

export type FavouriteStatusResponse = {
	unit_id: string
	is_liked: boolean
}

export const getFavouriteUniversities = () =>
	http.get<FavouriteListResponse>('/profile/liked-university')

export const addFavouriteUniversity = (unitId: string) =>
	http.post<FavouriteStatusResponse>(`/profile/liked-university/${unitId}`)

export const deleteFavouriteUniversity = (unitId: string) =>
	http.delete<FavouriteStatusResponse>(`/profile/liked-university/${unitId}`)

export const checkFavouriteUniversity = (program: ProgramCardData) =>
	http.post<FavouriteStatusResponse>('/profile/liked-university/check', program)
