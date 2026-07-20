export interface ApiEnvelope<T> {
  success: boolean
  message: string
  timestamp: string
  data?: T
  errors?: Array<{ field?: string; message?: string }> | string[]
}

export interface LoginPayload {
  email?: string
  phone?: string
  password: string
}

export interface RegisterPayload {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  role?: 'user' | 'vendor'
  businessName?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function postJson<TResponse, TPayload>(
  path: string,
  payload: TPayload
): Promise<ApiEnvelope<TResponse>> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as ApiEnvelope<TResponse>
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
  confirmPassword: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    postJson<{ user: unknown; roleData: unknown; tokens: unknown }, LoginPayload>(
      '/api/v1/auth/login',
      payload
    ),

  register: (payload: RegisterPayload) =>
    postJson<{ user: unknown; message?: string }, RegisterPayload>(
      '/api/v1/auth/register',
      payload
    ),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    postJson<undefined, ForgotPasswordPayload>('/api/v1/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    postJson<undefined, ResetPasswordPayload>('/api/v1/auth/reset-password', payload),
}

