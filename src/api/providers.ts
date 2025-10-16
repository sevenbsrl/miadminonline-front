import { getAuthHeaders, logout } from './auth'

const BASE_URL_HEROKU = 'https://miadmin-d03d0c76af30.herokuapp.com/v1/retenciones'

export type ProviderBasic = { id: number; cuit: string; companyName: string }
export type ProviderFull = ProviderBasic & {
  address: string
  phone: string | null
  fiscalCondition: 'RI' | 'MT' | 'EX'
  agreement: boolean
  iibbExcept: boolean
  municipalityExcept: boolean
}

export async function fetchProviders(): Promise<ProviderBasic[]> {
  const r = await fetch(`${BASE_URL_HEROKU}/providers`, { headers: { ...getAuthHeaders() } })
  if (r.status === 401) { logout(); throw new Error('AUTH') }
  if (!r.ok) throw new Error('FAILED')
  const json = await r.json()
  return (Array.isArray(json) ? json : []).map((p: any) => ({ id: p.id, cuit: String(p.cuit||'').trim(), companyName: String(p.companyName||'').trim() }))
}

export async function fetchProvidersFull(): Promise<ProviderFull[]> {
  const r = await fetch(`${BASE_URL_HEROKU}/providers`, { headers: { ...getAuthHeaders() } })
  if (r.status === 401) { logout(); throw new Error('AUTH') }
  if (!r.ok) throw new Error('FAILED')
  const json = await r.json()
  return (Array.isArray(json) ? json : []).map((p: any) => ({
    id: p.id,
    cuit: String(p.cuit||'').trim(),
    companyName: String(p.companyName||'').trim(),
    address: String(p.address||'').trim(),
    phone: p.phone ?? null,
    fiscalCondition: (p.fiscalCondition as 'RI'|'MT'|'EX') ?? 'RI',
    agreement: Boolean(p.agreement),
    iibbExcept: Boolean(p.iibbExcept),
    municipalityExcept: Boolean(p.municipalityExcept),
  }))
}

export type ProviderSavePayload = {
  companyName: string
  cuit: string
  address: string
  phone: string
  fiscalCondition: 'RI' | 'MT' | 'EX'
  agreement: boolean
  iibbExcept: boolean
  municipalityExcept: boolean
}

export async function createProvider(payload: ProviderSavePayload): Promise<ProviderFull> {
  const r = await fetch(`${BASE_URL_HEROKU}/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })
  if (r.status === 401) { logout(); throw new Error('AUTH') }
  if (!r.ok) throw new Error(await r.text() || 'Error creando proveedor')
  return r.json()
}

export async function updateProvider(id: number, payload: ProviderSavePayload): Promise<ProviderFull> {
  const r = await fetch(`${BASE_URL_HEROKU}/providers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })
  if (r.status === 401) { logout(); throw new Error('AUTH') }
  if (!r.ok) throw new Error(await r.text() || 'Error actualizando proveedor')
  return r.json()
}
