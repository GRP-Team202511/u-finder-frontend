import type { ConversationsResponse, ConversationMessagesResponse } from '@/types/chat'
import http from './http'

type StreamOptions = {
  message: string
  conversationId: string | null
  token?: string
  onPayload: (payload: string) => void
}

const getStreamUrl = (conversationId: string | null) => {
  const baseUrl = (import.meta.env.VITE_BASE_URL as string | undefined) ?? ""
  const normalized = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  const conversationParam = conversationId ?? "null"
  return normalized
    ? `${normalized}/chat/${conversationParam}`
    : `/chat/${conversationParam}`
}

const consumeSseBuffer = (
  buffer: string,
  onPayload: (payload: string) => void
) => {
  let normalized = buffer.replace(/\r\n/g, "\n")
  let boundary = normalized.indexOf("\n\n")
  while (boundary !== -1) {
    const block = normalized.slice(0, boundary)
    normalized = normalized.slice(boundary + 2)
    const dataLines = block
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
    const data = dataLines.join("\n")
    if (data) onPayload(data)
    boundary = normalized.indexOf("\n\n")
  }
  return normalized
}

export const streamChat = (options: StreamOptions) => {
  const controller = new AbortController()
  const done = (async () => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`
    }

    const response = await fetch(getStreamUrl(options.conversationId), {
      method: "POST",
      headers,
      body: JSON.stringify({ message: options.message }),
      signal: controller.signal,
    })

    if (!response.ok || !response.body) {
      throw new Error("Stream request failed")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      buffer = consumeSseBuffer(buffer, options.onPayload)
    }

    buffer += decoder.decode()
    if (buffer.trim()) {
      consumeSseBuffer(`${buffer}\n\n`, options.onPayload)
    }
  })()

  return { controller, done }
}

export const getConversations = async (params?: {
  last_id?: string
  limit?: number
}): Promise<ConversationsResponse> => {
  const response = await http.get<ConversationsResponse>('/chat/conversations', {
    params: {
      last_id: params?.last_id,
      limit: params?.limit,
    },
  })
  
  return response.data
}

export const getConversationMessages = async (params: {
  conversationId: string
  first_id?: string
  limit?: number
}): Promise<ConversationMessagesResponse> => {
  const response = await http.get<ConversationMessagesResponse>('/chat/messages', {
    params: {
      conversationId: params.conversationId,
      first_id: params.first_id,
      limit: params.limit,
    },
  })
  
  return response.data
}
