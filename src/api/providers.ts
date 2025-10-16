import { getAuthHeaders, logout } from './auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export type Provider = { id: number; cuit: string; companyName: string }

export async function searchProviders(q: string): Promise<Provider[]> {
  const res = await fetch(`${BASE_URL}/providers/search?q=${encodeURIComponent(q)}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })
  if (!res.ok) throw new Error(await res.text() || 'Error buscando proveedores')
  return res.json()
}

export async function fetchProviders(): Promise<Provider[]> {
  const headers = getAuthHeaders()
  const r = await fetch('https://miadmin-d03d0c76af30.herokuapp.com/v1/retenciones/providers', {
    headers,
  })
  if (r.status === 401) {
    // Forzar logout para re-login
    logout()
    throw new Error('AUTH')
  }
  if (!r.ok) throw new Error('FAILED')
  const json = await r.json()
  return (Array.isArray(json) ? json : []).map((p: any) => ({
    id: p.id,
    cuit: String(p.cuit || '').trim(),
    companyName: String(p.companyName || '').trim(),
  }))
}
