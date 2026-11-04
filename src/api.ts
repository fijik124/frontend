export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string[]>) { super(message) }
}
const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
export async function apiResponse(path: string, options: RequestInit = {}) {
  let response: Response
  try {
    response = await fetch(`${base}/api${path}`, { ...options, credentials: 'include',
      signal: options.signal ?? AbortSignal.timeout(15000),
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } })
  } catch { throw new ApiError(0, 'NETWORK_ERROR', 'Server nie je dostupný. Skontrolujte pripojenie a skúste to znova.') }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    if (response.status === 401 && !path.startsWith('/auth/sign-in')) window.dispatchEvent(new Event('amk:session-expired'))
    throw new ApiError(response.status, data.error?.code ?? data.code ?? 'API_ERROR', data.error?.message ?? data.message ?? 'Požiadavku sa nepodarilo spracovať.', data.error?.fields)
  }
  return response
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiResponse(path, options)
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}
export const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) })
