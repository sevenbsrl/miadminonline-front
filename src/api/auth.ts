const BASE_URL = 'https://miadmin-d03d0c76af30.herokuapp.com'

export type LoginResponse = { loginToken?: string; token?: string; accessToken?: string; jwt?: string; idToken?: string; data?: { token?: string; loginToken?: string } } | any

function extractToken(payload: any): string | null {
  const candidates = [
    payload?.loginToken,
    payload?.token,
    payload?.accessToken,
    payload?.jwt,
    payload?.idToken,
    payload?.data?.loginToken,
    payload?.data?.token,
  ]
  const tok = candidates.find((t) => typeof t === 'string' && t.trim().length > 0)
  return tok ? String(tok).trim() : null
}

export async function login(username: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${BASE_URL}/v1/retenciones/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Error de autenticación')
  }
  const data = (await res.json()) as LoginResponse
  const token = extractToken(data)
  if (!token) {
    // Evitar almacenar valores inválidos y fallar explícitamente
    localStorage.removeItem('token')
    throw new Error('Respuesta de login inválida: token no encontrado')
  }
  localStorage.setItem('token', token)
  return { token }
}

export function getAuthHeaders(): Record<string, string> {
  const raw = localStorage.getItem('token')
  const token = (raw ?? '').trim()
  if (!token || token === 'undefined' || token === 'null') {
    // No enviar header inválido
    return {}
  }
  return { Authorization: `Bearer ${token}` }
}

export function logout() {
  localStorage.removeItem('token')
}
